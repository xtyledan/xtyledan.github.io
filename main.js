// Static JavaScript - No Animations
'use strict';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initAll();
});

// Initialize all functionality
function initAll() {
    initMobileNav();
    initActiveNavByUrl();
}

// Mobile Navigation
function initMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            });
        });
    }
}

// Active Navigation Highlighting
function initActiveNavByUrl() {
    const navLinks = document.querySelectorAll('.nav-link');
    const path = window.location.pathname;
    let currentPage = path.split('/').pop();
    if (!currentPage) currentPage = 'index.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        const hrefPage = href.split('/').pop();

        if (hrefPage === currentPage || (currentPage === 'index.html' && (hrefPage === '' || href === './'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Smooth scroll functionality
// Smooth scroll was used for in-page anchors. No longer needed with multi-page setup.