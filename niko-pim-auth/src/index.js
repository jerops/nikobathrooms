// RESTORED AND FIXED NIKO PIM AUTHENTICATION SYSTEM
// Based on implementation guide and previous working version

import { createClient } from '@supabase/supabase-js';

// Use the configuration from .env file
const SUPABASE_URL = 'https://bzjoxjqfpmjhbfijthpp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6am94anFmcG1qaGJmaWp0aHBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3NjIyMzksImV4cCI6MjA3MTMzODIzOX0.sL9omeLIgpgqYjTJM6SGQPSvUvm5z-Yr9rOzkOi2mJk';

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class NikoPIMAuthentication {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
    this.isInitialized = false;
    console.log('🚀 Niko PIM Authentication System Loading...');
    
    // Initialize auth state on construction
    this.init();
  }

  async init() {
    try {
      // Check current auth state
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        this.currentUser = user;
        this.userRole = user.user_metadata?.user_type || user.user_metadata?.role || 'Customer';
        console.log('✅ User already authenticated:', user.email, 'Role:', this.userRole);
      }
      
      // Set up auth state listener
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('🔄 Auth state changed:', event);
        if (session?.user) {
          this.currentUser = session.user;
          this.userRole = session.user.user_metadata?.user_type || session.user.user_metadata?.role || 'Customer';
        } else {
          this.currentUser = null;
          this.userRole = null;
        }
      });
      
      this.isInitialized = true;
      console.log('✅ Niko PIM Authentication System Initialized');
    } catch (error) {
      console.error('❌ Failed to initialize auth system:', error);
    }
  }

  async register(email, password, name, userType = 'Customer') {
    console.log('📝 Registration attempt:', { email, name, userType });
    
    try {
      // Validate inputs
      if (!email || !password || !name) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            user_type: userType,
            role: userType
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }

      console.log('✅ Registration successful:', data.user?.email);
      
      // Update local state
      if (data.user) {
        this.currentUser = data.user;
        this.userRole = userType;
      }

      return { 
        success: true, 
        user: data.user,
        role: userType,
        message: 'Registration successful! Please check your email to confirm your account.'
      };
    } catch (error) {
      console.error('❌ Registration failed:', error);
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      };
    }
  }

  async login(email, password) {
    console.log('🔐 Login attempt:', { email });
    
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      // Update local state
      this.currentUser = data.user;
      this.userRole = data.user?.user_metadata?.user_type || data.user?.user_metadata?.role || 'Customer';
      
      console.log('✅ Login successful:', data.user?.email, 'Role:', this.userRole);
      
      return { 
        success: true, 
        user: data.user,
        role: this.userRole,
        message: 'Login successful!'
      };
    } catch (error) {
      console.error('❌ Login failed:', error);
      return {
        success: false,
        error: error.message || 'Login failed. Please check your credentials.'
      };
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

      // Clear local state
      this.currentUser = null;
      this.userRole = null;
      
      console.log('✅ Logout successful');
      
      return { 
        success: true, 
        message: 'Logout successful'
      };
    } catch (error) {
      console.error('❌ Logout failed:', error);
      return {
        success: false,
        error: error.message || 'Logout failed'
      };
    }
  }

  // Utility methods
  isAuthenticated() {
    return !!this.currentUser;
  }

  getUserRole() {
    return this.userRole;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Method to check if system is ready
  isReady() {
    return this.isInitialized;
  }
}

// Initialize and expose globally
if (typeof window !== 'undefined') {
  console.log('🌐 Initializing global window.NikoPIM...');
  
  const authSystem = new NikoPIMAuthentication();
  
  // Expose methods directly to avoid timing issues
  window.NikoPIM = {
    // Authentication methods
    register: (email, password, name, userType) => authSystem.register(email, password, name, userType),
    login: (email, password) => authSystem.login(email, password),
    logout: () => authSystem.logout(),
    
    // Utility methods
    isAuthenticated: () => authSystem.isAuthenticated(),
    getUserRole: () => authSystem.getUserRole(),
    getCurrentUser: () => authSystem.getCurrentUser(),
    isReady: () => authSystem.isReady(),
    
    // Direct access to auth system for debugging
    _authSystem: authSystem
  };
  
  console.log('✅ window.NikoPIM initialized with methods:', Object.keys(window.NikoPIM));
  
  // Dispatch ready event for form handlers
  setTimeout(() => {
    if (typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('NikoPIMReady'));
    }
  }, 100);
}

export default NikoPIMAuthentication;