// Firebase REST API configuration
const FIREBASE_DB_URL = "https://portfolio-hanazonoarchive-default-rtdb.asia-southeast1.firebasedatabase.app";
const FIREBASE_API_KEY = "AIzaSyCjj_VEsYsApjW8YoUeRZfuC2MxJ3U1Py8";

// Get user location from IP
async function getUserLocation() {
  try {
    const response = await fetch('https://ipwhois.app/json/');
    const data = await response.json();
    return {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      city: data.city || '',
      timezone: data.timezone || 'UTC',
      ip: data.ip || ''
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
    const timestamp = new Date().toISOString();
    const ipHash = hashIP(location.ip);

    // Check if this IP visited in the last 24 hours
    const ipVisitUrl = `${FIREBASE_DB_URL}/stats/views/last_visit/${ipHash}.json?auth=${FIREBASE_API_KEY}`;
    const ipVisitResponse = await fetch(ipVisitUrl);
    const lastVisitTimestamp = await ipVisitResponse.json();

    let shouldIncrementTotal = true;
    if (lastVisitTimestamp) {
      const lastVisit = new Date(lastVisitTimestamp);
      const now = new Date();
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
    const visitUrl = `${FIREBASE_DB_URL}/stats/views/visits/${timestamp}.json?auth=${FIREBASE_API_KEY}`;
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
    
    const clockContainer = document.createElement('div');
    clockContainer.id = 'visitor-clock';
    clockContainer.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      color: var(--muted);
      margin: 0 12px;
    `;

    const timeDisplay = document.createElement('span');
    timeDisplay.style.cssText = `
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.05em;
      color: var(--text);
    `;

    const tzDisplay = document.createElement('span');
    tzDisplay.style.cssText = `
      font-size: 0.7rem;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    `;

    clockContainer.appendChild(timeDisplay);
    clockContainer.appendChild(document.createTextNode(' • '));
    clockContainer.appendChild(tzDisplay);
    
    // Append to body for now, will be styled in footer area
    document.body.appendChild(clockContainer);

    // Update clock every 100ms for smooth seconds display
    function updateClock() {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: location.timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });

      const parts = formatter.formatToParts(now);
      const timeStr = parts.map(p => p.value).join('');
      
      timeDisplay.textContent = timeStr;
      tzDisplay.textContent = location.country;
    }

    updateClock();
    setInterval(updateClock, 100);
  } catch (error) {
    console.warn('Failed to create visitor clock:', error);
  }
}

createVisitorClock();
