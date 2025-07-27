-- Create RLS policies for order_email_queue table
CREATE POLICY "Allow system to insert into order_email_queue" 
ON order_email_queue 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow system to select from order_email_queue" 
ON order_email_queue 
FOR SELECT 
USING (true);

CREATE POLICY "Allow system to update order_email_queue" 
ON order_email_queue 
FOR UPDATE 
USING (true);