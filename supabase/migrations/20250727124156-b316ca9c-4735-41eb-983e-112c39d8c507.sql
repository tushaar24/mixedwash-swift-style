-- Enable the HTTP extension for making HTTP requests from triggers
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Drop the current simple trigger
DROP TRIGGER IF EXISTS trigger_simple_order_notification ON orders;

-- Create the direct HTTP trigger function
CREATE OR REPLACE FUNCTION notify_new_order_direct()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the send-order-email edge function directly
  PERFORM extensions.http_post(
    'https://ainlzqfaijqluyuqdojj.supabase.co/functions/v1/send-order-email',
    json_build_object('record', row_to_json(NEW))::text,
    'application/json'::text,
    ARRAY[
      extensions.http_header('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true))
    ]
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call edge function directly on new orders
CREATE TRIGGER trigger_notify_new_order_direct
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order_direct();