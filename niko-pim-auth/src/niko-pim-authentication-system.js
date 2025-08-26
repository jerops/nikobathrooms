import { CONFIG } from './config/constants.js';
import { initializeSupabase } from './api/supabase-client.js';
import { registerUser } from './auth/registration.js';
import { loginUser } from './auth/login.js';
import { logoutUser } from './auth/logout.js';

class NikoAuthCore {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.userRole = null;
    this.initialized = false;
  }

  async init() {
    console.log('Initializing Niko Auth Core...');
    this.supabase = initializeSupabase();
    await this.checkAuthState();
    this.setupEventListeners();
    this.initialized = true;
    console.log('Niko Auth Core initialized successfully');
  }

  // Required method for CMS integration
  isInitialized() {
    return this.initialized;
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

// Export the class for webpack
export default NikoAuthCore;

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  const nikoAuthCore = new NikoAuthCore();
  
  // Initialize the auth core
  nikoAuthCore.init().then(() => {
    console.log('NikoAuthCore ready');
  }).catch(error => {
    console.error('Failed to initialize NikoAuthCore:', error);
  });

  // Make the instance globally available
  window.NikoAuthCore = nikoAuthCore;
}