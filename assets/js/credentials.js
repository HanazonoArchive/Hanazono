/**
 * Hanazono Portfolio — Focused Certification Showcase
 * Renders the single certification selected from the timeline.
 */

import { initPageTransitions, playIncomingTransition } from './transitions.js';

export async function initCredentialsPage() {
  initPageTransitions();

  const urlParams = new URLSearchParams(window.location.search);
  const certId = (urlParams.get('id') || 'certiport-database').toLowerCase();

  try {
    const res = await fetch('data/certifications.json');
    if (!res.ok) throw new Error('Failed to load certifications.json');
    const certs = await res.json();

    const currentCert = certs.find(c => c.id.toLowerCase() === certId) || certs[0];

    renderCertDetails(currentCert, certs);
    playIncomingTransition();
  } catch (err) {
    console.error('Error loading certification:', err);
    playIncomingTransition();
  }
}

/**
 * Format YYYY-MM-DD into readable date
 */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
    }
  } catch (_) {}
  return dateStr;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

/**
 * Render certification details and sidebar
 */
function renderCertDetails(cert, allCerts) {
  document.title = `${cert.title} — Jay Mark V. Agsoy`;

  const kickerEl = document.getElementById('cert-kicker');
  const titleEl = document.getElementById('cert-title');
  const summaryEl = document.getElementById('cert-summary');
  const imageContainer = document.getElementById('cert-image-container');
  const storyCol = document.getElementById('cert-story-content');

  if (kickerEl) kickerEl.textContent = cert.kicker || 'Certification';
  if (titleEl) titleEl.textContent = cert.title;
  if (summaryEl) summaryEl.textContent = cert.description;

  // Clean path handling (support both root and relative hosting)
  const imagePath = cert.image ? (cert.image.startsWith('/') ? cert.image.slice(1) : cert.image) : '';
  const pdfPath = cert.pdf ? (cert.pdf.startsWith('/') ? cert.pdf.slice(1) : cert.pdf) : '';

  const pdfContainer = document.getElementById('cert-pdf-container');
  if (pdfContainer && pdfPath) {
    pdfContainer.innerHTML = `
      <iframe src="${pdfPath}#toolbar=0&navpanes=0&scrollbar=0&view=Fit" class="cert-pdf-frame" title="${escapeHtml(cert.title)} PDF" scrolling="no" frameborder="0"></iframe>
    `;
  }

  // Narrative / Overview section
  if (storyCol) {
    storyCol.innerHTML = `
      <section class="story-section">
        <h2>Overview</h2>
        <p>${escapeHtml(cert.description)}</p>
      </section>
    `;
  }

  // Sidebar info
  const issuerEl = document.getElementById('cert-issuer');
  const dateEl = document.getElementById('cert-date');
  const pdfBtn = document.getElementById('btn-pdf');
  const tagsContainer = document.getElementById('cert-tags');

  if (issuerEl) issuerEl.textContent = cert.issuer || '—';
  if (dateEl) dateEl.textContent = formatDate(cert.date);

  if (pdfBtn) {
    if (pdfPath) {
      pdfBtn.href = pdfPath;
      pdfBtn.style.display = 'flex';
    } else {
      pdfBtn.style.display = 'none';
    }
  }

  // Tags
  if (tagsContainer && cert.tags && Array.isArray(cert.tags)) {
    tagsContainer.innerHTML = cert.tags.map(t => `
      <span class="tag-item">${escapeHtml(t)}</span>
    `).join('');
  }
}
