/* NAMOH Institute - Interactive Logic */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header Effect
    const header = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.replace('fa-bars', 'fa-times');
        } else {
            icon.classList.replace('fa-times', 'fa-bars');
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
        });
    });

    // 3. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.scroll-reveal, .course-card, .feature-item, .gallery-item');
    
    const revealOnScroll = () => {
        const triggerBottom = window.innerHeight * 0.85;
        revealElements.forEach(el => {
            // Add initial class if not present
            if (!el.classList.contains('scroll-reveal')) {
                el.classList.add('scroll-reveal');
            }
            
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                el.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // 4. Testimonial Carousel (Simple Implementation)
    const track = document.querySelector('.testimonial-track');
    const cards = document.querySelectorAll('.testimonial-card');
    
    if (track && cards.length > 1) {
        let index = 0;
        const total = cards.length;
        
        // Clone first few for seamless loop (optional, keeping it simple for now)
        setInterval(() => {
            index++;
            if (index >= total) index = 0;
            
            const cardWidth = cards[0].offsetWidth + 30; // 30 is the gap
            track.style.transform = `translateX(-${index * cardWidth}px)`;
        }, 5000);
    }

    // 5. Smooth Scroll for all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 6. WhatsApp Button Logic (Optional: Log or tracking)
    const waButton = document.querySelector('.wa-float');
    if (waButton) {
        waButton.addEventListener('click', () => {
            console.log('User clicked WhatsApp CTA');
        });
    }
});
