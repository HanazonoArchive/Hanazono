// Event listeners for buttons
document.getElementById('home_button').addEventListener('click', function() {
    loadContent('home');
});

document.getElementById('about_button').addEventListener('click', function() {
    loadContent('about');
});

document.getElementById('projects_button').addEventListener('click', function() {
    loadContent('projects');
});

document.getElementById('skills_button').addEventListener('click', function() {
    loadContent('skills');
});

document.getElementById('contact_button').addEventListener('click', function() {
    loadContent('contact');
});

// Function to load different content dynamically based on button clicked
function loadContent(section) {
    let contentFile = '';
    let cssFile = '';

    // Random chance to trigger the Easter egg (1% chance)
    if (Math.random() < 0.01) {
        section = 'easteregg'; // If 1% chance, switch to easteregg
    }

    // Define HTML file and CSS file for each section
    if (section === 'home') {
        contentFile = 'content/home.html';
        cssFile = 'css/home.css';
    } else if (section === 'about') {
        contentFile = 'content/about.html';
        cssFile = 'css/about.css';
    } else if (section === 'projects') {
        contentFile = 'content/projects.html';
        cssFile = 'css/projects.css';
    } else if (section === 'skills') {
        contentFile = 'content/skills.html';
        cssFile = 'css/skills.css';
    } else if (section === 'contact') {
        contentFile = 'content/contact.html';
        cssFile = 'css/contact.css';
    } else if (section === 'easteregg') {
        contentFile = 'content/easteregg.html';
        cssFile = 'css/home.css';
    }

    // Fetch the content from the corresponding HTML file
    fetch(contentFile)
        .then(response => response.text())
        .then(content => {
            // Inject the content into the page
            document.getElementById('content').innerHTML = content;
            // Load the external CSS file for the section
            loadCSS(cssFile);
        })
        .catch(error => {
            console.error('Error loading content:', error);
        });
}

// Function to load external CSS dynamically
function loadCSS(file) {
    // Remove any existing CSS link tag (if any) before adding a new one
    let existingLink = document.querySelector('link[data-type="dynamic-css"]');
    if (existingLink) {
        existingLink.remove();
    }

    // Create a new link element for the CSS file
    let linkTag = document.createElement('link');
    linkTag.rel = 'stylesheet';
    linkTag.type = 'text/css';
    linkTag.href = file;
    linkTag.setAttribute('data-type', 'dynamic-css');

    // Append the link tag to the head of the document
    document.head.appendChild(linkTag);
}

// // Default to 'home' section when the page loads
window.addEventListener('DOMContentLoaded', function() {
    loadContent('home');
});
