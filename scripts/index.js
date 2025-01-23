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
    let content = '';
    let cssFile = '';

    // Define content and CSS file for each section
    if (section === 'home') {
        content = `
        <div class="introduction">
            <h1>Hi, I’m Jay, a Web/Software Developer</h1>
            <p>A web developer and software developer. I create software and websites to help businesses and individuals make their life easier and automated.</p>
            <a href="#projects" class="intro_button">My Projects</a>
        </div>
    
        <div class="projects-preview_title">
            <h2>Featured Projects</h2>
        </div>
    
        <div class="projects-preview">
            <div class="project-item">
                <img src="assets/MPOS-System.png" alt="MPOS system">
                <h3>MPOS System for Small Business</h3>
                <p>A mobile point-of-sale system designed for a repair and service business to streamline their operations.</p>
                <a href="#project1" class="view-project">View Project</a>
            </div>
    
            <div class="project-item">
                <img src="assets/HSRCalculator.png">
                <h3>HSR Trailblaze Calculator</h3>
                <p>A simple tool for calculating the time, consumption, and predicting the time to reach max with customized options.</p>
                <a href="#project2" class="view-project">View Project</a>
            </div>
    
            <div class="project-item">
                <img src="assets/MPOS-System.png" alt="MPOS system">
                <h3>MPOS System for Small Business</h3>
                <p>A mobile point-of-sale system designed for a repair and service business to streamline their operations.</p>
                <a href="#project1" class="view-project">View Project</a>
            </div>
        </div>
        `;
        
        cssFile = 'css/home.css';
    } else if (section === 'about') {
        content = `
        <h2>About Me!</h2>
        <p>Placeholder!</p>
        `;
        
        cssFile = 'css/about.css';
    } else if (section === 'projects') {
        content = `
        <h2>My Projects and Collaborated Projects</h2>
        <p>Placeholder!</p>
        `;
        
        cssFile = 'css/projects.css';
    } else if (section === 'skills') {
        content = `
        <h2>My Skills and Experience</h2>
        <p>Placeholder!</p>
        `;
        
        cssFile = 'css/skills.css';
    } else if (section === 'contact') {
        content = `
        <h2>Contact Me!</h2>
        <p>Email us at contact@company.com or call us at (555) 123-4567.</p>
        `;
        
        cssFile = 'css/contact.css';
    }

    // Inject content into the page
    document.getElementById('content').innerHTML = content;

    // Load the external CSS file for the section
    loadCSS(cssFile);
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

// Default to 'home' section when the page loads
window.addEventListener('DOMContentLoaded', function() {
    loadContent('home');
});
