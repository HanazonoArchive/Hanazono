// Firebase REST API configuration
const FIREBASE_DB_URL = "https://portfolio-hanazonoarchive-default-rtdb.asia-southeast1.firebasedatabase.app";
const FIREBASE_API_KEY = "AIzaSyCjj_VEsYsApjW8YoUeRZfuC2MxJ3U1Py8";

// Country code to timezone mapping
const countryTimezoneMap = {
  'PH': 'Asia/Manila',
  'US': 'America/New_York',
  'GB': 'Europe/London',
  'AU': 'Australia/Sydney',
  'JP': 'Asia/Tokyo',
  'CN': 'Asia/Shanghai',
  'IN': 'Asia/Kolkata',
  'SG': 'Asia/Singapore',
  'TH': 'Asia/Bangkok',
  'MY': 'Asia/Kuala_Lumpur',
  'VN': 'Asia/Ho_Chi_Minh',
  'ID': 'Asia/Jakarta',
  'KR': 'Asia/Seoul',
  'BR': 'America/Sao_Paulo',
  'MX': 'America/Mexico_City',
  'CA': 'America/Toronto',
  'DE': 'Europe/Berlin',
  'FR': 'Europe/Paris',
  'IT': 'Europe/Rome',
  'ES': 'Europe/Madrid',
  'NZ': 'Pacific/Auckland',
  'HK': 'Asia/Hong_Kong',
  'TW': 'Asia/Taipei',
  'RU': 'Europe/Moscow',
  'ZA': 'Africa/Johannesburg',
  'EG': 'Africa/Cairo',
  'NG': 'Africa/Lagos',
  'KE': 'Africa/Nairobi',
  'AE': 'Asia/Dubai',
  'SA': 'Asia/Riyadh',
  'QA': 'Asia/Qatar',
  'TR': 'Europe/Istanbul',
  'PK': 'Asia/Karachi',
  'BD': 'Asia/Dhaka',
  'LK': 'Asia/Colombo',
  'NP': 'Asia/Kathmandu',
  'MM': 'Asia/Yangon',
  'KH': 'Asia/Phnom_Penh',
  'LA': 'Asia/Vientiane',
  'PW': 'Pacific/Palau',
  'FJ': 'Pacific/Fiji',
  'SB': 'Pacific/Guadalcanal',
  'VU': 'Pacific/Efate',
  'WS': 'Pacific/Apia',
  'TO': 'Pacific/Tongatapu',
  'KI': 'Pacific/Kiritimati',
  'MH': 'Pacific/Majuro',
  'FM': 'Pacific/Pohnpei',
  'NR': 'Pacific/Nauru',
  'TV': 'Pacific/Funafuti',
  'AR': 'America/Argentina/Buenos_Aires',
  'CL': 'America/Santiago',
  'CO': 'America/Bogota',
  'PE': 'America/Lima',
  'VE': 'America/Caracas',
  'EC': 'America/Guayaquil',
  'GY': 'America/Guyana',
  'SR': 'America/Paramaribo',
  'CR': 'America/Costa_Rica',
  'PA': 'America/Panama',
  'CU': 'America/Havana',
  'DO': 'America/Santo_Domingo',
  'PR': 'America/Puerto_Rico',
  'JM': 'America/Jamaica',
  'BB': 'America/Barbados',
  'TT': 'America/Port_of_Spain',
  'BS': 'America/Nassau',
  'BZ': 'America/Belize',
  'GT': 'America/Guatemala',
  'HN': 'America/Tegucigalpa',
  'SV': 'America/El_Salvador',
  'NI': 'America/Managua',
  'IE': 'Europe/Dublin',
  'PT': 'Europe/Lisbon',
  'GR': 'Europe/Athens',
  'SE': 'Europe/Stockholm',
  'NO': 'Europe/Oslo',
  'FI': 'Europe/Helsinki',
  'DK': 'Europe/Copenhagen',
  'BE': 'Europe/Brussels',
  'NL': 'Europe/Amsterdam',
  'AT': 'Europe/Vienna',
  'CH': 'Europe/Zurich',
  'PL': 'Europe/Warsaw',
  'CZ': 'Europe/Prague',
  'HU': 'Europe/Budapest',
  'RO': 'Europe/Bucharest',
  'BG': 'Europe/Sofia',
  'HR': 'Europe/Zagreb',
  'RS': 'Europe/Belgrade',
  'UA': 'Europe/Kyiv',
  'BY': 'Europe/Minsk',
  'LV': 'Europe/Riga',
  'LT': 'Europe/Vilnius',
  'EE': 'Europe/Tallinn',
  'IS': 'Atlantic/Reykjavik',
  'MT': 'Europe/Malta',
  'CY': 'Europe/Nicosia',
  'IL': 'Asia/Jerusalem',
  'JO': 'Asia/Amman',
  'LB': 'Asia/Beirut',
  'SY': 'Asia/Damascus',
  'IR': 'Asia/Tehran',
  'IQ': 'Asia/Baghdad',
  'KW': 'Asia/Kuwait',
  'BH': 'Asia/Bahrain',
  'OM': 'Asia/Muscat',
  'YE': 'Asia/Aden',
  'AF': 'Asia/Kabul',
  'TJ': 'Asia/Dushanbe',
  'TM': 'Asia/Ashgabat',
  'UZ': 'Asia/Tashkent',
  'KZ': 'Asia/Almaty',
  'MN': 'Asia/Ulaanbaatar',
  'TL': 'Asia/Dili',
  'BN': 'Asia/Brunei',
  'GD': 'America/Grenada',
  'LC': 'America/St_Lucia',
  'VC': 'America/St_Vincent',
  'AG': 'America/Antigua',
  'KN': 'America/St_Kitts',
  'DM': 'America/Dominica',
  'MF': 'America/Marigot',
  'BM': 'Atlantic/Bermuda',
  'BW': 'Africa/Gaborone',
  'MW': 'Africa/Blantyre',
  'MZ': 'Africa/Maputo',
  'ZM': 'Africa/Lusaka',
  'ZW': 'Africa/Harare',
  'ET': 'Africa/Addis_Ababa',
  'UG': 'Africa/Kampala',
  'TZ': 'Africa/Dar_es_Salaam',
  'RW': 'Africa/Kigali',
  'BJ': 'Africa/Porto-Novo',
  'BF': 'Africa/Ouagadougou',
  'CM': 'Africa/Douala',
  'GA': 'Africa/Libreville',
  'GQ': 'Africa/Malabo',
  'CF': 'Africa/Bangui',
  'TD': 'Africa/Ndjamena',
  'DJ': 'Africa/Djibouti',
  'ER': 'Africa/Asmara',
  'MA': 'Africa/Casablanca',
  'DZ': 'Africa/Algiers',
  'TN': 'Africa/Tunis',
  'LY': 'Africa/Tripoli',
  'SN': 'Africa/Dakar',
  'GM': 'Africa/Banjul',
  'GH': 'Africa/Accra',
  'CI': 'Africa/Abidjan',
  'SL': 'Africa/Freetown',
  'LR': 'Africa/Monrovia'
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

// Create live visitor clock (time + country only)
async function createVisitorClock() {
  try {
    const location = await getUserLocation();
    
    const clockSpan = document.createElement('span');
    clockSpan.id = 'visitor-clock';
    clockSpan.style.cssText = 'display: inline; margin: 0; font-size: inherit; font-weight: 500;';
    
    // Find footer and append to it
    function appendToFooter() {
      const footer = document.querySelector('footer') || document.querySelector('[id="footer"]');
      if (footer) {
        footer.appendChild(document.createTextNode(' | '));
        footer.appendChild(clockSpan);
      } else {
        // Fallback: append to body if no footer found
        document.body.appendChild(clockSpan);
      }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', appendToFooter);
    } else {
      appendToFooter();
    }

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
        
        clockSpan.textContent = `${timeStr} • ${location.country}`;
      } catch (e) {
        // Fallback if timezone is invalid
        console.warn('Invalid timezone:', location.timezone, e);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockSpan.textContent = `${hours}:${minutes}:${seconds} • ${location.country}`;
      }
    }

    updateClock();
    setInterval(updateClock, 100);
  } catch (error) {
    console.warn('Failed to create visitor clock:', error);
  }
}

createVisitorClock();
