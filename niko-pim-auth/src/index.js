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
    this.isProcessingAuth = false;
    this.initializationPromise = null;
    this.authSubscription = null;
    // CRITICAL: Add recursion prevention
    this.isRedirecting = false;
    this.redirectCount = 0;
    this.MAX_REDIRECTS = 3;
  }

  async init() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = this._doInit();
    return this.initializationPromise;
  }
  
  async _doInit() {
    console.log('🚀 Initializing Niko PIM Authentication System...');
    
    try {
      validateEnvironment();
      this.supabase = initializeSupabase();
      
      // CRITICAL: Skip auth state check on auth pages to prevent redirect loops
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.includes('/auth/') || 
                        currentPath.includes('sign-up') || 
                        currentPath.includes('log-in');
      
      if (!isAuthPage) {
        await this.checkAuthState();
        this.setupEventListeners();
      } else {
        console.log('ℹ️ On auth page, skipping auth state check');
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
    if (this.isProcessingAuth || this.isRedirecting) {
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
        
        // CRITICAL: Prevent redirect loops
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/auth/') || 
                          currentPath.includes('sign-up') || 
                          currentPath.includes('log-in');
        
        if (!isAuthPage && !this.isRedirecting && this.redirectCount < this.MAX_REDIRECTS) {
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
      const userMetadata = user.user_metadata || {};
      const appMetadata = user.app_metadata || {};
      
      if (userMetadata.role) {
        this.userRole = userMetadata.role;
        return;
      }
      
      if (userMetadata.user_type) {
        this.userRole = userMetadata.user_type;
        return;
      }
      
      if (appMetadata.role) {
        this.userRole = appMetadata.role;
        return;
      }
      
      this.userRole = USER_ROLES.CUSTOMER;
      console.log('ℹ️ No specific role found, defaulting to Customer');
      
    } catch (error) {
      console.error('Error determining user role:', error);
      this.userRole = USER_ROLES.CUSTOMER;
    }
  }

  redirectToDashboard() {
    if (typeof window === 'undefined' || this.isRedirecting || this.redirectCount >= this.MAX_REDIRECTS) {
      return;
    }
    
    this.isRedirecting = true;
    this.redirectCount++;
    
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
    
    // CRITICAL: Only redirect if not already on target path
    if (currentPath !== targetPath) {
      console.log(`Redirecting to dashboard: ${targetPath}`);
      setTimeout(() => {
        window.location.href = targetPath;
      }, 500);
    } else {
      this.isRedirecting = false;
    }
  }

  setupEventListeners() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    
    // CRITICAL: Simplified auth state handler to prevent recursion
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      // CRITICAL: Ignore events during auth processing
      if (this.isProcessingAuth || this.isRedirecting) {
        return;
      }
      
      switch (event) {
        case 'SIGNED_IN':
          this.currentUser = session.user;
          await this.determineUserRole(session.user);
          // Don't auto-redirect on sign in - let the auth functions handle it
          break;
          
        case 'SIGNED_OUT':
          this.currentUser = null;
          this.userRole = null;
          this.isRedirecting = false;
          this.redirectCount = 0;
          break;
          
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed for user:', session.user.email);
          break;
      }
      
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

  // CRITICAL: Simplified auth functions to prevent recursion
  async register(email, password, name, userType) {
    console.log('📝 Registration attempt:', { email, userType });
    
    if (!this.isInitialized) {
      console.warn('NikoPIM not fully initialized, using legacy mode');
      return await registerUserLegacy(email, password, name, userType);
    }
    
    try {
      // CRITICAL: Reset redirect counters before auth operation
      this.isRedirecting = false;
      this.redirectCount = 0;
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
      // CRITICAL: Reset redirect counters before auth operation
      this.isRedirecting = false;
      this.redirectCount = 0;
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
    
    try {
      this.isProcessingAuth = true;
      this.isRedirecting = false;
      this.redirectCount = 0;
      
      const result = this.isInitialized 
        ? await logoutUser(this.supabase)
        : await logoutUserLegacy();
        
      console.log('✅ Logout result:', result);
      return result;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      this.isProcessingAuth = false;
    }
  }