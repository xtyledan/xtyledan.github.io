# Copilot Instructions for xtyledan.github.io

## Project Overview
This is a single-page portfolio website for Tyler Daniels, showcasing professional experience, projects, education, and skills. The site was refactored from multi-page to single-page architecture to improve UX and fix navigation issues.

## Architecture & Key Components

### Single-Page Layout Structure
- **`index.html`**: All content in one HTML file with section-based navigation (home, experience, projects, education, clubs, contact)
- **Navigation Model**: Sticky fixed navbar with smooth scrolling between anchor sections (`#home`, `#experience`, etc.)
- **Key Pattern**: All sections are `<section id="...">` elements that scroll targets for navigation links with `href="#section-id"`

### Critical Features
1. **Sticky Navigation** (`initMobileNav`, `initSmoothScrolling`, `initActiveNavOnScroll`)
   - Mobile hamburger menu toggling with `.nav-toggle` + `.nav-menu.active` classes
   - Active nav highlighting based on scroll position with 150px offset for fixed nav
   - Smooth scrolling via `scrollIntoView({ behavior: 'smooth' })`

2. **Hero Section** - Complex layout with floating animated icons using CSS animations (no JS animations)
   - Stats display, call-to-action buttons, scroll indicator
   - Uses Font Awesome icons (CDN-loaded)

3. **CSS Custom Properties** - Comprehensive color system in `:root`
   - Brand colors: `--primary: #2563eb` (blue), `--secondary: #f97316` (orange)
   - Shadow variables: `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
   - Typography fonts: `--font-heading: 'Playfair Display'`, `--font-body: 'Roboto'`
   - All colors use CSS variables throughout

## Developer Workflows

### Viewing the Site
- Open `index.html` directly in browser - no build process needed
- Performance optimizations already in place: preloaded fonts and CSS, async Font Awesome loading

### Adding New Sections
1. Add new `<section id="new-section">` to `index.html`
2. Add corresponding `<a href="#new-section">` link to `.nav-menu`
3. Section must have `scroll-margin-top: 100px` in CSS (account for fixed nav)
4. If using cards/grids, reference existing patterns (`.experience-grid`, `.education-grid`)

### Styling Patterns
- Use CSS variables from `:root` (never hardcode colors like `#2563eb`)
- Card styling template: `.card` class with `background: var(--bg-primary)`, `box-shadow: var(--shadow-md)`, `border-radius: 12px`
- Button variants: `.btn-primary` (gradient bg) and `.btn-secondary` (transparent with border)
- Responsive grids: `grid-template-columns: repeat(auto-fit, minmax(300px, 1fr))` pattern

### Mobile Navigation
- Toggle element: `#nav-toggle` (hamburger icon, uses `.bar` spans)
- Menu container: `#nav-menu` (becomes visible when `.active` class applied)
- All nav links automatically close menu on click

## Project-Specific Conventions

1. **Semantic HTML**: All sections use proper heading hierarchy and semantic tags
2. **Icon System**: Font Awesome 6.4.2 - icons integrated inline with `<i class="fas fa-*">` or `<i class="fab fa-*">`
3. **Image Loading**: Images stored in `Images/` folder (note capitalization), referenced as `Images/filename`
4. **No Build Tools**: Pure HTML/CSS/JS - no npm, webpack, or frameworks
5. **Vanilla JavaScript Only**: No jQuery or other libraries; all JS in `main.js` uses vanilla DOM API

## File Organization
- `index.html` - Single HTML file with all content and meta tags
- `main.js` - Core functionality: mobile nav, smooth scrolling, active nav highlighting
- `css/style.css` - All styling (1604+ lines); color system, layouts, responsive design
- `Images/` - Company logos and visual assets
- `social.html` - Secondary page (legacy; not linked from main nav)
- `README.md` - Project documentation

## Important Patterns to Follow

**Active Navigation Logic** (`initActiveNavOnScroll`):
- Calculates section visibility with `scrollPosition + 150` offset
- Special handling for bottom of page to highlight contact section
- Special handling for top of page to highlight home section

**Performance**: Preload strategy already implemented - don't add render-blocking resources. Use async/defer loading pattern for external resources.

**Responsive Design**: Container max-width: 1200px, uses flexbox/grid with auto-fit for responsive cards. Media queries follow mobile-first approach.
