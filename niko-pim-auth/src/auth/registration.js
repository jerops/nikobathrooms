import { getSupabase } from '../api/supabase-client.js';
import { USER_ROLES } from '../config/environment.js';

export async function registerUser(email, password, name, userType) {
    const supabase = getSupabase();
    
    try {
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
        
        return { success: true, user: authData.user };
    } catch (error) {
        console.error('Registration failed:', error);
        return { success: false, error: error.message };
    }
}