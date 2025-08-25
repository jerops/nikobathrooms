import { getSupabase } from '../api/supabase-client.js';
import { USER_ROLES } from '../config/environment.js';

// Function to call Supabase Edge Function for Webflow user creation
async function createWebflowUserRecord(userData) {
    try {
        const supabase = getSupabase();
        
        const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/create-webflow-user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                user_id: userData.supabaseUserId,
                email: userData.email,
                name: userData.name,
                user_type: userData.userType
            })
        });

        const result = await response.json();
        
        if (!result.success) {
            console.error('Failed to create Webflow user record:', result.error);
            return { success: false, error: result.error };
        }

        console.log('Webflow user record created successfully:', result.webflow_id);
        return { success: true, webflowId: result.webflow_id };

    } catch (error) {
        console.error('Error calling Webflow Edge Function:', error);
        return { success: false, error: error.message };
    }
}

export async function registerUser(email, password, name, userType) {
    const supabase = getSupabase();
    
    try {
        // Step 1: Create Supabase auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name,
                    user_type: userType
                }
            }
        });
        
        if (authError) throw authError;
        
        // Step 2: Create corresponding Webflow CMS record
        const webflowResult = await createWebflowUserRecord({
            supabaseUserId: authData.user.id,
            email: email,
            name: name,
            userType: userType
        });
        
        if (!webflowResult.success) {
            console.warn('Supabase user created but Webflow record failed:', webflowResult.error);
            // Don't fail the registration - user can still authenticate
        }
        
        return { 
            success: true, 
            user: authData.user,
            webflowRecord: webflowResult.success ? { id: webflowResult.webflowId } : null
        };
        
    } catch (error) {
        console.error('Registration failed:', error);
        return { success: false, error: error.message };
    }
}