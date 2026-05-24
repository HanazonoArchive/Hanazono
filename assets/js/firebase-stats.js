import { initializeApp } from 'https://www.gstatic.com/firebaseapps/11.0.2/firebase-app.js';
import { getDatabase, ref, get, set, update, increment } from 'https://www.gstatic.com/firebaseapps/11.0.2/firebase-database.js';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCjj_VEsYsApjW8YoUeRZfuC2MxJ3U1Py8",
  authDomain: "portfolio-hanazonoarchive.firebaseapp.com",
  projectId: "portfolio-hanazonoarchive",
  storageBucket: "portfolio-hanazonoarchive.firebasestorage.app",
  messagingSenderId: "472791185335",
  appId: "1:472791185335:web:a241ec20131b860b5dda32",
  measurementId: "G-ZFSFSGS5T1",
  databaseURL: "https://portfolio-hanazonoarchive-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Get user location from IP
async function getUserLocation() {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      city: data.city || '',
      ip: data.ip || ''
    };
  } catch (error) {
    console.warn('Failed to get location:', error);
    return { country: 'Unknown', countryCode: 'XX', city: '', ip: '' };
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
    const ipHash = hashIP(location.ip);

    const viewsRef = ref(database, 'stats/views');
    
    // Get current data
    const snapshot = await get(viewsRef);
    const currentData = snapshot.val() || { total: 0, visits: [] };
    
    // Add new visit
    const newVisit = {
      timestamp,
      country: location.country,
      countryCode: location.countryCode,
      city: location.city,
      ipHash
    };

    // Update database with increment and new visit
    const updates = {
      'stats/views/total': (currentData.total || 0) + 1,
      [`stats/views/visits/${now.getTime()}`]: newVisit
    };

    await update(ref(database), updates);

    // Update UI
    updateViewCount(currentData.total + 1);
    console.log(`View recorded from ${location.country}`);
  } catch (error) {
    console.error('Error recording view:', error);
    // Fallback to localStorage
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
    const viewsRef = ref(database, 'stats/views/total');
    const snapshot = await get(viewsRef);
    const totalViews = snapshot.val() || 0;
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
