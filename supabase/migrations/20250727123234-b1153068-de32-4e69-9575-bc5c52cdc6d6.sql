-- Drop the problematic trigger and function
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
DROP FUNCTION IF EXISTS notify_new_order();

-- Create trigger using the simple notification function instead
CREATE TRIGGER trigger_simple_order_notification
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION simple_order_notification();