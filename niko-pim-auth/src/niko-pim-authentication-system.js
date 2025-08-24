import { PUBLIC_CONFIG, USER_ROLES } from './config/environment.js';
import { initializeSupabase } from './api/supabase-client.js';
import { registerUser } from './auth/registration.js';
import { loginUser } from './auth/login.js';
import { logoutUser } from './auth/logout.js';

class NikoPIMAuthenticationSystem {
    constructor() {
        this.supabase = null;
        this.currentUser = null;
        this.userRole = null;
        this.isInitialized = false;
    }
    
    async init() {
        console.log('Initializing Niko PIM Authentication System...');
        try {
            this.supabase = initializeSupabase();
            await this.checkAuthState();
            this.setupEventListeners();
            this.isInitialized = true;
            console.log('Niko PIM Authentication System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize authentication system:', error);
            throw error;
        }
    }
    
    async checkAuthState() {
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user) {
                this.currentUser = user;
                this.userRole = user.user_metadata?.user_type || USER_ROLES.CUSTOMER;
                console.log('User authenticated:', user.email, 'Role:', this.userRole);
            } else {
                console.log('No authenticated user');
            }
        } catch (error) {
            console.error('Auth state check failed:', error);
        }
    }
    
    setupEventListeners() {
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            this.handleAuthStateChange(event, session);
        });
    }
    
    handleAuthStateChange(event, session) {
        switch (event) {
            case 'SIGNED_IN':
                this.currentUser = session.user;
                this.userRole = session.user.user_metadata?.user_type || USER_ROLES.CUSTOMER;
                break;
            case 'SIGNED_OUT':
                this.currentUser = null;
                this.userRole = null;
                break;
        }
    }
    
    // Public API methods
    async register(email, password, name, userType) {
        return await registerUser(email, password, name, userType);
    }
    
    async login(email, password) {
        return await loginUser(email, password);
    }
    
    async logout() {
        return await logoutUser();
    }
    
    // Utility methods
    getCurrentUser() {
        return this.currentUser;
    }
    
    getUserRole() {
        return this.userRole;
    }
    
    isAuthenticated() {
        return !!this.currentUser;
    }
}

// Initialize and expose globally
if (typeof window !== 'undefined') {
    const authSystem = new NikoPIMAuthenticationSystem();
    window.NikoPIM = authSystem;
    
    authSystem.init().then(() => {
        // Expose methods for form handlers
        window.NikoPIM.register = async (email, password, name, userType) => {
            return await authSystem.register(email, password, name, userType);
        };
        
        window.NikoPIM.login = async (email, password) => {
            return await authSystem.login(email, password);
        };
        
        window.NikoPIM.logout = async () => {
            return await authSystem.logout();
        };
        
        // Expose utility methods
        window.NikoPIM.getCurrentUser = () => authSystem.getCurrentUser();
        window.NikoPIM.getUserRole = () => authSystem.getUserRole();
        window.NikoPIM.isAuthenticated = () => authSystem.isAuthenticated();
        
        console.log('Niko PIM Authentication System ready');
    }).catch(error => {
        console.error('Failed to initialize Niko PIM Authentication System:', error);
    });
}