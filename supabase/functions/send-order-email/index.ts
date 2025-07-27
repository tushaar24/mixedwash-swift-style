import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderData {
  id: string
  user_id: string
  service_id: string
  address_id: string
  pickup_date: string
  pickup_slot_id: string
  delivery_date: string
  delivery_slot_id: string
  special_instructions?: string
  created_at: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { record }: { record: OrderData } = await req.json()
    
    console.log('Received order data:', record)

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@mixedwash.com'

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    // Fetch additional order details from database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabaseHeaders = {
      'Authorization': `Bearer ${supabaseKey}`,
      'apikey': supabaseKey,
      'Content-Type': 'application/json',
    }

    // Get service details
    const serviceResponse = await fetch(`${supabaseUrl}/rest/v1/services?id=eq.${record.service_id}&select=*`, {
      headers: supabaseHeaders
    })
    const serviceData = await serviceResponse.json()
    const service = serviceData[0]

    // Get user profile
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${record.user_id}&select=*`, {
      headers: supabaseHeaders
    })
    const profileData = await profileResponse.json()
    const profile = profileData[0]

    // Get address details
    const addressResponse = await fetch(`${supabaseUrl}/rest/v1/addresses?id=eq.${record.address_id}&select=*`, {
      headers: supabaseHeaders
    })
    const addressData = await addressResponse.json()
    const address = addressData[0]

    // Get time slot details
    const pickupSlotResponse = await fetch(`${supabaseUrl}/rest/v1/time_slots?id=eq.${record.pickup_slot_id}&select=*`, {
      headers: supabaseHeaders
    })
    const pickupSlotData = await pickupSlotResponse.json()
    const pickupSlot = pickupSlotData[0]

    const deliverySlotResponse = await fetch(`${supabaseUrl}/rest/v1/time_slots?id=eq.${record.delivery_slot_id}&select=*`, {
      headers: supabaseHeaders
    })
    const deliverySlotData = await deliverySlotResponse.json()
    const deliverySlot = deliverySlotData[0]

    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          🆕 New Order Received
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${record.id}</p>
          <p><strong>Service:</strong> ${service?.name || 'Unknown Service'}</p>
          <p><strong>Price:</strong> ₹${service?.price || 'N/A'}${service?.name?.toLowerCase().includes('dry cleaning') ? '' : '/kg'}</p>
          <p><strong>Order Date:</strong> ${new Date(record.created_at).toLocaleString()}</p>
        </div>

        <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #17a2b8; margin-top: 0;">Customer Information</h3>
          <p><strong>Name:</strong> ${profile?.username || 'Not provided'}</p>
          <p><strong>Email:</strong> ${profile?.email || 'Not provided'}</p>
          <p><strong>Mobile:</strong> ${profile?.mobile_number || 'Not provided'}</p>
        </div>

        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #28a745; margin-top: 0;">Schedule</h3>
          <p><strong>Pickup Date:</strong> ${new Date(record.pickup_date).toLocaleDateString()}</p>
          <p><strong>Pickup Time:</strong> ${pickupSlot?.start_time || 'Unknown'} - ${pickupSlot?.end_time || 'Unknown'}</p>
          <p><strong>Delivery Date:</strong> ${new Date(record.delivery_date).toLocaleDateString()}</p>
          <p><strong>Delivery Time:</strong> ${deliverySlot?.start_time || 'Unknown'} - ${deliverySlot?.end_time || 'Unknown'}</p>
        </div>

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">Address</h3>
          <p>${address?.house_building || ''} ${address?.address_line1 || ''}</p>
          ${address?.address_line2 ? `<p>${address.address_line2}</p>` : ''}
          <p>${address?.area || ''}, ${address?.city || ''}, ${address?.state || ''} ${address?.postal_code || ''}</p>
        </div>

        ${record.special_instructions ? `
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">Special Instructions</h3>
            <p>${record.special_instructions}</p>
          </div>
        ` : ''}

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 12px;">
          <p>This email was automatically generated when a new order was placed on MixedWash.</p>
        </div>
      </div>
    `

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'MixedWash Orders <orders@mixedwash.com>',
        to: [ADMIN_EMAIL],
        subject: `🆕 New Order: ${service?.name || 'Laundry Service'} - ${profile?.username || 'Customer'}`,
        html: emailHtml,
      }),
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Resend API error:', errorText)
      throw new Error(`Failed to send email: ${emailResponse.status} ${errorText}`)
    }

    const emailResult = await emailResponse.json()
    console.log('Email sent successfully:', emailResult)

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})