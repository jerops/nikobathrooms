// Niko PIM Core Authentication System
// Main authentication client and API interface
// Version: 2.0.0

(function(window) {
  'use strict';
  
  const CONFIG = {
    SUPABASE_URL: 'https://bzjoxjqfpmjhbfijthpp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ0MDUyMjQsImV4cCI6MjAzOTk4MTIyNH0.p5eJJqvF_HhMAVkqpvpWp7Gqy2qEFnq6MfI_kD8DfJQ',
    ROUTES: {
      CUSTOMER_DASHBOARD: '/dev/app/customer/dashboard',
      RETAILER_DASHBOARD: '/dev/app/retailer/dashboard'
    }
  };
  
  class NikoPIMAuth {
    constructor() {
      this.supabase = null;
      this.isInitialized = false;
      this.init();
    }
    
    async init() {
      console.log('🚀 Initializing Niko PIM Authentication...');
      
      // Load Supabase if not available
      if (typeof supabase === 'undefined') {
        await this.loadSupabase();
      }
      
      this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      this.isInitialized = true;
      
      console.log('✅ Niko PIM Authentication initialized');
    }
    
    loadSupabase() {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    
    async register(email, password, name, userType) {
      console.log('📝 Registering user:', { email, userType });
      
      if (!this.isInitialized) {
        throw new Error('Authentication system not initialized');
      }
      
      try {
        const { data, error } = await this.supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              name: name,
              user_type: userType,
              role: userType
            }
          }
        });
        
        if (error) {
          console.error('❌ Registration error:', error);
          return { success: false, error: error.message };
        }
        
        console.log('✅ Registration successful:', data.user?.email);
        
        // Create Webflow CMS record
        await this.createWebflowRecord(data.user.id, email, name, userType);
        
        return { success: true, user: data.user };
      } catch (error) {
        console.error('❌ Registration failed:', error);
        return { success: false, error: error.message };
      }
    }
    
    async login(email, password) {
      console.log('🔐 Logging in user:', { email });
      
      if (!this.isInitialized) {
        throw new Error('Authentication system not initialized');
      }
      
      try {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: email,
          password: password
        });
        
        if (error) {
          console.error('❌ Login error:', error);
          return { success: false, error: error.message };
        }
        
        console.log('✅ Login successful:', data.user?.email);
        return { success: true, user: data.user };
      } catch (error) {
        console.error('❌ Login failed:', error);
        return { success: false, error: error.message };
      }
    }
    
    async logout() {
      console.log('🚪 Logging out user...');
      
      if (!this.isInitialized) {
        throw new Error('Authentication system not initialized');
      }
      
      try {
        const { error } = await this.supabase.auth.signOut();
        
        if (error) {
          console.error('❌ Logout error:', error);
          return { success: false, error: error.message };
        }
        
        console.log('✅ Logout successful');
        return { success: true };
      } catch (error) {
        console.error('❌ Logout failed:', error);
        return { success: false, error: error.message };
      }
    }
    
    async getCurrentUser() {
      if (!this.isInitialized) return null;
      
      try {
        const { data: { user }, error } = await this.supabase.auth.getUser();
        if (error) throw error;
        return user;
      } catch (error) {
        console.error('❌ Get user failed:', error);
        return null;
      }
    }
    
    async isAuthenticated() {
      const user = await this.getCurrentUser();
      return !!user;
    }
    
    async createWebflowRecord(userId, email, name, userType) {
      try {
        const { data, error } = await this.supabase.functions.invoke('create-webflow-user', {
          body: {
            user_id: userId,
            email: email,
            name: name,
            user_type: userType
          }
        });
        
        if (error) {
          console.warn('⚠️ Webflow integration error (user still created in Supabase):', error);
        } else {
          console.log('✅ Webflow CMS record created');
        }
      } catch (error) {
        console.warn('⚠️ Edge function error:', error);
      }
    }
    
    getRedirectUrl(userType) {
      return userType === 'Customer' ? 
        CONFIG.ROUTES.CUSTOMER_DASHBOARD : 
        CONFIG.ROUTES.RETAILER_DASHBOARD;
    }
  }
  
  // Initialize and expose globally
  window.NikoPIM = new NikoPIMAuth();
  
})(window);