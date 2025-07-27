-- Drop the current trigger that's failing
DROP TRIGGER IF EXISTS trigger_notify_new_order_direct ON orders;
DROP FUNCTION IF EXISTS notify_new_order_direct();

-- Create the corrected HTTP trigger function using the right extension
CREATE OR REPLACE FUNCTION notify_new_order_direct()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the send-order-email edge function using net.http_post
  PERFORM net.http_post(
    url := 'https://ainlzqfaijqluyuqdojj.supabase.co/functions/v1/send-order-email',
    headers := json_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := json_build_object('record', row_to_json(NEW))::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call edge function directly on new orders
CREATE TRIGGER trigger_notify_new_order_direct
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order_direct();