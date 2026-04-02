'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initSmoothScrolling();
  initActiveNavOnScroll();
  initRevealAnimations();
});

function initMobileNav() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (!navToggle || !navMenu) {
    return;
  }

  const closeMenu = () => {
    navMenu.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    const isOpen = navMenu.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  };

  navToggle.addEventListener('click', toggleMenu);
  navToggle.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });

  document.addEventListener('click', (event) => {
    if (!navMenu.classList.contains('active')) {
      return;
    }

    const clickedInsideNav = navMenu.contains(event.target) || navToggle.contains(event.target);
    if (!clickedInsideNav) {
      closeMenu();
    }
  });
}

function initSmoothScrolling() {
  document.querySelectorAll('.nav-link[href^="#"], .brand[href^="#"], .btn[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      const targetSection = targetId ? document.querySelector(targetId) : null;

      if (!targetSection) {
        return;
      }

      event.preventDefault();
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function initActiveNavOnScroll() {
  const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1);
      const section = id ? document.getElementById(id) : null;
      return section ? { link, section } : null;
    })
    .filter(Boolean);

  const updateActiveNav = () => {
    const scrollPos = window.scrollY || window.pageYOffset || 0;
    const offset = 180;

    sections.forEach(({ link, section }) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const isActive = scrollPos >= top - offset && scrollPos < top + height - offset;
      link.classList.toggle('active', isActive);
    });
  };

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();
}

function initRevealAnimations() {
  const revealItems = document.querySelectorAll('[data-reveal]');

  if (!('IntersectionObserver' in window) || revealItems.length === 0) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.18,
    rootMargin: '0px 0px -8% 0px'
  });

  revealItems.forEach((item) => observer.observe(item));
}