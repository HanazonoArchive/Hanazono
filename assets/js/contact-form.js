// Contact form handler with rate limiting and input sanitation
const RATE_LIMIT_KEY = 'contact_form_last_submission';
const RATE_LIMIT_MINUTES = 2; // Minimum 2 minutes between submissions
const MAX_SUBMISSIONS_PER_HOUR = 5; // Max 5 submissions per hour
const SUBMISSIONS_KEY = 'contact_form_submissions';

const form = document.getElementById('contact-form');
const nameInput = document.getElementById('form-name');
const emailInput = document.getElementById('form-email');
const messageInput = document.getElementById('form-message');
const submitBtn = document.getElementById('submit-btn');
const btnText = document.getElementById('btn-text');
const statusDiv = document.getElementById('form-status');

function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `form-status form-status-${type}`;
  if (type === 'success') {
    setTimeout(() => {
      statusDiv.textContent = '';
      statusDiv.className = 'form-status';
    }, 4000);
  }
}

function sanitizeInput(input) {
  // Remove HTML tags and dangerous characters
  const cleaned = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  return cleaned.trim();
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function checkRateLimit() {
  const now = Date.now();
  const lastSubmission = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0');
  const timeSinceLastSubmission = (now - lastSubmission) / 1000 / 60; // minutes

  if (timeSinceLastSubmission < RATE_LIMIT_MINUTES) {
    const remaining = Math.ceil(RATE_LIMIT_MINUTES - timeSinceLastSubmission);
    return {
      allowed: false,
      message: `Please wait ${remaining} minute(s) before sending another message.`
    };
  }

  // Check hourly limit
  const submissionsData = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
  const oneHourAgo = now - 60 * 60 * 1000;
  const recentSubmissions = submissionsData.filter(timestamp => timestamp > oneHourAgo);

  if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_HOUR) {
    return {
      allowed: false,
      message: `You've reached the maximum submissions per hour. Please try again later.`
    };
  }

  return { allowed: true };
}

function recordSubmission() {
  const now = Date.now();
  localStorage.setItem(RATE_LIMIT_KEY, now.toString());
  
  const submissionsData = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
  const oneHourAgo = now - 60 * 60 * 1000;
  const recentSubmissions = submissionsData.filter(timestamp => timestamp > oneHourAgo);
  recentSubmissions.push(now);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(recentSubmissions));
}

function clearForm() {
  form.reset();
  nameInput.value = '';
  emailInput.value = '';
  messageInput.value = '';
}

async function submitForm(e) {
  e.preventDefault();

  // Validate rate limit
  const rateCheck = checkRateLimit();
  if (!rateCheck.allowed) {
    showStatus(rateCheck.message, 'error');
    return;
  }

  // Validate inputs
  const name = sanitizeInput(nameInput.value);
  const email = sanitizeInput(emailInput.value);
  const message = sanitizeInput(messageInput.value);

  if (!name || !email || !message) {
    showStatus('All fields are required.', 'error');
    return;
  }

  if (!validateEmail(email)) {
    showStatus('Please enter a valid email address.', 'error');
    return;
  }

  if (message.length < 10) {
    showStatus('Message must be at least 10 characters long.', 'error');
    return;
  }

  // Disable submit button
  submitBtn.disabled = true;
  btnText.textContent = 'Sending...';

  try {
    // Send form via Formspree
    const response = await fetch('https://formspree.io/f/xojbnvra', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email,
        message: message
      })
    });

    if (response.ok) {
      showStatus('✓ Message sent successfully! I\'ll get back to you soon.', 'success');
      recordSubmission();
      clearForm();
    } else {
      showStatus('Failed to send message. Please try again.', 'error');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    showStatus('An error occurred. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    btnText.textContent = 'Send';
  }
}

form.addEventListener('submit', submitForm);

// Sanitize inputs on blur
[nameInput, emailInput, messageInput].forEach(input => {
  input.addEventListener('blur', () => {
    input.value = sanitizeInput(input.value);
  });
});
