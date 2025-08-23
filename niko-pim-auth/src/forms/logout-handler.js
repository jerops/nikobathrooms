// LOGOUT HANDLER - RESTORED FROM WORKING REFERENCE POINT
// This is based on your exact working script reference

document.addEventListener('DOMContentLoaded', function() {
  function waitForNikoPIM() {
    if (window.NikoPIM && window.NikoPIM.logout) {
      setupLogoutButtons();
    } else {
      setTimeout(waitForNikoPIM, 100);
    }
  }
  
  function setupLogoutButtons() {
    const logoutButtons = document.querySelectorAll('[niko-data="logout"]');
    
    logoutButtons.forEach(button => {
      button.addEventListener('click', handleLogout);
    });
  }
  
  async function handleLogout(e) {
    e.preventDefault();
    
    try {
      // Call logout but override the redirect
      const result = await window.NikoPIM.logout();
      
      // Custom redirect using current domain - EXACT REFERENCE PATTERN
      const currentDomain = window.location.origin;
      window.location.href = `${currentDomain}/dev/app/auth/log-in`;
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  waitForNikoPIM();
});