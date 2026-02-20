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
function generateCaptcha() {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let ans = 0;
    let q = '';
    
    if (op === '+') {
        ans = a + b;
        q = `${a} + ${b}`;
    } else if (op === '-') {
        ans = a - b;
        q = `${a} - ${b}`;
    } else {
        ans = a * b;
        q = `${a} × ${b}`;
    }
    
    return { q, ans };
}

function initResumeCaptcha() {
    try {
    const btn = document.getElementById('download-resume');
    const modal = document.getElementById('captcha-modal');
    const overlay = modal && modal.querySelector('.modal-overlay');
    const form = document.getElementById('captcha-form');
    const questionEl = document.getElementById('captcha-question');
    const answerEl = document.getElementById('captcha-answer');
    const messageEl = document.getElementById('captcha-message');

    if (!messageEl) console.warn('Captcha: message element not found');

    if (!btn || !modal || !form || !questionEl || !answerEl) {
        console.error('Captcha: required elements missing', { btn, modal, form, questionEl, answerEl });
        if (messageEl) messageEl.textContent = 'Verification unavailable (UI error).';
        return;
    }

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

    // reCAPTCHA integration
    let widgetId = null;
    const captchaDiv = document.getElementById('g-recaptcha');
    // Fallback elements
    const fallbackEl = document.getElementById('captcha-fallback');
    const fallbackQuestionEl = document.getElementById('captcha-question');
    const fallbackAnswerEl = document.getElementById('captcha-answer');
    let fallbackActive = false;

    function renderRecaptchaIfReady() {
        try {
            if (typeof grecaptcha !== 'undefined' && captchaDiv && widgetId === null) {
                // render and get widget id
                widgetId = grecaptcha.render(captchaDiv, {
                    'sitekey': captchaDiv.getAttribute('data-sitekey'),
                    'theme': 'light'
                });
                // initial scale
                scaleRecaptcha();
            }
        } catch (err) {
            console.error('reCAPTCHA render failed', err);
            if (messageEl) messageEl.textContent = 'reCAPTCHA failed to load.';
        }
    }

    function resetRecaptcha() {
        try { if (typeof grecaptcha !== 'undefined' && widgetId !== null) grecaptcha.reset(widgetId); } catch (e) {}
    }

    function openModal() {
        if (attemptsLeft() <= 0) {
            showMessage('Too many attempts. Try again later.');
            return;
        }
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('open');
        messageEl.textContent = '';
        // ensure grecaptcha rendered
        renderRecaptchaIfReady();
        resetRecaptcha();
        // focus the submit button so keyboard users can tab to the widget
        const submit = modal.querySelector('button[type="submit"]');
        if (submit) submit.focus();
        // ensure widget visible
        try { captchaDiv && captchaDiv.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
        scaleRecaptcha();
        // If reCAPTCHA doesn't load within short time, enable numeric fallback for testing/local
        setTimeout(() => {
            if ((typeof grecaptcha === 'undefined' || widgetId === null) && fallbackEl) {
                console.warn('reCAPTCHA not available — enabling numeric fallback');
                fallbackActive = true;
                fallbackEl.hidden = false;
                if (fallbackQuestionEl) {
                    const v = generateCaptcha();
                    fallbackEl.dataset.answer = v.ans;
                    fallbackQuestionEl.textContent = `Solve: ${v.q}`;
                }
                if (fallbackAnswerEl) { fallbackAnswerEl.value = ''; fallbackAnswerEl.focus(); }
            }
        }, 700);
    }

    function closeModal() {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('open');
        messageEl.textContent = '';
        resetRecaptcha();
        // hide fallback when closing
        if (fallbackEl) { fallbackEl.hidden = true; fallbackActive = false; }
        btn.focus();
    }

    function showMessage(msg, isError = true) {
        messageEl.textContent = msg;
        messageEl.style.color = isError ? 'var(--error)' : 'var(--success)';
    }

    // click handlers
    btn.addEventListener('click', (e) => { try { e.preventDefault(); openModal(); } catch (err) { console.error('Captcha open error', err); if (messageEl) messageEl.textContent = 'Unable to open verification UI.'; } });
    overlay && overlay.addEventListener('click', closeModal);
    modal.querySelectorAll('[data-modal-close]').forEach(el => el.addEventListener('click', closeModal));

    // keyboard: close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    form.addEventListener('submit', (e) => {
        try {
            e.preventDefault();
            const attempts = recordAttempt();
            if (attempts > MAX_ATTEMPTS) {
                showMessage('Too many attempts. Try again later.');
                closeModal();
                return;
            }

            // If fallback is active, validate numeric answer
            if (fallbackActive) {
                const ans = (fallbackAnswerEl && (fallbackAnswerEl.value || '').trim()) || '';
                if (!/^-?\d+$/.test(ans)) { showMessage('Please enter a number.'); return; }
                const expected = Number(fallbackEl && fallbackEl.dataset && fallbackEl.dataset.answer);
                if (Number(ans) === expected) {
                    showMessage('Verified — starting download...', false);
                    try { const a = document.createElement('a'); a.href = 'daniels-resume.pdf'; a.download = 'Tyler_Daniels_Resume.pdf'; document.body.appendChild(a); a.click(); a.remove(); } catch (dlErr) { console.error('Download trigger failed', dlErr); showMessage('Download failed to start. You can access the resume directly.'); }
                    setTimeout(() => { closeModal(); }, 800);
                } else {
                    const left = attemptsLeft();
                    if (left <= 0) { showMessage('Incorrect. You have reached the maximum attempts. Try again later.'); closeModal(); }
                    else { showMessage(`Incorrect answer. ${left} attempt(s) remaining.`); fallbackAnswerEl && fallbackAnswerEl.focus(); }
                }
                return;
            }

            // Otherwise use grecaptcha token if available
            if (typeof grecaptcha === 'undefined' || widgetId === null) {
                showMessage('reCAPTCHA not ready. Please wait a moment or try the fallback.');
                console.warn('grecaptcha not ready', { grecaptcha, widgetId });
                return;
            }
            const token = grecaptcha.getResponse(widgetId);
            if (!token) { showMessage('Please complete the reCAPTCHA.'); return; }

            // Client-side only: if grecaptcha has a token, treat as success and download
            showMessage('Verified — starting download...', false);
            try { const a = document.createElement('a'); a.href = 'daniels-resume.pdf'; a.download = 'Tyler_Daniels_Resume.pdf'; document.body.appendChild(a); a.click(); a.remove(); } catch (dlErr) { console.error('Download trigger failed', dlErr); showMessage('Download failed to start. You can access the resume directly.'); }
            setTimeout(() => { resetRecaptcha(); closeModal(); }, 800);
        } catch (err) {
            console.error('reCAPTCHA submission error', err);
            if (messageEl) messageEl.textContent = 'An unexpected error occurred.';
        }
    });

    // scaling helper: scale widget to container width if needed
    const reCaptchaNativeWidth = 304; // default widget width
    function scaleRecaptcha() {
        try {
            const container = modal.querySelector('.captcha-container') || modal.querySelector('.modal-panel');
            if (!container || !captchaDiv) return;
            const containerWidth = container.clientWidth;
            if (reCaptchaNativeWidth > containerWidth) {
                const scale = containerWidth / reCaptchaNativeWidth;
                captchaDiv.style.transform = `scale(${scale})`;
                captchaDiv.style.transformOrigin = 'left top';
            } else {
                captchaDiv.style.transform = '';
            }
        } catch (err) { /* ignore */ }
    }

    // debounce helper
    let resizeTimer = null;
    window.addEventListener('resize', () => { if (resizeTimer) clearTimeout(resizeTimer); resizeTimer = setTimeout(scaleRecaptcha, 120); });

    // Try render periodically until grecaptcha is available (script loads async)
    const renderInterval = setInterval(() => { if (typeof grecaptcha !== 'undefined') { renderRecaptchaIfReady(); clearInterval(renderInterval); } }, 300);
    } catch (outerErr) {
        console.error('initResumeCaptcha failed', outerErr);
        const modal = document.getElementById('captcha-modal');
        const messageEl = modal && modal.querySelector('#captcha-message');
        if (messageEl) messageEl.textContent = 'Verification temporarily unavailable.';
    }
}

