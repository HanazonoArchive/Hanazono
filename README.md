# Hanazono Portfolio - Static Site

A modern, modular static portfolio website built with HTML, CSS, and JavaScript. Features a clean, component-based architecture with automatic GitHub API content loading, markdown support, and interactive modals.

## 🎯 Overview

**Hanazono** is a fully customizable static portfolio site for showcasing projects, certifications, explorations, skills, and professional information. It requires no backend or build process—just pure HTML, CSS, and JavaScript with data-driven content from JSON and markdown files.

**Tech Stack:** HTML| JavaScript | CSS

## ✨ Key Features

### 📱 Responsive Design
- Clean, modern dark theme with custom CSS variables
- Mobile-first responsive grid layouts
- Google Sans Code monospace typography
- Smooth animations and transitions with `prefers-reduced-motion` support

### 🎨 Dynamic Content
- **Profile System**: Display your bio, major, focus areas, and links
- **Skills Showcase**: Languages, tools, and platforms with Font Awesome icons
- **Portfolio Grid**: Display projects, certifications, and explorations as interactive cards
- **Modal System**: Click cards to view full details, images, and markdown-rendered content

### 🚀 Smart Loading
- **GitHub API Integration**: Automatically list markdown files from your repository
- **Local Fallback**: Falls back to `index.json` if GitHub integration is disabled
- **Markdown Support**: Front matter YAML + markdown body for rich content
- **Lazy Loading**: Efficient data fetching with caching

### 📊 Analytics
- View counter with localStorage persistence
- Last updated timestamp
- Per-page view tracking
- Scroll-to-top button for better UX

### 🔧 Developer Features
- **Markdown Generator**: Built-in tool (`generator.html`) for creating content files
- **Modular JS**: Separate data-loader, modal, utils modules
- **Easy Customization**: JSON configs for site settings and content

## 📁 Project Structure
