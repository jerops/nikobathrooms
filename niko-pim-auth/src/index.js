// SIMPLIFIED WORKING AUTHENTICATION SYSTEM - NO STACK OVERFLOW
// Based on original working implementation from Site Authentication Project Setup

import { createClient } from '@supabase/supabase-js';

// Environment variables (hardcoded to prevent issues)
const SUPABASE_URL = 'https://bzjoxjqfpmjhbfijthpp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ0MDUyMjQsImV4cCI6MjAzOTk4MTIyNH0.p5eJJqvF_HhMAVkqpvpWp7Gqy2qEFnq6MfI_kD8DfJQ';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// SIMPLE AUTHENTICATION FUNCTIONS - NO RECURSION
class SimpleNikoPIM {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
    console.log('✅ Simple NikoPIM initialized');
  }

  async register(email, password, name, userType) {
    console.log('📝 Registration attempt:', { email, userType });
    
    try {
      const { data, error } = await supabase.auth.signUp({
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
        console.error('Registration error:', error);
        throw error;
      }

      console.log('✅ Registration successful:', data);
      return { 
        success: true, 
        user: data.user,
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  async login(email, password) {
    console.log('🔐 Login attempt:', { email });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      this.currentUser = data.user;
      this.userRole = data.user?.user_metadata?.user_type || 'Customer';
      
      console.log('✅ Login successful:', data);
      return { 
        success: true, 
        user: data.user,
        role: this.userRole,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  async logout() {
    console.log('🚪 Logout attempt');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }

      this.currentUser = null;
      this.userRole = null;
      
      console.log('✅ Logout successful');
      return { 
        success: true, 
        message: 'Logout successful'
      };
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw new Error(error.message || 'Logout failed');
    }
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getUserRole() {
    return this.userRole;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

// INITIALIZE AND EXPOSE GLOBALLY - NO INFINITE LOOPS
if (typeof window !== 'undefined') {
  console.log('🚀 Loading Simple Niko PIM Authentication...');
  
  const nikoPIM = new SimpleNikoPIM();
  
  // Expose to window immediately - no waiting, no recursion
  window.NikoPIM = {
    register: (email, password, name, userType) => nikoPIM.register(email, password, name, userType),
    login: (email, password) => nikoPIM.login(email, password),
    logout: () => nikoPIM.logout(),
    isAuthenticated: () => nikoPIM.isAuthenticated(),
    getUserRole: () => nikoPIM.getUserRole(),
    getCurrentUser: () => nikoPIM.getCurrentUser()
  };
  
  console.log('✅ Simple NikoPIM loaded successfully');
  console.log('Available functions:', Object.keys(window.NikoPIM));
}

export default SimpleNikoPIM;