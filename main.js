// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize a particle background
    initParticleBackground();
    
    // Initialize a smooth scroll for navigation
    initSmoothScroll();
    
    // Add an animated cursor
    initCustomCursor();
    
    // Add reveal animations on the scroll
    initScrollReveal();
    
    // Add hover effects to cards
    initCardEffects();
});

// Particle background
function initParticleBackground() {
    const particlesConfig = {
        particles: [],
        maxParticles: 50
    };

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.id = 'particle-background';
    document.body.prepend(canvas);
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 149, 237, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    function initParticles() {
        for (let i = 0; i < particlesConfig.maxParticles; i++) {
            particlesConfig.particles.push(new Particle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particlesConfig.particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connectParticles();
        requestAnimationFrame(animate);
    }
    
    function connectParticles() {
        for (let i = 0; i < particlesConfig.particles.length; i++) {
            for (let j = i + 1; j < particlesConfig.particles.length; j++) {
                const dx = particlesConfig.particles[i].x - particlesConfig.particles[j].x;
                const dy = particlesConfig.particles[i].y - particlesConfig.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(100, 149, 237, ${0.1 * (1 - distance/150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particlesConfig.particles[i].x, particlesConfig.particles[i].y);
                    ctx.lineTo(particlesConfig.particles[j].x, particlesConfig.particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initParticles();
    animate();
}

// Smooth scroll functionality
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
}

// Custom cursor
function initCustomCursor() {
    const cursor = document.createElement('div');
    const cursorFollower = document.createElement('div');
    
    cursor.className = 'cursor';
    cursorFollower.className = 'cursor-follower';
    
    document.body.appendChild(cursor);
    document.body.appendChild(cursorFollower);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        cursorFollower.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
}

// Scroll reveal animations
function initScrollReveal() {
    const elements = document.querySelectorAll('.education-card, .card, section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        observer.observe(element);
        element.classList.add('reveal');
    });
}

// Card hover effects
function initCardEffects() {
    const cards = document.querySelectorAll('.education-card, .card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = -(x - centerX) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}