import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { firebase_uid, user_type, wishlist_products } = await req.json()
    
    const webflowToken = Deno.env.get('WEBFLOW_API_TOKEN')
    if (!webflowToken) {
      throw new Error('Webflow API token not configured')
    }

    const collectionId = user_type === 'Customer' 
      ? '68a6dc21ddfb81569ba773a4'  // Customers
      : '6738c46e5f48be10cf90c694'  // Retailers

    // First, get the user to find their Webflow ID
    const getUserResponse = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${webflowToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!getUserResponse.ok) {
      const error = await getUserResponse.text()
      throw new Error(`Webflow API error getting user: ${getUserResponse.status} ${error}`)
    }

    const getUserResult = await getUserResponse.json()
    const user = getUserResult.items?.find(item => 
      item.fieldData['firebase-uid'] === firebase_uid
    )
    
    if (!user) {
      throw new Error('User not found in Webflow CMS')
    }

    // Update the user's wishlist
    const updateResponse = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${webflowToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        fieldData: {
          'wishlist-products': wishlist_products
        }
      })
    })

    if (!updateResponse.ok) {
      const error = await updateResponse.text()
      throw new Error(`Webflow API error updating wishlist: ${updateResponse.status} ${error}`)
    }

    const result = await updateResponse.json()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Wishlist updated successfully',
        wishlist_count: wishlist_products.length
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error updating Webflow user wishlist:', error)
    
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