// Static JavaScript - No Animations
'use strict';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initAll();
});

// Initialize all functionality
function initAll() {
    initMobileNav();
    initSmoothScrolling();
    initActiveNavOnScroll();
}

// Mobile Navigation
function initMobileNav() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        // Accessibility attributes
        navToggle.setAttribute('role', 'button');
        navToggle.setAttribute('aria-controls', 'nav-menu');
        navToggle.setAttribute('aria-expanded', 'false');

        const toggleMenu = () => {
            const isActive = navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        };

        navToggle.addEventListener('click', toggleMenu);
        // keyboard activation (Enter / Space)
        navToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
            if (e.key === 'Escape') {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape from anywhere
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }
}

// Smooth scrolling for single-page navigation
function initSmoothScrolling() {
    document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Active Navigation Highlighting based on scroll position
function initActiveNavOnScroll() {
    const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
    const sections = navLinks
        .map(link => {
            const id = link.getAttribute('href').slice(1);
            const section = document.getElementById(id);
            return section ? { link, section } : null;
        })
        .filter(Boolean);

    function updateActiveNav() {
        const scrollPos = window.scrollY || window.pageYOffset || 0;
        const offset = 150; // account for fixed nav height

        sections.forEach(({ link, section }) => {
            const top = typeof section.offsetTop === 'number' ? section.offsetTop : 0;
            const height = typeof section.offsetHeight === 'number' ? section.offsetHeight : (section.getBoundingClientRect && section.getBoundingClientRect().height) || 0;
            const inView = scrollPos >= (top - offset) && scrollPos < (top + height - offset);
            if (inView) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // update on scroll and on init
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    // run once to set initial state
    updateActiveNav();

    // expose for testing
    initActiveNavOnScroll._updateActiveNav = updateActiveNav;
}

// Expose functions for testing environments (CommonJS)
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { initAll, initMobileNav, initSmoothScrolling, initActiveNavOnScroll };
}

