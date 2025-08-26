// NIKO AUTH CORE - THE ONLY AUTH FILE WE NEED v3.0
// This replaces ALL other auth files - use only this one!

(function(window) {
    'use strict';
    
    console.log('🚀 Loading Niko Auth Core v3.0 - The Only One');
    
    const CONFIG = {
        SUPABASE_URL: 'https://bzjoxjqfpmjhbfijthpp.supabase.co',
        SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ0MDUyMjQsImV4cCI6MjAzOTk4MTIyNH0.p5eJJqvF_HhMAVkqpvpWp7Gqy2qEFnq6MfI_kD8DfJQ'
    };
    
    class NikoAuthCore {
        constructor() {
            this.supabase = null;
            this.initialized = false;
            this.currentUser = null;
            this.init();
        }
        
        async init() {
            console.log('🔧 Initializing Niko Auth Core...');
            
            try {
                // Load Supabase if not already loaded
                if (typeof supabase === 'undefined') {
                    await this.loadSupabase();
                }
                
                // Create Supabase client
                this.supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
                
                // Check current user
                await this.checkCurrentUser();
                
                this.initialized = true;
                console.log('✅ Niko Auth Core initialized successfully');
                
                // Dispatch ready event
                window.dispatchEvent(new CustomEvent('NikoAuthCore:ready'));
                
            } catch (error) {
                console.error('❌ Auth Core initialization failed:', error);
                throw error;
            }
        }
        
        async loadSupabase() {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
                script.onload = () => {
                    console.log('📦 Supabase SDK loaded');
                    resolve();
                };
                script.onerror = () => {
                    console.error('❌ Failed to load Supabase SDK');
                    reject(new Error('Failed to load Supabase SDK'));
                };
                document.head.appendChild(script);
            });
        }
        
        async checkCurrentUser() {
            try {
                const { data: { user }, error } = await this.supabase.auth.getUser();
                if (error) throw error;
                this.currentUser = user;
                if (user) {
                    console.log('👤 Current user:', user.email);
                }
            } catch (error) {
                console.log('ℹ️ No current user session');
            }
        }
        
        // PUBLIC METHODS
        isInitialized() {
            return this.initialized;
        }
        
        async register(email, password, name, userType) {
            console.log('📝 Registering user:', { email, userType });
            
            if (!this.initialized) {
                throw new Error('Auth Core not initialized');
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
                
                // Try to create Webflow record
                try {
                    await this.createWebflowRecord(data.user.id, email, name, userType);
                } catch (webflowError) {
                    console.warn('⚠️ Webflow integration warning:', webflowError);
                    // Don't fail registration if Webflow fails
                }
                
                return { 
                    success: true, 
                    user: data.user,
                    message: 'Please check your email for confirmation link'
                };
                
            } catch (error) {
                console.error('❌ Registration failed:', error);
                return { success: false, error: error.message };
            }
        }
        
        async login(email, password) {
            console.log('🔐 Logging in user:', email);
            
            if (!this.initialized) {
                throw new Error('Auth Core not initialized');
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
                
                this.currentUser = data.user;
                console.log('✅ Login successful:', data.user.email);
                
                return { 
                    success: true, 
                    user: data.user 
                };
                
            } catch (error) {
                console.error('❌ Login failed:', error);
                return { success: false, error: error.message };
            }
        }
        
        async logout() {
            console.log('🚪 Logging out user...');
            
            if (!this.initialized) {
                throw new Error('Auth Core not initialized');
            }
            
            try {
                const { error } = await this.supabase.auth.signOut();
                
                if (error) {
                    console.error('❌ Logout error:', error);
                    return { success: false, error: error.message };
                }
                
                this.currentUser = null;
                console.log('✅ Logout successful');
                
                return { success: true };
                
            } catch (error) {
                console.error('❌ Logout failed:', error);
                return { success: false, error: error.message };
            }
        }
        
        async getCurrentUser() {
            if (!this.initialized) return null;
            
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
        
        // UTILITY METHODS
        getDashboardUrl(userType) {
            const isStaging = window.location.hostname.includes('webflow.io');
            const baseUrl = isStaging 
                ? 'https://nikobathrooms.webflow.io'
                : 'https://www.nikobathrooms.ie';
            
            const type = userType?.toLowerCase() || 'customer';
            return `${baseUrl}/dev/app/${type}/dashboard`;
        }
        
        async createWebflowRecord(userId, email, name, userType) {
            console.log('🔗 Creating Webflow CMS record...');
            
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
                    console.warn('⚠️ Webflow integration error:', error);
                } else {
                    console.log('✅ Webflow CMS record created successfully');
                }
                
            } catch (error) {
                console.warn('⚠️ Webflow integration warning:', error);
            }
        }
    }
    
    // Create single global instance
    const authCore = new NikoAuthCore();
    
    // Expose clean API on window
    window.NikoAuthCore = authCore;
    
    console.log('✅ NikoAuthCore exposed globally - ready to use!');
    
})(window);