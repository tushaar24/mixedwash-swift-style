-- Create a trigger function that calls the Edge Function when a new order is inserted
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
BEGIN
  -- Create payload with the new order data
  payload := jsonb_build_object(
    'record', to_jsonb(NEW)
  );
  
  -- Call the Edge Function using pg_net (HTTP request)
  -- Note: pg_net extension needs to be enabled for this to work
  SELECT net.http_post(
    url := (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/send-order-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY')
    ),
    body := payload
  ) AS request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS on_order_created ON orders;
CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Alternative approach using supabase_functions.http_request if pg_net is not available
-- This is a fallback method that should work in most Supabase environments

CREATE OR REPLACE FUNCTION notify_new_order_fallback()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT;
  service_role_key TEXT;
  payload JSONB;
BEGIN
  -- Get the Supabase URL and service role key from environment
  function_url := current_setting('app.supabase_url', true) || '/functions/v1/send-order-email';
  service_role_key := current_setting('app.service_role_key', true);
  
  -- If environment variables are not set, use hardcoded values (not recommended for production)
  IF function_url IS NULL OR function_url = '/functions/v1/send-order-email' THEN
    function_url := 'https://ainlzqfaijqluyuqdojj.supabase.co/functions/v1/send-order-email';
  END IF;
  
  -- Create payload with the new order data
  payload := jsonb_build_object(
    'record', to_jsonb(NEW)
  );
  
  -- Use HTTP extension if available
  PERFORM http_post(
    function_url,
    payload::text,
    'application/json',
    jsonb_build_object(
      'Authorization', 'Bearer ' || COALESCE(service_role_key, current_setting('app.service_role_key', true))
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the order insertion
    RAISE LOG 'Failed to send order notification email: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comment: If the main trigger fails due to missing extensions, 
-- you can manually replace the trigger function:
-- DROP TRIGGER IF EXISTS on_order_created ON orders;
-- CREATE TRIGGER on_order_created
--   AFTER INSERT ON orders
--   FOR EACH ROW
--   EXECUTE FUNCTION notify_new_order_fallback();