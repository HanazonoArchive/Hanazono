// Firebase REST API configuration
const FIREBASE_DB_URL = "https://portfolio-hanazonoarchive-default-rtdb.asia-southeast1.firebasedatabase.app";
const FIREBASE_API_KEY = "AIzaSyCjj_VEsYsApjW8YoUeRZfuC2MxJ3U1Py8";

// Country code to timezone mapping
const countryTimezoneMap = {
  'PH': 'Asia/Manila',      // Philippines
  'US': 'America/New_York',  // USA (Eastern)
  'GB': 'Europe/London',     // UK
  'AU': 'Australia/Sydney',  // Australia
  'JP': 'Asia/Tokyo',        // Japan
  'CN': 'Asia/Shanghai',     // China
  'IN': 'Asia/Kolkata',      // India
  'SG': 'Asia/Singapore',    // Singapore
  'TH': 'Asia/Bangkok',      // Thailand
  'MY': 'Asia/Kuala_Lumpur', // Malaysia
  'VN': 'Asia/Ho_Chi_Minh',  // Vietnam
  'ID': 'Asia/Jakarta',      // Indonesia
  'KR': 'Asia/Seoul',        // South Korea
  'BR': 'America/Sao_Paulo', // Brazil
  'MX': 'America/Mexico_City', // Mexico
  'CA': 'America/Toronto',   // Canada
  'DE': 'Europe/Berlin',     // Germany
  'FR': 'Europe/Paris',      // France
  'IT': 'Europe/Rome',       // Italy
  'ES': 'Europe/Madrid',     // Spain
  'NZ': 'Pacific/Auckland',  // New Zealand
  'SG': 'Asia/Singapore',    // Singapore
  'HK': 'Asia/Hong_Kong',    // Hong Kong
  'TW': 'Asia/Taipei'        // Taiwan
};

// Get user location from IP
async function getUserLocation() {
  try {
    const response = await fetch('https://geolocation-db.com/json/geoip.php?vip=false');
    const data = await response.json();
    
    // Use timezone from API, or fallback to country mapping
    let timezone = data.timezone;
    if (!timezone && data.country_code) {
      timezone = countryTimezoneMap[data.country_code] || 'UTC';
    }
    if (!timezone) {
      timezone = 'UTC';
    }
    
    // Log for debugging
    console.log('Geolocation data:', { 
      country: data.country_name,
      countryCode: data.country_code,
      timezone: timezone,
      ip: data.IPv4
    });
    
    return {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      city: data.city || '',
      timezone: timezone,
      ip: data.IPv4 || ''
    };
  } catch (error) {
    console.warn('Failed to get location:', error);
    return { country: 'Unknown', countryCode: 'XX', city: '', timezone: 'UTC', ip: '' };
  }
}

// Hash IP for privacy
function hashIP(ip) {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

async function recordView() {
  try {
    const location = await getUserLocation();
    const now = new Date();
    const timestamp = now.toISOString();
    // Use a safe key format for Firebase (replace special chars)
    const safeTimestamp = timestamp.replace(/[:.]/g, '-');
    const ipHash = hashIP(location.ip);

    // Check if this IP visited in the last 24 hours
    const ipVisitUrl = `${FIREBASE_DB_URL}/stats/views/last_visit/${ipHash}.json?auth=${FIREBASE_API_KEY}`;
    const ipVisitResponse = await fetch(ipVisitUrl);
    const lastVisitTimestamp = await ipVisitResponse.json();

    let shouldIncrementTotal = true;
    if (lastVisitTimestamp) {
      const lastVisit = new Date(lastVisitTimestamp);
      const hoursSinceLastVisit = (now - lastVisit) / (1000 * 60 * 60);

      // Don't increment if visited within last 24 hours
      if (hoursSinceLastVisit < 24) {
        shouldIncrementTotal = false;
      }
    }

    // Update total count only if this is a new visitor (24h window)
    if (shouldIncrementTotal) {
      const totalUrl = `${FIREBASE_DB_URL}/stats/views/total.json?auth=${FIREBASE_API_KEY}`;
      const totalResponse = await fetch(totalUrl);
      const currentTotal = (await totalResponse.json()) || 0;
      const newTotal = currentTotal + 1;

      await fetch(totalUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTotal)
      });

      updateViewCount(newTotal);
    }

    // Update last visit timestamp for this IP
    await fetch(ipVisitUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(timestamp)
    });

    // Always record individual visit with location data
    const visitUrl = `${FIREBASE_DB_URL}/stats/views/visits/${safeTimestamp}.json?auth=${FIREBASE_API_KEY}`;
    await fetch(visitUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp,
        country: location.country,
        countryCode: location.countryCode,
        city: location.city,
        timezone: location.timezone,
        ipHash
      })
    });

    const status = shouldIncrementTotal ? '(new visitor)' : '(returning visitor)';
    console.log(`View recorded from ${location.country} ${status}`);
  } catch (error) {
    console.error('Error recording view:', error);
    updateViewCountLocal();
  }
}

function updateViewCount(count) {
  const viewElements = document.querySelectorAll('#view-count');
  viewElements.forEach(el => {
    el.textContent = count;
    el.title = `${count} total views`;
  });
}

function updateViewCountLocal() {
  const key = 'portfolio_local_views';
  let count = parseInt(localStorage.getItem(key) || '0') + 1;
  localStorage.setItem(key, count);
  updateViewCount(count);
}

// Initialize on page load
async function initStats() {
  try {
    // Get total views from Firebase
    const totalUrl = `${FIREBASE_DB_URL}/stats/views/total.json?auth=${FIREBASE_API_KEY}`;
    const response = await fetch(totalUrl);
    const totalViews = (await response.json()) || 0;
    updateViewCount(totalViews);

    // Record this visit
    await recordView();
  } catch (error) {
    console.error('Error initializing stats:', error);
    updateViewCountLocal();
  }
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initStats);
} else {
  initStats();
}

// Scroll to top button
function createScrollToTopButton() {
  const button = document.createElement('button');
  button.id = 'scroll-to-top';
  button.innerHTML = '<i class="fas fa-arrow-up"></i>';
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: var(--accent-2);
    border: none;
    color: var(--bg);
    cursor: pointer;
    font-size: 1.2rem;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 99;
    transition: all 0.3s ease;
    box-shadow: var(--shadow);
  `;

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      button.style.display = 'flex';
    } else {
      button.style.display = 'none';
    }
  });

  document.body.appendChild(button);
}

createScrollToTopButton();

// Update last modified date
function updateLastModified() {
  const lastUpdatedElements = document.querySelectorAll('#last-updated');
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  lastUpdatedElements.forEach(el => {
    el.textContent = formattedDate;
  });
}

updateLastModified();

// Create live visitor clock with timezone (integrated with footer info)
async function createVisitorClock() {
  try {
    const location = await getUserLocation();
    
    const clockContainer = document.createElement('span');
    clockContainer.id = 'visitor-clock';
    clockContainer.style.cssText = `
      display: inline;
      margin: 0 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 0.85rem;
      color: var(--muted);
    `;

    const timeDisplay = document.createElement('span');
    timeDisplay.style.cssText = `
      font-weight: 500;
      color: var(--text);
    `;

    const tzDisplay = document.createElement('span');
    tzDisplay.style.cssText = `
      font-size: 0.8rem;
      color: var(--muted);
    `;

    clockContainer.appendChild(timeDisplay);
    clockContainer.appendChild(document.createTextNode(' • '));
    clockContainer.appendChild(tzDisplay);
    
    // Find footer and append to it
    function appendToFooter() {
      const footer = document.querySelector('footer') || document.querySelector('[id="footer"]');
      if (footer) {
        footer.appendChild(document.createTextNode(' | '));
        footer.appendChild(clockContainer);
      } else {
        // Fallback: append to body if no footer found
        document.body.appendChild(clockContainer);
      }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', appendToFooter);
    } else {
      appendToFooter();
    }

    // Calculate UTC offset using a more reliable method
    function getUTCOffset(timezone) {
      try {
        const now = new Date();
        // Get the time in the target timezone by parsing the locale string
        const tzTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        // Calculate difference in milliseconds
        const diffMs = tzTime - now;
        // Convert to hours
        const diffHours = diffMs / (1000 * 60 * 60);
        
        // Format as GMT+/-X or GMT+/-X:30 for half-hour zones
        const sign = diffHours >= 0 ? '+' : '';
        const hours = Math.floor(Math.abs(diffHours));
        const minutes = Math.round((Math.abs(diffHours) - hours) * 60);
        
        if (minutes === 0) {
          return `GMT${sign}${hours}`;
        } else {
          return `GMT${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
        }
      } catch (e) {
        console.warn('Error calculating UTC offset for timezone:', timezone, e);
        return 'UTC+0';
      }
    }

    const utcOffset = getUTCOffset(location.timezone);

    // Update clock every 100ms for smooth seconds display
    function updateClock() {
      const now = new Date();
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: location.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });

        const parts = formatter.formatToParts(now);
        let timeStr = '';
        for (let part of parts) {
          if (part.type !== 'literal') {
            timeStr += part.value;
          } else if (part.value === ':') {
            timeStr += ':';
          } else if (part.value === ' ') {
            timeStr += ' ';
          }
        }
        
        timeDisplay.textContent = timeStr;
        tzDisplay.textContent = `${location.country} (${utcOffset})`;
      } catch (e) {
        // Fallback if timezone is invalid
        console.warn('Invalid timezone:', location.timezone, e);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
        tzDisplay.textContent = location.country;
      }
    }

    updateClock();
    setInterval(updateClock, 100);
  } catch (error) {
    console.warn('Failed to create visitor clock:', error);
  }
}

createVisitorClock();
