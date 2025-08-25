import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { firebase_uid, user_type } = await req.json()
    
    const webflowToken = Deno.env.get('WEBFLOW_API_TOKEN')
    if (!webflowToken) {
      throw new Error('Webflow API token not configured')
    }

    const collectionId = user_type === 'Customer' 
      ? '68a6dc21ddfb81569ba773a4'  // Customers
      : '6738c46e5f48be10cf90c694'  // Retailers

    // Get all items from the collection
    const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${webflowToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Webflow API error: ${response.status} ${error}`)
    }

    const result = await response.json()
    
    // Find user by firebase-uid
    const user = result.items?.find(item => 
      item.fieldData['firebase-uid'] === firebase_uid
    )
    
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User not found in Webflow CMS' 
        }),
        { 
          status: 404,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: user.id,
          name: user.fieldData.name,
          email: user.fieldData.email,
          userType: user.fieldData['user-type'],
          isActive: user.fieldData['is-active'],
          registrationDate: user.fieldData['registration-date'],
          wishlistProducts: user.fieldData['wishlist-products'] || []
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error getting Webflow user:', error)
    
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