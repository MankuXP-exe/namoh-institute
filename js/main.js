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

// ---- DYNAMIC COURSE RENDERING & TABS ----
const coursesData = {
    computer: [
        "Basic Computer",
        "Advanced Excel",
        "MS Office Suite",
        "Photoshop",
        "Data Analytics",
        "Power BI",
        "VBA Macro",
        "Typing Classes"
    ],
    accounting: [
        "Tally ERP9 / Prime",
        "GST & Taxation",
        "Diploma in Financial Accounting"
    ],
    spokenEnglish: [
        "3 Months Basic Spoken English",
        "6 Months Advance Spoken English",
        "1 Year Professional Spoken English"
    ],
    teacherTraining: [
        "NTT — Nursery Teacher Training",
        "PTT — Primary Teacher Training",
        "SPTT — Special PTT",
        "DCTT — Diploma in Computer Teacher"
    ],
    distanceEducation: [
        "BA / BCom / BSc",
        "MBA / MCA",
        "BBA / BCA",
        "MCom / MA",
        "B.Tech / M.Tech",
        "JBT / B.Ed / B.PEd"
    ],
    vocational: [
        "Fire Safety",
        "Beautician Course",
        "Yoga Courses",
        "ITI Courses",
        "Hotel Management",
        "Industrial Training",
        "Paramedical Courses"
    ]
};

const courseDetails = {
    "Basic Computer": { icon: "🖥️", color: "blue", desc: "Fundamentals of computers, MS Office basics, internet usage and typing skills.", tag: "Beginner" },
    "Advanced Excel": { icon: "📊", color: "orange", desc: "Formulas, pivot tables, charts, VLOOKUP, data analysis and macros.", tag: "Intermediate" },
    "MS Office Suite": { icon: "📝", color: "blue", desc: "Word, Excel, PowerPoint, Outlook — full professional office productivity.", tag: "Beginner" },
    "Tally ERP9 / Prime": { icon: "💰", color: "green", desc: "Complete accounting software with GST, inventory, payroll and audit features.", tag: "Professional" },
    "Photoshop": { icon: "🎨", color: "purple", desc: "Photo editing, graphic design, digital art, compositing and retouching.", tag: "Creative" },
    "GST & Taxation": { icon: "📋", color: "orange", desc: "GST filing, TDS, income tax returns and business compliance.", tag: "Finance" },
    "Data Analytics": { icon: "📈", color: "blue", desc: "Data cleaning, analysis, visualization and reporting with real datasets.", tag: "Advanced" },
    "Power BI": { icon: "📉", color: "green", desc: "Business intelligence dashboards, DAX formulas and data visualization.", tag: "Advanced" },
    "VBA Macro": { icon: "⚙️", color: "purple", desc: "Excel VBA programming, automation scripts and custom macro development.", tag: "Expert" },
    "Typing Classes": { icon: "⌨️", color: "orange", desc: "Hindi & English typing speed development — 30-60+ WPM certification.", tag: "Skill" },
    "Diploma in Financial Accounting": { icon: "📊", color: "green", desc: "<strong>Upgrade Your Skills in Commerce</strong><br>Manual Accounting (Ledger, Cash Book), Software Skills (Tally, Adv Excel), Taxation (GST, ITR, TDS) & Business Consultancy.", tag: "Commerce / Accounting" },
    "3 Months Basic Spoken English": { icon: "🗣️", color: "blue", desc: "Foundation English — grammar, vocabulary, pronunciation and everyday conversation.", tag: "3 Months" },
    "6 Months Advance Spoken English": { icon: "💬", color: "orange", desc: "Fluency development, group discussions, presentations and office English.", tag: "6 Months" },
    "1 Year Professional Spoken English": { icon: "🎤", color: "green", desc: "Complete spoken English mastery including public speaking, debate and business English.", tag: "1 Year" },
    "NTT — Nursery Teacher Training": { icon: "👶", color: "purple", desc: "Early childhood education methods, Montessori techniques and child development.", tag: "Certification" },
    "PTT — Primary Teacher Training": { icon: "📚", color: "blue", desc: "Primary school teaching pedagogy, curriculum design and classroom management.", tag: "Certification" },
    "SPTT — Special PTT": { icon: "🏫", color: "orange", desc: "Advanced primary teacher training with special education components.", tag: "Certification" },
    "DCTT — Diploma in Computer Teacher": { icon: "🎓", color: "green", desc: "Diploma course for computer teachers covering all major subjects and teaching tools.", tag: "Diploma" },
    "BA / BCom / BSc": { icon: "🎓", color: "blue", desc: "Undergraduate degrees through recognized distance learning universities.", tag: "Degree" },
    "MBA / MCA": { icon: "💼", color: "orange", desc: "Postgraduate management and computer applications degrees via distance mode.", tag: "PG Degree" },
    "BBA / BCA": { icon: "🖥️", color: "green", desc: "Bachelor's in Business Administration and Computer Applications.", tag: "Degree" },
    "MCom / MA": { icon: "📖", color: "purple", desc: "Master of Commerce and Master of Arts in various specializations.", tag: "PG Degree" },
    "B.Tech / M.Tech": { icon: "⚙️", color: "red", desc: "Engineering degrees through approved distance learning programs.", tag: "Engineering" },
    "JBT / B.Ed / B.PEd": { icon: "📏", color: "blue", desc: "Teacher education degrees — junior basic training and bachelor of education.", tag: "Education" },
    "Fire Safety": { icon: "🔥", color: "red", desc: "Fire safety management, emergency response and safety officer certification.", tag: "Safety" },
    "Beautician Course": { icon: "💄", color: "purple", desc: "Beauty therapy, hair styling, makeup artistry and salon management.", tag: "Vocational" },
    "Yoga Courses": { icon: "🧘", color: "green", desc: "Yoga instructor training, meditation techniques and wellness coaching.", tag: "Health" },
    "ITI Courses": { icon: "🏭", color: "orange", desc: "Industrial training institute courses for technical trade certifications.", tag: "Technical" },
    "Hotel Management": { icon: "🍽️", color: "blue", desc: "Hospitality, front office, food & beverage and housekeeping management.", tag: "Hospitality" },
    "Industrial Training": { icon: "🏭", color: "green", desc: "Hands-on technical training for manufacturing and industrial sectors.", tag: "Industrial" },
    "Paramedical Courses": { icon: "🩺", color: "red", desc: "Healthcare support training — lab technician, pharmacy assistant, and more.", tag: "Healthcare" }
};

const categoryLabels = {
    computer: "Computer Courses",
    accounting: "Accounting & Finance Courses",
    spokenEnglish: "Spoken English",
    teacherTraining: "Teacher Training",
    distanceEducation: "Distance Education",
    vocational: "Vocational Courses"
};

const tabMapping = {
    computer: "tab-computer",
    accounting: "tab-computer",
    spokenEnglish: "tab-english",
    teacherTraining: "tab-teacher",
    distanceEducation: "tab-distance",
    vocational: "tab-vocational"
};

function renderOptionsAndCards() {
    const fcourse = document.getElementById('fcourse');
    if (fcourse) {
        fcourse.innerHTML = '<option value="">— Select a Course —</option>';
        for (const [catKey, courses] of Object.entries(coursesData)) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = categoryLabels[catKey];
            courses.forEach(cName => {
                const opt = document.createElement('option');
                opt.textContent = cName;
                optgroup.appendChild(opt);
            });
            fcourse.appendChild(optgroup);
        }
    }

    const tabs = {
        "tab-computer": document.getElementById('tab-computer'),
        "tab-english": document.getElementById('tab-english'),
        "tab-teacher": document.getElementById('tab-teacher'),
        "tab-distance": document.getElementById('tab-distance'),
        "tab-vocational": document.getElementById('tab-vocational')
    };
    Object.values(tabs).forEach(t => { if (t) t.innerHTML = ''; });

    for (const [catKey, courses] of Object.entries(coursesData)) {
        const container = tabs[tabMapping[catKey]];
        if (!container) continue;

        courses.forEach((cName, idx) => {
            const det = courseDetails[cName] || { icon: "📚", color: "blue", desc: "", tag: "" };
            const div = document.createElement('div');
            div.className = `course-card reveal` + (idx % 4 > 0 ? ` reveal-delay-${idx % 4}` : '');
            div.innerHTML = `
                <div class="cc-icon ${det.color}">${det.icon}</div>
                <h3>${cName}</h3>
                <p>${det.desc}</p>
                <span class="cc-tag">${det.tag}</span>
            `;
            container.appendChild(div);
            // Optionally observe the card immediately
            revealObserver.observe(div);
        });
    }
}

// Initial render
renderOptionsAndCards();

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
    const msg = document.getElementById('fmsg').value.trim();

    // ---- Honeypot check: bots fill the hidden 'website' field ----
    const honeypot = document.getElementById('website');
    if (honeypot && honeypot.value.trim() !== '') {
        // Silently pretend success to fool bots
        form.reset();
        popup.classList.add('show');
        return;
    }

    // ---- Frontend validation ----
    if (!name || name.length < 2) {
        alert('Please enter your full name (at least 2 characters).');
        return;
    }
    if (!course) {
        alert('Please select a course.');
        return;
    }
    // Indian mobile: 10 digits, starting with 6–9
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''))) {
        alert('Please enter a valid 10-digit Indian mobile number (starting with 6–9).');
        return;
    }

    // ---- UI Loading state ----
    submitText.style.display = 'none';
    submitSpinner.style.display = 'inline';
    submitBtn.disabled = true;

    try {
        const res = await fetch('/api/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, course, message: msg, website: '' })
        });
        const data = await res.json();
        if (data.success) {
            popupMsg.textContent = data.message;
            popup.classList.add('show');
            form.reset();
        } else {
            alert(data.message || 'Something went wrong. Please try again or call us.');
        }
    } catch {
        // Network offline fallback — show optimistic success
        popupMsg.textContent = `Thank you, ${name}! Your enrollment request for "${course}" has been received. We will contact you at ${phone} within 24 hours.`;
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

// ---- DYNAMIC GALLERY & LIGHTBOX ----
const galleryImages = [
    // Institute
    { src: "images/gallery/art.jpg", title: "Art Room", category: "Institute" },
    { src: "images/gallery/computer lab.jpg", title: "Computer Lab", category: "Institute" },
    { src: "images/gallery/computer rom 2.jpg", title: "Computer Room", category: "Institute" },
    { src: "images/gallery/computer room.jpg", title: "Computer Room", category: "Institute" },
    { src: "images/gallery/institute.jpg", title: "NAMOH Institute Building", category: "Institute" },
    { src: "images/gallery/main entrence.jpg", title: "Main Entrance", category: "Institute" },
    { src: "images/gallery/office.jpg", title: "Office", category: "Institute" },
    { src: "images/gallery/whole.jpg", title: "Campus View", category: "Institute" },

    // Computer Course
    { src: "images/gallery/computer clases.jpg", title: "Students Learning", category: "Computer Course" },
    { src: "images/gallery/computer class.jpg", title: "Computer Training Session", category: "Computer Course" },

    // Spoken English
    { src: "images/gallery/english 2.jpg", title: "Spoken English Session", category: "Spoken English" },
    { src: "images/gallery/english 3.jpg", title: "Spoken English Class", category: "Spoken English" },
    { src: "images/gallery/english 4.jpg", title: "Group Discussion", category: "Spoken English" },
    { src: "images/gallery/english coaching.jpg", title: "English Coaching", category: "Spoken English" },
    { src: "images/gallery/english course.jpg", title: "English Course", category: "Spoken English" },
    { src: "images/gallery/english.jpg", title: "Spoken English", category: "Spoken English" },
    { src: "images/gallery/public speaking and personality development.jpg", title: "Public Speaking Session", category: "Spoken English" },
    { src: "images/gallery/spoken english.jpg", title: "Spoken English Session", category: "Spoken English" },

    // Posters & Accounting
    { src: "images/gallery/BBOSE Board.jpg", title: "BBOSE Board Poster", category: "Posters" },
    { src: "images/gallery/Diploma in Financial Accounting.jpg", title: "Accounting Session", category: "Accounting Course" },
    { src: "images/gallery/all courses.jpg", title: "All Courses Poster", category: "Posters" },
    { src: "images/gallery/bbose board 2.jpg", title: "BBOSE Board Poster", category: "Posters" },
    { src: "images/gallery/courses details.jpg", title: "Courses Details Poster", category: "Posters" },
    { src: "images/gallery/demo clases.jpg", title: "Demo Classes Poster", category: "Posters" },
    { src: "images/gallery/diploma in computer teacher traning.jpg", title: "Computer Teacher Training Poster", category: "Posters" },
    { src: "images/gallery/improve you kid speaking.jpg", title: "Spoken English Poster", category: "Posters" },
    { src: "images/gallery/nurscery teacher traning.jpg", title: "Nursery Teacher Training Poster", category: "Posters" },
    { src: "images/gallery/our courses.jpg", title: "Our Courses Poster", category: "Posters" },
    { src: "images/gallery/professional english.jpg", title: "Professional English Poster", category: "Posters" }
];

let currentGalleryImages = [];
let currentLightboxIndex = 0;

function renderGallery(filter = "All") {
    const container = document.getElementById('dynamic-gallery');
    if (!container) return;

    container.innerHTML = '';
    
    currentGalleryImages = galleryImages.filter(item => {
        if (filter === "All") return true;
        
        // Match specific category
        if (item.category === filter) return true;
        
        return false;
    });

    currentGalleryImages.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'gal-item reveal visible';
        card.style.cursor = 'pointer';
        
        const uri = encodeURI(item.src);
        
        card.innerHTML = `
            <div class="gal-inner" style="background-image: url('${uri}'); background-size: cover; background-position: center;">
                <img src="${uri}" alt="${item.title}" loading="lazy" style="display: none;">
                <div class="gal-bg" style="background: rgba(0,0,0,0.5); width: 100%; height: 100%; display:flex; flex-direction:column; justify-content:center; align-items:center; transition: background 0.3s;">
                    <div class="gal-icon" style="background: transparent;">📸</div>
                    <span style="color: white; font-weight: bold; text-align: center; padding: 0 10px; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${item.title}</span>
                    <span style="font-size:0.75rem; color: #FFD763; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${item.category}</span>
                </div>
            </div>
            <div class="gal-overlay">🔍 View</div>
        `;
        
        card.addEventListener('click', () => openLightbox(index));
        container.appendChild(card);
    });
}

// Lightbox Logic
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');

function openLightbox(index) {
    if (!lightbox) return;
    currentLightboxIndex = index;
    updateLightboxImage();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function updateLightboxImage() {
    if (currentGalleryImages.length === 0) return;
    const item = currentGalleryImages[currentLightboxIndex];
    lightboxImg.src = encodeURI(item.src);
    if(lightboxCaption) {
        lightboxCaption.textContent = item.title;
    }
}

function nextLightboxImage(e) {
    if(e) e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex + 1) % currentGalleryImages.length;
    updateLightboxImage();
}

function prevLightboxImage(e) {
    if(e) e.stopPropagation();
    currentLightboxIndex = (currentLightboxIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    updateLightboxImage();
}

if (lightbox) {
    document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-next')?.addEventListener('click', nextLightboxImage);
    document.querySelector('.lightbox-prev')?.addEventListener('click', prevLightboxImage);
    document.querySelector('.lightbox-overlay')?.addEventListener('click', closeLightbox);
}

// Filter Logic
document.querySelectorAll('.gal-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.gal-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderGallery(btn.dataset.filter);
    });
});

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderGallery();
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
