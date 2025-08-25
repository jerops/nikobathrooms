/**
 * Niko Bathrooms View Transitions System
 * Provides smooth page transitions for Webflow apps
 * @version 1.0.0
 * @author Niko Bathrooms Development Team
 */

class NikoBathroomsViewTransitions {
  constructor(config = {}) {
    this.config = {
      appPath: config.appPath || '/dev/app/',
      contentWrapperClass: config.contentWrapperClass || '.shell_main-wrapper',
      transitionDuration: config.transitionDuration || 400,
      debug: config.debug || false,
      enableAnalytics: config.enableAnalytics || false,
      ...config
    };
    
    this.transitionCount = 0;
    this.init();
  }

  log(message, ...args) {
    if (this.config.debug) {
      console.log(`🎬 [NikoViewTransitions] ${message}`, ...args);
    }
  }

  analytics(event, data = {}) {
    if (this.config.enableAnalytics && window.gtag) {
      window.gtag('event', event, {
        event_category: 'view_transitions',
        ...data
      });
    }
  }

  isAppUrl(url) {
    try {
      const urlPath = new URL(url, window.location.origin).pathname;
      const isApp = urlPath.startsWith(this.config.appPath);
      this.log(`URL check: ${url} -> ${isApp ? 'APP' : 'EXTERNAL'}`);
      return isApp;
    } catch (e) {
      this.log('Error parsing URL:', url, e);
      return false;
    }
  }

  async handleTransition(url) {
    const startTime = performance.now();
    this.transitionCount++;
    
    this.log(`Starting transition #${this.transitionCount} to:`, url);
    
    // Check if the browser supports View Transitions
    if (!document.startViewTransition) {
      this.log('View Transitions not supported, using normal navigation');
      this.analytics('transition_fallback', { reason: 'unsupported', url });
      window.location.href = url;
      return;
    }

    try {
      // Add loading indicator
      document.body.classList.add('niko-transitioning');
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      
      const newContent = doc.querySelector(this.config.contentWrapperClass)?.innerHTML;
      const mainWrapper = document.querySelector(this.config.contentWrapperClass);

      // Failsafe: if we can't find the content, navigate normally
      if (!newContent || !mainWrapper) {
        this.log('Content wrapper not found, falling back to normal navigation');
        this.analytics('transition_fallback', { reason: 'no_content_wrapper', url });
        window.location.href = url;
        return;
      }

      // Start the view transition
      const transition = document.startViewTransition(() => {
        mainWrapper.innerHTML = newContent;
        document.title = doc.title;
        
        // Update meta description if exists
        const newDescription = doc.querySelector('meta[name="description"]');
        const currentDescription = document.querySelector('meta[name="description"]');
        if (newDescription && currentDescription) {
          currentDescription.setAttribute('content', newDescription.getAttribute('content'));
        }
        
        window.history.pushState({}, '', url);
        this.log(`Transition #${this.transitionCount} completed successfully`);
      });

      // Wait for transition to complete
      await transition.finished;
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.analytics('transition_success', { 
        url, 
        duration: Math.round(duration),
        transition_number: this.transitionCount 
      });
      
      this.log(`Transition #${this.transitionCount} finished in ${Math.round(duration)}ms`);

    } catch (error) {
      this.log('Transition failed:', error);
      this.analytics('transition_error', { url, error: error.message });
      // If anything goes wrong, fall back to normal navigation
      window.location.href = url;
    } finally {
      // Remove loading indicator
      document.body.classList.remove('niko-transitioning');
    }
  }

  init() {
    this.log('🚀 Initializing Niko Bathrooms View Transitions System', this.config);
    
    // Add version info to window
    window.nikoBathroomsViewTransitions = {
      version: '1.0.0',
      instance: this,
      stats: () => ({
        transitionCount: this.transitionCount,
        config: this.config
      })
    };
    
    // Add click listener to the whole document
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a');

      // --- CONDITIONS FOR THE TRANSITION ---
      if (
        !link || !link.href || // Not a valid link
        link.target === '_blank' || // Opens in a new tab
        link.download || // Download link
        event.ctrlKey || event.metaKey || // User is opening in a new tab
        event.shiftKey || // User is opening in new window
        !this.isAppUrl(window.location.href) || // Current page is NOT an app page
        !this.isAppUrl(link.href) || // Destination page is NOT an app page
        link.href === window.location.href // Same page
      ) {
        return; // Do nothing, let the browser handle it normally
      }
      
      this.log('🔗 Intercepting link click:', link.href);
      // If all checks pass, prevent default navigation and run our transition
      event.preventDefault();
      this.handleTransition(link.href);
    });

    // Handle the browser's back/forward buttons
    window.addEventListener('popstate', (event) => {
      // Only handle popstate if we are navigating within the app section
      if (this.isAppUrl(window.location.href)) {
        this.log('⬅️ Handling browser navigation:', window.location.href);
        this.handleTransition(window.location.href);
      }
    });
    
    // Add keyboard shortcut for debugging (Ctrl+Shift+T)
    if (this.config.debug) {
      document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'T') {
          console.table(this.stats());
        }
      });
    }
    
    this.log('✅ View Transitions System initialized successfully');
    this.analytics('system_initialized', { config: this.config });
  }

  // Public API methods
  stats() {
    return {
      transitionCount: this.transitionCount,
      config: this.config,
      supported: !!document.startViewTransition
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.log('Config updated:', this.config);
  }
}

// Auto-initialize with default config if no custom initialization is detected
if (typeof window !== 'undefined' && !window.nikoBathroomsViewTransitionsInitialized) {
  window.addEventListener('DOMContentLoaded', () => {
    // Check if custom config exists
    const customConfig = window.nikoBathroomsViewTransitionsConfig || {};
    window.nikoBathroomsViewTransitions = new NikoBathroomsViewTransitions(customConfig);
    window.nikoBathroomsViewTransitionsInitialized = true;
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NikoBathroomsViewTransitions;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
  window.NikoBathroomsViewTransitions = NikoBathroomsViewTransitions;
}