# Email Notification Deployment Guide

This guide helps you deploy the automatic email notification system for new orders.

## Prerequisites

1. **Supabase CLI installed** - Install from https://supabase.com/docs/guides/cli
2. **Resend API Key** - Get from https://resend.com/api-keys
3. **Supabase project access** - Admin access to your Supabase project

## Deployment Steps

### 1. Set Environment Variables

Set the required environment variables in your Supabase project:

```bash
# Set Resend API Key
supabase secrets set RESEND_API_KEY=re_GLt6Tjfa_Bx4ByW8oLnjgQiokDaWTFEbF

# Set admin email (replace with your actual admin email)
supabase secrets set ADMIN_EMAIL=admin@mixedwash.com
```

### 2. Deploy Edge Function

Deploy the email sending Edge Function:

```bash
# Deploy the function
supabase functions deploy send-order-email

# Verify deployment
supabase functions list
```

### 3. Run Database Migration

Apply the database trigger migration:

```bash
# Apply the migration
supabase db push

# Or if you prefer to run the migration file directly:
# supabase db reset --linked
```

### 4. Test the Integration

Test that everything works:

```bash
# Test the Edge Function directly (optional)
supabase functions invoke send-order-email --data '{
  "record": {
    "id": "test-id",
    "user_id": "test-user",
    "service_id": "test-service",
    "address_id": "test-address",
    "pickup_date": "2024-01-01",
    "pickup_slot_id": "test-slot",
    "delivery_date": "2024-01-03",
    "delivery_slot_id": "test-slot",
    "created_at": "2024-01-01T10:00:00Z"
  }
}'
```

### 5. Verify Email Configuration

1. Create a test order through your application
2. Check that an email is sent to the configured admin email
3. Monitor Supabase logs for any errors:
   ```bash
   supabase functions logs send-order-email
   ```

## Troubleshooting

### Common Issues

1. **Edge Function not found**
   - Ensure you're logged into the correct Supabase project
   - Verify the function was deployed: `supabase functions list`

2. **Email not being sent**
   - Check Resend API key is correct: `supabase secrets list`
   - Verify admin email is set: `supabase secrets get ADMIN_EMAIL`
   - Check function logs: `supabase functions logs send-order-email`

3. **Trigger not firing**
   - Verify migration was applied: Check in Supabase Dashboard > Database > Triggers
   - Ensure the trigger function exists in the database

4. **Permission errors**
   - Make sure you have admin access to the Supabase project
   - Check that the service role key has proper permissions

### Monitoring

Monitor the email notifications:

1. **Supabase Dashboard**: Functions > send-order-email > Logs
2. **Resend Dashboard**: Check email delivery status at https://resend.com/emails
3. **Database logs**: Monitor for trigger execution in Supabase logs

## Configuration Notes

- **Email sender**: Currently set to `orders@mixedwash.com` - update in the Edge Function if needed
- **Admin email**: Set via environment variable `ADMIN_EMAIL`
- **Trigger**: Fires on every INSERT to the `orders` table
- **Error handling**: If email fails, order creation still succeeds (logged error only)

## Security

- Resend API key is stored securely in Supabase secrets
- Edge Function uses service role key for database access
- Email content includes order details but no sensitive payment information