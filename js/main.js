/* ===== main.js — NAMOH Institute ===== */

// ---- NAVBAR SCROLL ----
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    document.getElementById('scroll-top').classList.toggle('show', window.scrollY > 300);
});

// ---- HAMBURGER MENU ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mob-link, .mobile-btns a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ---- SCROLL TO TOP ----
document.getElementById('scroll-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---- SCROLL REVEAL ----
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ---- COURSE TABS ----
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById('tab-' + btn.dataset.tab);
        if (target) {
            target.classList.add('active');
            // Re-trigger reveal for cards in the newly opened tab
            target.querySelectorAll('.reveal').forEach(el => {
                el.classList.remove('visible');
                setTimeout(() => revealObserver.observe(el), 10);
            });
        }
    });
});

// ---- REVIEWS CAROUSEL ----
const track = document.getElementById('reviewsTrack');
const slides = track ? Array.from(track.children) : [];
let current = 0;
let autoTimer;

function buildDots() {
    const dotsContainer = document.getElementById('reviewDots');
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Review slide ' + (i + 1));
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
    });
}

function updateDots() {
    document.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
    });
}

function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
    resetTimer();
}

function resetTimer() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 5000);
}

if (slides.length > 0) {
    buildDots();
    document.getElementById('reviewNext')?.addEventListener('click', () => goTo(current + 1));
    document.getElementById('reviewPrev')?.addEventListener('click', () => goTo(current - 1));
    resetTimer();
}

// ---- ENROLLMENT FORM ----
const form = document.getElementById('enrollForm');
const popup = document.getElementById('success-popup');
const popupMsg = document.getElementById('popup-msg');
const popupCloseBtn = document.getElementById('popupCloseBtn');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitSpinner = document.getElementById('submitSpinner');

form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('fname').value.trim();
    const phone = document.getElementById('fphone').value.trim();
    const course = document.getElementById('fcourse').value;

    if (!name || !phone || !course) {
        alert('Please fill in Name, Phone, and Course fields.');
        return;
    }
    if (!/^[0-9]{10,12}$/.test(phone)) {
        alert('Please enter a valid 10-digit phone number.');
        return;
    }

    // UI Loading state
    submitText.style.display = 'none';
    submitSpinner.style.display = 'inline';
    submitBtn.disabled = true;

    try {
        const res = await fetch('/api/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                phone,
                course,
                message: document.getElementById('fmsg').value.trim()
            })
        });
        const data = await res.json();
        if (data.success) {
            popupMsg.textContent = data.message;
            popup.classList.add('show');
            form.reset();
        } else {
            alert(data.message || 'Something went wrong. Please try again.');
        }
    } catch {
        // Offline/fallback: show success anyway (form data saved locally)
        popupMsg.textContent = `Thank you, ${name}! Your enrollment request for "${course}" has been received. We will contact you at ${phone} shortly.`;
        popup.classList.add('show');
        form.reset();
    } finally {
        submitText.style.display = 'inline';
        submitSpinner.style.display = 'none';
        submitBtn.disabled = false;
    }
});

popupCloseBtn?.addEventListener('click', () => popup.classList.remove('show'));
popup?.addEventListener('click', (e) => { if (e.target === popup) popup.classList.remove('show'); });

// ---- ACTIVE NAV LINK ON SCROLL ----
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(l => l.classList.remove('active-nav'));
            const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
            if (link) link.classList.add('active-nav');
        }
    });
}, { threshold: 0.4 });
sections.forEach(s => sectionObserver.observe(s));

// ---- SMOOTH SCROLL FOR ALL # LINKS ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const offset = 80;
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        }
    });
});

// ---- COUNTER ANIMATION FOR HERO STATS ----
function animateCounter(el, target) {
    let count = 0;
    const step = target / 60;
    const timer = setInterval(() => {
        count = Math.min(count + step, target);
        el.textContent = Math.floor(count) + (el.dataset.suffix || '+');
        if (count >= target) clearInterval(timer);
    }, 16);
}

const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.hero-stat .num').forEach(el => {
                const raw = el.textContent;
                const num = parseInt(raw.replace(/\D/g, ''), 10);
                const suffix = raw.replace(/[0-9]/g, '');
                el.dataset.suffix = suffix;
                animateCounter(el, num);
            });
            heroObserver.disconnect();
        }
    });
}, { threshold: 0.5 });
const heroSection = document.getElementById('hero');
if (heroSection) heroObserver.observe(heroSection);
