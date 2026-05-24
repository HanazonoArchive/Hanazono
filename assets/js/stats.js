// IP-based Statistics and analytics tracking
(function() {
  // Initialize page statistics with IP-based unique visitor tracking
  async function initializeStats() {
    try {
      // Fetch user's IP address
      const userIP = await getUserIP();
      
      // Check if this IP has already been counted
      const visitedIPsKey = 'visited_ips';
      let visitedIPs = JSON.parse(localStorage.getItem(visitedIPsKey)) || [];
      
      // Get or initialize total view count
      const totalViewKey = 'portfolio_total_views';
      let totalViews = parseInt(localStorage.getItem(totalViewKey)) || 0;
      
      // Check if this is a new unique visitor
      if (!visitedIPs.includes(userIP)) {
        visitedIPs.push(userIP);
        localStorage.setItem(visitedIPsKey, JSON.stringify(visitedIPs));
        
        // Increment total views (only once per unique IP)
        totalViews += 1;
        localStorage.setItem(totalViewKey, String(totalViews));
      }
      
      // Update view count display
      updateViewCount(totalViews, visitedIPs.length);
      
    } catch (error) {
      console.error('Failed to get IP for analytics:', error);
      // Fallback to simple localStorage count
      const viewCountKey = 'portfolio_view_count_fallback';
      let viewCount = parseInt(localStorage.getItem(viewCountKey)) || 0;
      viewCount += 1;
      localStorage.setItem(viewCountKey, String(viewCount));
      updateViewCount(viewCount, viewCount);
    }
    
    // Update last updated date
    updateLastUpdatedDate();
  }
  
  async function getUserIP() {
    // Use multiple IP detection services for reliability
    try {
      // Try ipify first (most reliable)
      const response = await fetch('https://api.ipify.org?format=json');
      if (!response.ok) throw new Error('ipify failed');
      const data = await response.json();
      return data.ip;
    } catch (error1) {
      try {
        // Fallback to iFConfig
        const response = await fetch('https://ifconfig.me/all/json');
        if (!response.ok) throw new Error('ifconfig failed');
        const data = await response.json();
        return data.ip_addr;
      } catch (error2) {
        try {
          // Final fallback to ip-api
          const response = await fetch('https://ip-api.co/json/');
          if (!response.ok) throw new Error('ip-api failed');
          const data = await response.json();
          return data.ip;
        } catch (error3) {
          // If all services fail, generate a session-based ID
          let sessionID = sessionStorage.getItem('session_id');
          if (!sessionID) {
            sessionID = 'session_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('session_id', sessionID);
          }
          throw new Error('All IP services failed, using session ID');
        }
      }
    }
  }
  
  function updateViewCount(totalViews, uniqueVisitors) {
    const viewCountElements = document.querySelectorAll('#view-count');
    viewCountElements.forEach(element => {
      element.textContent = totalViews.toLocaleString();
      element.title = `${uniqueVisitors} unique visitor${uniqueVisitors !== 1 ? 's' : ''}`;
    });
  }
  
  function updateLastUpdatedDate() {
    const lastUpdatedElements = document.querySelectorAll('#last-updated');
    
    // Try to get the build/deploy date from meta tag, or use current date
    const metaDate = document.querySelector('meta[name="build-date"]');
    let dateString = '';
    
    if (metaDate) {
      dateString = new Date(metaDate.content).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } else {
      // Use the last modified date of the HTML file
      dateString = new Date(document.lastModified).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    lastUpdatedElements.forEach(element => {
      element.textContent = dateString;
    });
  }
  
  // Run initialization when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeStats);
  } else {
    initializeStats();
  }
  
  // Add scroll-to-top button for better UX
  createScrollToTopButton();
  
  function createScrollToTopButton() {
    // Create button
    const scrollButton = document.createElement('button');
    scrollButton.id = 'scroll-to-top';
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollButton.setAttribute('aria-label', 'Scroll to top');
    scrollButton.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 44px;
      height: 44px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.1);
      color: var(--text, #e7ebf0);
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 999;
      transition: all 0.3s ease;
      font-size: 1.2rem;
    `;
    
    document.body.appendChild(scrollButton);
    
    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollButton.style.display = 'flex';
      } else {
        scrollButton.style.display = 'none';
      }
    });
    
    // Smooth scroll to top
    scrollButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    // Hover effects
    scrollButton.addEventListener('mouseenter', () => {
      scrollButton.style.transform = 'translateY(-3px)';
      scrollButton.style.background = 'rgba(74, 217, 255, 0.15)';
      scrollButton.style.borderColor = 'rgba(74, 217, 255, 0.5)';
    });
    
    scrollButton.addEventListener('mouseleave', () => {
      scrollButton.style.transform = 'translateY(0)';
      scrollButton.style.background = 'rgba(255, 255, 255, 0.1)';
      scrollButton.style.borderColor = 'rgba(255, 255, 255, 0.12)';
    });
  }
})();
