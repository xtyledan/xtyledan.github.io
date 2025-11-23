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
    initResumeCaptcha();
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

/* Resume CAPTCHA (client-side) */
function initResumeCaptcha() {
    const btn = document.getElementById('download-resume');
    const modal = document.getElementById('captcha-modal');
    const overlay = modal && modal.querySelector('.modal-overlay');
    const form = document.getElementById('captcha-form');
    const questionEl = document.getElementById('captcha-question');
    const answerEl = document.getElementById('captcha-answer');
    const messageEl = document.getElementById('captcha-message');

    if (!btn || !modal || !form || !questionEl || !answerEl) return;

    // Simple throttling: max 5 attempts per 5 minutes
    const ATTEMPT_KEY = 'resumeCaptchaAttempts';
    const ATTEMPT_WINDOW_MS = 5 * 60 * 1000;
    const MAX_ATTEMPTS = 5;

    function getAttempts() {
        try {
            const raw = localStorage.getItem(ATTEMPT_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function recordAttempt() {
        const now = Date.now();
        const attempts = getAttempts().filter(t => now - t < ATTEMPT_WINDOW_MS);
        attempts.push(now);
        try { localStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempts)); } catch (e) {}
        return attempts.length;
    }

    function attemptsLeft() {
        const now = Date.now();
        const attempts = getAttempts().filter(t => now - t < ATTEMPT_WINDOW_MS);
        return Math.max(0, MAX_ATTEMPTS - attempts.length);
    }

    // generate simple arithmetic captcha
    function generateCaptcha() {
        const a = Math.floor(Math.random() * 8) + 2; // 2..9
        const b = Math.floor(Math.random() * 8) + 2;
        const op = ['+','-','*'][Math.floor(Math.random() * 3)];
        let q = `${a} ${op} ${b}`;
        let ans;
        switch (op) {
            case '+': ans = a + b; break;
            case '-': ans = a - b; break;
            case '*': ans = a * b; break;
        }
        return { q, ans };
    }

    let current = null;

    function openModal() {
        if (attemptsLeft() <= 0) {
            showMessage('Too many attempts. Try again later.');
            return;
        }
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        current = generateCaptcha();
        questionEl.textContent = `Solve: ${current.q}`;
        answerEl.value = '';
        answerEl.focus();
        messageEl.textContent = '';
    }

    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
        answerEl.value = '';
        messageEl.textContent = '';
        current = null;
        btn.focus();
    }

    function showMessage(msg, isError = true) {
        messageEl.textContent = msg;
        messageEl.style.color = isError ? 'var(--error)' : 'var(--success)';
    }

    // click handlers
    btn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    overlay && overlay.addEventListener('click', closeModal);
    modal.querySelectorAll('[data-modal-close]').forEach(el => el.addEventListener('click', closeModal));

    // keyboard: close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!current) return;
        const val = answerEl.value.trim();
        if (!/^-?\d+$/.test(val)) {
            showMessage('Please enter a number.');
            return;
        }
        const attempts = recordAttempt();
        if (attempts > MAX_ATTEMPTS) {
            showMessage('Too many attempts. Try again later.');
            closeModal();
            return;
        }
        if (Number(val) === current.ans) {
            showMessage('Verified — starting download...', false);
            // trigger download
            const a = document.createElement('a');
            a.href = 'daniels-resume.pdf';
            a.download = 'Tyler_Daniels_Resume.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
            // small delay so user sees message
            setTimeout(closeModal, 800);
        } else {
            const left = attemptsLeft();
            if (left <= 0) {
                showMessage('Incorrect. You have reached the maximum attempts. Try again later.');
                closeModal();
            } else {
                showMessage(`Incorrect answer. ${left} attempt(s) remaining.`);
                // generate new question
                current = generateCaptcha();
                questionEl.textContent = `Solve: ${current.q}`;
                answerEl.value = '';
                answerEl.focus();
            }
        }
    });
}

