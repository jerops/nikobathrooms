import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const { user_id, email } = await req.json();
    
    if (!user_id && !email) {
      return new Response(
        JSON.stringify({ error: 'user_id or email required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Deleting user from Webflow CMS:', { user_id, email });

    const WEBFLOW_API_TOKEN = Deno.env.get('WEBFLOW_API_TOKEN');
    const SITE_ID = '689a10f985f363938ad27e47';
    const COLLECTION_ID = '689a11825aeb2debc18b7847'; // Your customers collection ID

    if (!WEBFLOW_API_TOKEN) {
      throw new Error('WEBFLOW_API_TOKEN not configured');
    }

    // First, get all items to find the one to delete
    const listResponse = await fetch(
      `https://api.webflow.com/v2/collections/${COLLECTION_ID}/items`,
      {
        headers: {
          'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      console.error('Failed to list Webflow items:', errorText);
      throw new Error(`Webflow list request failed: ${listResponse.status}`);
    }

    const listData = await listResponse.json();
    console.log('Found items:', listData.items?.length || 0);

    // Find the user by Firebase UID (which contains the Supabase user_id) or email
    let userToDelete = null;
    
    if (listData.items) {
      userToDelete = listData.items.find((item: any) => {
        const firebaseUid = item.fieldData?.['firebase-uid'];
        const itemEmail = item.fieldData?.email;
        
        // Match by user_id in Firebase UID or by email
        return (firebaseUid && firebaseUid.includes(user_id)) || 
               (email && itemEmail === email);
      });
    }

    if (!userToDelete) {
      console.log('User not found in Webflow CMS');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'User not found in CMS (already deleted or never existed)' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found user to delete:', userToDelete.id, userToDelete.fieldData?.email);

    // Delete the user from Webflow CMS
    const deleteResponse = await fetch(
      `https://api.webflow.com/v2/collections/${COLLECTION_ID}/items/${userToDelete.id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('Failed to delete from Webflow:', errorText);
      throw new Error(`Webflow delete failed: ${deleteResponse.status}`);
    }

    console.log('Successfully deleted user from Webflow CMS');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User deleted from Webflow CMS',
        deleted_item_id: userToDelete.id
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in delete-webflow-user function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});