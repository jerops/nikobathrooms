import { CONFIG } from './config/constants.js';
import { initializeSupabase } from './api/supabase-client.js';
import { registerUser } from './auth/registration.js';
import { loginUser } from './auth/login.js';
import { logoutUser } from './auth/logout.js';

class NikoPIM {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.userRole = null;
    this.isInitialized = false;
  }

  async init() {
    console.log('Initializing Niko PIM Authentication System...');
    this.supabase = initializeSupabase();
    await this.checkAuthState();
    this.setupEventListeners();
    this.isInitialized = true;
    console.log('Niko PIM initialized successfully');
  }

  async checkAuthState() {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        this.currentUser = user;
        console.log('User authenticated:', user.email);
        // TODO: Determine user role and redirect appropriately
      } else {
        console.log('No authenticated user');
      }
    } catch (error) {
      console.error('Auth state check failed:', error);
    }
  }

  setupEventListeners() {
    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      this.handleAuthStateChange(event, session);
    });
  }

  handleAuthStateChange(event, session) {
    switch (event) {
      case 'SIGNED_IN':
        this.currentUser = session.user;
        // TODO: Redirect to appropriate dashboard
        break;
      case 'SIGNED_OUT':
        this.currentUser = null;
        this.userRole = null;
        // TODO: Redirect to login
        break;
    }
  }

  // Auth functions
  async register(email, password, name, userType) {
    return await registerUser(email, password, name, userType);
  }

  async login(email, password) {
    return await loginUser(email, password);
  }

  async logout() {
    return await logoutUser();
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  const nikoPIM = new NikoPIM();
  window.NikoPIM = nikoPIM;
  
  nikoPIM.init().then(() => {
    // Explicitly expose methods on the window object
    window.NikoPIM.register = async (email, password, name, userType) => {
      return await nikoPIM.register(email, password, name, userType);
    };
    
    window.NikoPIM.login = async (email, password) => {
      return await nikoPIM.login(email, password);
    };
    
    window.NikoPIM.logout = async () => {
      return await nikoPIM.logout();
    };
    
    console.log('Methods exposed - register:', typeof window.NikoPIM.register);
  }).catch(error => {
    console.error('Failed to initialize NikoPIM:', error);
  });
}