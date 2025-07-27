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

interface FrontendOrderDetails {
  services: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  pickupDate: string;
  pickupSlot: string;
  deliveryDate: string;
  deliverySlot: string;
  address: string;
  dryCleaningItems: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  specialInstructions?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json()
    console.log('Received request data:', requestData)

    // Extract orderDetails from the request
    const orderDetails: FrontendOrderDetails = requestData.orderDetails
    
    if (!orderDetails) {
      throw new Error('Invalid request format - missing orderDetails')
    }
    
    console.log('Processing frontend order details:', orderDetails)

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const ADMIN_EMAIL = Deno.env.get('ADMIN_EMAIL') || 'admin@mixedwash.com'

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    // For frontend format, we already have the display data
    // Calculate total for dry cleaning items
    const dryCleaningTotal = orderDetails.dryCleaningItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );

    // Create email content using frontend data
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          🆕 New Order Received
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-top: 0;">Services Ordered</h3>
          ${orderDetails.services.map(service => `
            <div style="margin-bottom: 10px; padding: 10px; border-left: 3px solid #007bff;">
              <p><strong>Service:</strong> ${service.name}</p>
              <p><strong>Price:</strong> ₹${service.price}${service.name.toLowerCase().includes('dry cleaning') ? '' : '/kg'}</p>
            </div>
          `).join('')}
          <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
        </div>

        ${orderDetails.dryCleaningItems.length > 0 ? `
          <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #17a2b8; margin-top: 0;">Dry Cleaning Items</h3>
            ${orderDetails.dryCleaningItems.map(item => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>${item.name} × ${item.quantity}</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            `).join('')}
            <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; font-weight: bold;">
              <div style="display: flex; justify-content: space-between;">
                <span>Items Total:</span>
                <span>₹${dryCleaningTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ` : ''}

        <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #28a745; margin-top: 0;">Schedule</h3>
          <p><strong>Pickup Date:</strong> ${new Date(orderDetails.pickupDate).toLocaleDateString()}</p>
          <p><strong>Pickup Time:</strong> ${orderDetails.pickupSlot}</p>
          <p><strong>Delivery Date:</strong> ${new Date(orderDetails.deliveryDate).toLocaleDateString()}</p>
          <p><strong>Delivery Time:</strong> ${orderDetails.deliverySlot}</p>
        </div>

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">Address</h3>
          <p>${orderDetails.address}</p>
        </div>

        ${orderDetails.specialInstructions ? `
          <div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">Special Instructions</h3>
            <p>${orderDetails.specialInstructions}</p>
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
        from: 'MixedWash Orders <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject: `🆕 New Order: ${orderDetails.services.map(s => s.name).join(', ')} - Customer Order`,
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