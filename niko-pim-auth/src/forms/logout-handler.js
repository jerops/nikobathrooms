// COMPLETE LOGOUT HANDLER - RESTORED FROM WORKING WEBFLOW PIM PROJECT
// This version combines your current working script with the enhanced features
// that were originally implemented in the Site Authentication Project Setup

document.addEventListener('DOMContentLoaded', function() {
  function waitForNikoPIM() {
    if (window.NikoPIM && window.NikoPIM.logout) {
      setupLogoutButtons();
      console.log('✅ Logout handlers ready');
    } else {
      setTimeout(waitForNikoPIM, 100);
    }
  }
  
  // DOMAIN-AWARE REDIRECTS - Restored from working implementation
  function getLoginUrl() {
    const hostname = window.location.hostname;
    let baseUrl;
    
    // Handle different deployment domains
    if (hostname === 'nikobathrooms.ie') {
      // Production domain
      baseUrl = 'https://nikobathrooms.ie';
    } else if (hostname === 'nikobathrooms.webflow.io') {
      // Staging/Webflow domain
      baseUrl = 'https://nikobathrooms.webflow.io';
    } else {
      // Fallback for preview/other domains
      baseUrl = window.location.origin;
    }
    
    return `${baseUrl}/dev/app/auth/log-in`;
  }
  
  // ENHANCED ELEMENT DETECTION - Supports multiple detection methods
  function setupLogoutButtons() {
    // Primary method: niko-data="logout" attribute (your requirement)
    const logoutButtons = document.querySelectorAll('[niko-data="logout"]');
    
    logoutButtons.forEach(button => {
      button.addEventListener('click', handleLogout);
      console.log('🔗 Logout handler attached to niko-data element:', button);
    });
    
    // Fallback methods for better compatibility
    const fallbackElements = document.querySelectorAll('a, button, [data-logout], .logout-btn');
    
    fallbackElements.forEach(element => {
      // Skip if already handled by primary method
      if (element.hasAttribute('niko-data')) return;
      
      const text = (element.textContent || element.innerText || '').toLowerCase();
      const dataAction = element.getAttribute('data-action') || '';
      
      // Check if this element should trigger logout
      if (text.includes('logout') || 
          text.includes('log out') || 
          text.includes('sign out') ||
          dataAction.includes('logout') ||
          element.hasAttribute('data-logout') ||
          element.id === 'logout-btn') {
        
        element.addEventListener('click', handleLogout);
        console.log('🔗 Fallback logout handler attached:', element);
      }
    });
  }
  
  // ENHANCED LOGOUT HANDLER - With loading states and comprehensive error handling
  async function handleLogout(e) {
    e.preventDefault();
    
    const element = e.target;
    const originalText = element.textContent || element.innerText;
    
    // Show loading state (UI feedback)
    if (element.textContent !== undefined) {
      element.textContent = 'Logging out...';
    }
    element.disabled = true;
    
    try {
      console.log('🔄 Attempting logout...');
      
      // Call logout function (your current implementation)
      const result = await window.NikoPIM.logout();
      
      // Check success (enhanced from working version)
      if (result && result.success) {
        console.log('✅ Logout successful');
      } else {
        console.log('⚠️ Logout completed (with potential issues)', result);
      }
      
      // Always redirect using domain-aware URL (enhanced from working version)
      const loginUrl = getLoginUrl();
      console.log('🚀 Redirecting to login:', loginUrl);
      window.location.href = loginUrl;
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Still redirect to login even if logout failed (resilient error handling)
      const loginUrl = getLoginUrl();
      console.log('🚀 Redirecting to login after error:', loginUrl);
      window.location.href = loginUrl;
      
    } finally {
      // Restore button state in case redirect fails (safety net)
      setTimeout(() => {
        if (element.textContent !== undefined) {
          element.textContent = originalText;
        }
        element.disabled = false;
      }, 100);
    }
  }
  
  waitForNikoPIM();
});