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
    this.isProcessingAuth = false; // Prevent recursive auth processing
    this.initializationPromise = null; // Prevent multiple initializations
  }

  async init() {
    // Prevent multiple initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = this._doInit();
    return this.initializationPromise;
  }
  
  async _doInit() {
    console.log('Initializing Niko PIM Authentication System...');
    
    try {
      // Validate environment before proceeding
      validateEnvironment();
      
      // Initialize Supabase client
      this.supabase = initializeSupabase();
      
      // Only check auth state if not on auth pages (prevent redirects during signup/login)
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/auth/') || 
                        currentPath.includes('sign-up') || 
                        currentPath.includes('log-in');
      
      if (!isAuthPage) {
        await this.checkAuthState();
        this.setupEventListeners();
      } else {
        console.log('ℹ️ On auth page, skipping auth state check to prevent redirects');
      }
      
      this.isInitialized = true;
      console.log('✅ Niko PIM initialized successfully');
      
      return { success: true, message: 'Initialization successful' };
    } catch (error) {
      console.error('❌ Failed to initialize Niko PIM:', error);
      throw new Error(`Initialization failed: ${error.message}`);
    }
  }

  async checkAuthState() {
    if (this.isProcessingAuth) {
      console.log('⚠️ Auth processing in progress, skipping...');
      return;
    }
    
    try {
      this.isProcessingAuth = true;
      
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error) {
        console.error('Auth state check error:', error);
        return;
      }
      
      if (user) {
        this.currentUser = user;
        await this.determineUserRole(user);
        console.log('✅ User authenticated:', user.email, 'Role:', this.userRole);
        
        // Only redirect if not on auth pages
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/auth/') || 
                          currentPath.includes('sign-up') || 
                          currentPath.includes('log-in');
        
        if (!isAuthPage) {
          this.redirectToDashboard();
        }
      } else {
        console.log('ℹ️ No authenticated user');
      }
    } catch (error) {
      console.error('❌ Auth state check failed:', error);
    } finally {
      this.isProcessingAuth = false;
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
      
      // Default to Customer if no role found
      this.userRole = USER_ROLES.CUSTOMER;
      console.log('ℹ️ No specific role found, defaulting to Customer');
      
    } catch (error) {
      console.error('Error determining user role:', error);
      this.userRole = USER_ROLES.CUSTOMER; // Safe default
    }
  }

  redirectToDashboard() {
    if (typeof window === 'undefined' || this.isProcessingAuth) return;
    
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
    
    // Only redirect if not already on the target path and not on auth pages
    const isAuthPage = currentPath.includes('/auth/') || 
                      currentPath.includes('sign-up') || 
                      currentPath.includes('log-in');
    
    if (currentPath !== targetPath && !isAuthPage) {
      console.log(`Redirecting to dashboard: ${targetPath}`);
      // Use a timeout to prevent immediate redirect loops
      setTimeout(() => {
        window.location.href = targetPath;
      }, 100);
    }
  }

  setupEventListeners() {
    if (this.authSubscription) {
      // Cleanup existing subscription
      this.authSubscription.unsubscribe();
    }
    
    // Listen for auth state changes
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      // Prevent processing during active auth operations
      if (this.isProcessingAuth) {
        console.log('⚠️ Auth processing in progress, skipping state change handler');
        return;
      }
      
      await this.handleAuthStateChange(event, session);
      
      // Notify listeners
      this.authStateListeners.forEach(listener => {
        try {
          listener(event, session, this.userRole);
        } catch (error) {
          console.error('Auth state listener error:', error);
        }
      });
    });
    
    this.authSubscription = subscription;
  }

  async handleAuthStateChange(event, session) {
    try {
      this.isProcessingAuth = true;
      
      switch (event) {
        case 'SIGNED_IN':
          this.currentUser = session.user;
          await this.determineUserRole(session.user);
          
          // Only redirect if not on auth pages
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath.includes('/auth/') || 
                            currentPath.includes('sign-up') || 
                            currentPath.includes('log-in');
          
          if (!isAuthPage) {
            setTimeout(() => this.redirectToDashboard(), 100);
          }
          break;
          
        case 'SIGNED_OUT':
          this.currentUser = null;
          this.userRole = null;
          // Don't auto-redirect to login, let the app handle it
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
    } catch (error) {
      console.error('Auth state change handler error:', error);
    } finally {
      this.isProcessingAuth = false;
    }
  }

  // Auth functions with improved error handling and backward compatibility
  async register(email, password, name, userType) {
    console.log('📝 Registration attempt:', { email, userType });
    
    if (!this.isInitialized) {
      console.warn('NikoPIM not fully initialized, using legacy mode');
      return await registerUserLegacy(email, password, name, userType);
    }
    
    try {
      this.isProcessingAuth = true;
      
      const result = await registerUser(this.supabase, email, password, name, userType);
      console.log('✅ Registration result:', result);
      return result;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      this.isProcessingAuth = false;
    }
  }

  async login(email, password) {
    console.log('🔐 Login attempt:', { email });
    
    if (!this.isInitialized) {
      console.warn('NikoPIM not fully initialized, using legacy mode');
      return await loginUserLegacy(email, password);
    }
    
    try {
      this.isProcessingAuth = true;
      
      const result = await loginUser(this.supabase, email, password);
      console.log('✅ Login result:', result);
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      this.isProcessingAuth = false;
    }
  }

  async logout() {
    console.log('🚪 Logout attempt');
    
    if (!this.isInitialized) {
      console.warn('NikoPIM not fully initialized, using legacy mode');
      return await logoutUserLegacy();
    }
    
    try {
      this.isProcessingAuth = true;
      
      const result = await logoutUser(this.supabase);
      console.log('✅ Logout result:', result);
      return result;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      this.isProcessingAuth = false;
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
    this.isProcessingAuth = false;
    this.initializationPromise = null;
  }
}

// Prevent multiple initializations globally
if (typeof window !== 'undefined' && !window.NikoPIMInstance) {
  const nikoPIM = new NikoPIM();
  window.NikoPIM = nikoPIM;
  window.NikoPIMInstance = nikoPIM;
  
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
      
      // Legacy methods for backward compatibility
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