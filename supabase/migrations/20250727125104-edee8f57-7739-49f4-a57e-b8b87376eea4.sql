-- Drop the trigger that calls edge function on new orders
DROP TRIGGER IF EXISTS trigger_notify_new_order_direct ON orders;

-- Drop the function that calls the edge function
DROP FUNCTION IF EXISTS notify_new_order_direct();