import { CONFIG, USER_ROLES, validateEnvironment } from './config/constants.js';
import { initializeSupabase } from './api/supabase-client.js';
import { registerUser, registerUserLegacy } from './auth/registration.js';
import { loginUser, loginUserLegacy } from './auth/login.js';
import { logoutUser, logoutUserLegacy } from './auth/logout.js';

class NikoPIM {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.userRole = null;
    this.isInitialized = false;
    this.authStateListeners = [];
  }

  async init() {
    console.log('Initializing Niko PIM Authentication System...');
    
    try {
      // Validate environment before proceeding
      validateEnvironment();
      
      // Initialize Supabase client
      this.supabase = initializeSupabase();
      
      // Check current auth state
      await this.checkAuthState();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.isInitialized = true;
      console.log('✅ Niko PIM initialized successfully');
      
      return { success: true, message: 'Initialization successful' };
    } catch (error) {
      console.error('❌ Failed to initialize Niko PIM:', error);
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  async checkAuthState() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error) {
        console.error('Auth state check error:', error);
        return;
      }
      
      if (user) {
        this.currentUser = user;
        await this.determineUserRole(user);
        console.log('✅ User authenticated:', user.email, 'Role:', this.userRole);
        
        // Redirect to appropriate dashboard
        this.redirectToDashboard();
      } else {
        console.log('ℹ️ No authenticated user');
      }
    } catch (error) {
      console.error('❌ Auth state check failed:', error);
    }
  }

  async determineUserRole(user) {
    try {
      // Get user metadata from Supabase
      const userMetadata = user.user_metadata || {};
      const appMetadata = user.app_metadata || {};
      
      // Check user_metadata first (set during registration)
      if (userMetadata.role) {
        this.userRole = userMetadata.role;
        return;
      }
      
      if (userMetadata.user_type) {
        this.userRole = userMetadata.user_type;
        return;
      }
      
      // Check app_metadata (set by admin/backend)
      if (appMetadata.role) {
        this.userRole = appMetadata.role;
        return;
      }
      
      // Query user profile table if metadata is not available
      const { data: profile, error } = await this.supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.warn('Could not fetch user profile:', error);
        // Default to Customer if no role found
        this.userRole = USER_ROLES.CUSTOMER;
      } else {
        this.userRole = profile.role || USER_ROLES.CUSTOMER;
      }
      
    } catch (error) {
      console.error('Error determining user role:', error);
      this.userRole = USER_ROLES.CUSTOMER; // Safe default
    }
  }

  redirectToDashboard() {
    if (typeof window === 'undefined') return; // Server-side safety
    
    const currentPath = window.location.pathname;
    let targetPath;
    
    switch (this.userRole) {
      case USER_ROLES.RETAILER:
        targetPath = CONFIG.ROUTES.RETAILER_DASHBOARD;
        break;
      case USER_ROLES.CUSTOMER:
      default:
        targetPath = CONFIG.ROUTES.CUSTOMER_DASHBOARD;
        break;
    }
    
    // Only redirect if not already on the target path
    if (currentPath !== targetPath && !currentPath.includes('test-auth')) {
      console.log(`Redirecting to dashboard: ${targetPath}`);
      window.location.href = targetPath;
    }
  }

  setupEventListeners() {
    // Listen for auth state changes
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      await this.handleAuthStateChange(event, session);
      
      // Notify listeners
      this.authStateListeners.forEach(listener => {
        listener(event, session, this.userRole);
      });
    });
    
    this.authSubscription = subscription;
  }

  async handleAuthStateChange(event, session) {
    switch (event) {
      case 'SIGNED_IN':
        this.currentUser = session.user;
        await this.determineUserRole(session.user);
        this.redirectToDashboard();
        break;
        
      case 'SIGNED_OUT':
        this.currentUser = null;
        this.userRole = null;
        this.redirectToLogin();
        break;
        
      case 'TOKEN_REFRESHED':
        // Token was refreshed, user is still authenticated
        console.log('Token refreshed for user:', session.user.email);
        break;
        
      case 'USER_UPDATED':
        // User metadata was updated
        if (session.user) {
          this.currentUser = session.user;
          await this.determineUserRole(session.user);
        }
        break;
    }
  }

  redirectToLogin() {
    if (typeof window === 'undefined') return;
    
    const currentPath = window.location.pathname;
    const loginPath = CONFIG.ROUTES.LOGIN;
    
    // Only redirect if not already on login page or test page
    if (currentPath !== loginPath && !currentPath.includes('test-auth')) {
      console.log('Redirecting to login');
      window.location.href = loginPath;
    }
  }

  // Auth functions with improved error handling and backward compatibility
  async register(email, password, name, userType) {
    if (!this.isInitialized) {
      console.warn('NikoPIM not fully initialized, using legacy mode');
      return await registerUserLegacy(email, password, name, userType);
    }
    
    try {
      return await registerUser(this.supabase, email, password, name, userType);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async login(email, password) {
    if (!this.isInitialized) {
      console.warn('NikoPIM not fully initialized, using legacy mode');
      return await loginUserLegacy(email, password);
    }
    
    try {
      return await loginUser(this.supabase, email, password);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    if (!this.isInitialized) {
      console.warn('NikoPIM not fully initialized, using legacy mode');
      return await logoutUserLegacy();
    }
    
    try {
      return await logoutUser(this.supabase);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
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

  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  destroy() {
    // Clean up subscriptions
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this.authStateListeners = [];
    this.isInitialized = false;
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  const nikoPIM = new NikoPIM();
  window.NikoPIM = nikoPIM;
  
  // Wait for DOM to be ready
  const initializeWhenReady = () => {
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
      
      // Utility methods
      window.NikoPIM.isAuthenticated = () => nikoPIM.isAuthenticated();
      window.NikoPIM.getUserRole = () => nikoPIM.getUserRole();
      window.NikoPIM.getCurrentUser = () => nikoPIM.getCurrentUser();
      window.NikoPIM.onAuthStateChange = (callback) => nikoPIM.onAuthStateChange(callback);
      
      // Legacy methods for backward compatibility (direct function calls)
      window.NikoPIM.registerLegacy = registerUserLegacy;
      window.NikoPIM.loginLegacy = loginUserLegacy;
      window.NikoPIM.logoutLegacy = logoutUserLegacy;
      
      console.log('✅ NikoPIM methods exposed globally (with legacy support)');
    }).catch(error => {
      console.error('❌ Failed to initialize NikoPIM:', error);
      
      // If initialization fails, still expose legacy methods
      window.NikoPIM.register = registerUserLegacy;
      window.NikoPIM.login = loginUserLegacy;
      window.NikoPIM.logout = logoutUserLegacy;
      
      console.log('⚠️ NikoPIM initialized in legacy mode');
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhenReady);
  } else {
    initializeWhenReady();
  }
}

export default NikoPIM;