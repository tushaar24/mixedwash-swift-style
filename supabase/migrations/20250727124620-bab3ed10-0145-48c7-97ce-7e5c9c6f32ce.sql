-- Enable the pg_net extension if available
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Drop the current trigger
DROP TRIGGER IF EXISTS trigger_notify_new_order_direct ON orders;
DROP FUNCTION IF EXISTS notify_new_order_direct();

-- Create function using pg_net extension
CREATE OR REPLACE FUNCTION notify_new_order_direct()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the send-order-email edge function using pg_net
  PERFORM extensions.pg_net.http_post(
    'https://ainlzqfaijqluyuqdojj.supabase.co/functions/v1/send-order-email',
    json_build_object('record', row_to_json(NEW))::text,
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call edge function directly on new orders
CREATE TRIGGER trigger_notify_new_order_direct
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order_direct();