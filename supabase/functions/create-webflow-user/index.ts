import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, email, name, user_type } = await req.json()
    
    const webflowToken = Deno.env.get('WEBFLOW_API_TOKEN')
    if (!webflowToken) {
      throw new Error('Webflow API token not configured')
    }

    const collectionId = user_type === 'Customer' 
      ? '68a6dc21ddfb81569ba773a4'  // Customers
      : '6738c46e5f48be10cf90c694'  // Retailers

    const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${webflowToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        fieldData: {
          name,
          email,
          'firebase-uid': user_id,
          'user-type': user_type,
          'is-active': true,
          'registration-date': new Date().toISOString()
        }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Webflow API error: ${response.status} ${error}`)
    }

    const result = await response.json()
    
    return new Response(
      JSON.stringify({ success: true, webflow_id: result.id }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error creating Webflow user:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})