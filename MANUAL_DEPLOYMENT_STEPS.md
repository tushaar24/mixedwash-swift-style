# Manual Deployment Steps for Email Notifications

Since Supabase CLI is not installed, follow these manual steps to deploy the email notification system.

## Step 1: Deploy Edge Function via Supabase Dashboard

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `ainlzqfaijqluyuqdojj`
3. **Navigate to Edge Functions**: Left sidebar > Edge Functions
4. **Create new function**:
   - Click "Create a new function"
   - Name: `send-order-email`
   - Copy and paste the code from: `supabase/functions/send-order-email/index.ts`

## Step 2: Set Environment Variables

1. **Go to Settings > Environment Variables** in Supabase Dashboard
2. **Add these variables**:
   - `RESEND_API_KEY` = `re_GLt6Tjfa_Bx4ByW8oLnjgQiokDaWTFEbF`
   - `ADMIN_EMAIL` = `admin@mixedwash.com` (or your preferred email)

## Step 3: Deploy Database Migration

1. **Go to Database > SQL Editor** in Supabase Dashboard
2. **Create new query** and paste the content from: `supabase/migrations/20250727000000_add_order_email_trigger.sql`
3. **Run the query** to create the trigger

## Step 4: Alternative - Simple Trigger (If HTTP extensions are not available)

If the main trigger doesn't work, use this simplified version:

```sql
-- Simple notification trigger (paste this in SQL Editor)
CREATE OR REPLACE FUNCTION simple_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the new order (you can check logs in Dashboard)
  RAISE LOG 'New order created: ID=%, User=%, Service=%', NEW.id, NEW.user_id, NEW.service_id;

  -- Insert into a notifications table for manual processing
  INSERT INTO order_email_queue (order_id, status, created_at)
  VALUES (NEW.id, 'pending', NOW())
  ON CONFLICT (order_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create notifications queue table
CREATE TABLE IF NOT EXISTS order_email_queue (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  UNIQUE(order_id)
);

-- Create the trigger
DROP TRIGGER IF EXISTS simple_order_notification_trigger ON orders;
CREATE TRIGGER simple_order_notification_trigger
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION simple_order_notification();
```

## Step 5: Test the System

### Option A: Test via Dashboard (Recommended)

1. **Go to Edge Functions > send-order-email** in Supabase Dashboard
2. **Click "Invoke Function"**
3. **Use this test payload**:

```json
{
  "record": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": "user-123",
    "service_id": "service-123",
    "address_id": "address-123",
    "pickup_date": "2024-01-15",
    "pickup_slot_id": "slot-123",
    "delivery_date": "2024-01-17",
    "delivery_slot_id": "slot-456",
    "special_instructions": "Handle with care",
    "created_at": "2024-01-01T10:00:00Z"
  }
}
```

4. **Check the logs** in the Functions tab to see if it executed successfully
5. **Check your admin email** to see if you received the notification

### Option B: Test by Creating Real Order

1. **Use your app** to create a real order
2. **Check admin email** for notification
3. **Monitor logs** in Supabase Dashboard > Functions > Logs

## Step 6: Verify Everything Works

✅ **Checklist:**
- [ ] Edge Function deployed and visible in Dashboard
- [ ] Environment variables set (RESEND_API_KEY, ADMIN_EMAIL)
- [ ] Database trigger created (visible in Database > Triggers)
- [ ] Test email received when function is invoked
- [ ] Real order creation sends email

## Troubleshooting

### If emails are not being sent:

1. **Check Function Logs**:
   - Go to Edge Functions > send-order-email > Logs
   - Look for error messages

2. **Check Environment Variables**:
   - Go to Settings > Environment Variables
   - Verify RESEND_API_KEY and ADMIN_EMAIL are set

3. **Test Resend API Key**:
   - Go to https://resend.com/api-keys
   - Verify the key is active and has permissions

4. **Check Trigger Execution**:
   - Go to Database > Logs
   - Look for trigger execution messages

### Common Issues:

- **"Function not found"**: Redeploy the Edge Function
- **"Invalid API key"**: Check RESEND_API_KEY in environment variables
- **"No email received"**: Check spam folder, verify ADMIN_EMAIL
- **"Trigger not firing"**: Check trigger exists in Database > Triggers

## Alternative: Manual Email Processing

If automatic triggers don't work, you can process emails manually:

1. **Query pending notifications**:
```sql
SELECT * FROM order_email_queue WHERE status = 'pending';
```

2. **Manually invoke Edge Function** for each pending order
3. **Mark as processed**:
```sql
UPDATE order_email_queue SET status = 'processed', processed_at = NOW() WHERE order_id = 'your-order-id';
```

## Support

If you need help:
1. Check Supabase Dashboard logs first
2. Verify all environment variables are set
3. Test the Edge Function independently before testing the full flow
