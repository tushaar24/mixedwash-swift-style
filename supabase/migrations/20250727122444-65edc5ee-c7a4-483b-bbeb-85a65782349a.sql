-- Create function to notify about new orders
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the send-order-email edge function
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

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Create order email queue table for fallback/manual processing
CREATE TABLE IF NOT EXISTS order_email_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) UNIQUE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable RLS on order_email_queue
ALTER TABLE order_email_queue ENABLE ROW LEVEL SECURITY;

-- Create simple notification function as fallback
CREATE OR REPLACE FUNCTION simple_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the new order
  RAISE LOG 'New order created: ID=%, User=%, Service=%', NEW.id, NEW.user_id, NEW.service_id;

  -- Insert into notifications queue
  INSERT INTO order_email_queue (order_id, status, created_at)
  VALUES (NEW.id, 'pending', NOW())
  ON CONFLICT (order_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;