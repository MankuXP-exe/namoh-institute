/* NAMOH Institute - Interactive Logic */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header Effect
    const header = document.querySelector('.main-header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 2. Mobile Menu Toggle
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navLinks.classList.contains('active')) {
                    icon.classList.replace('fa-bars', 'fa-times');
                } else {
                    icon.classList.replace('fa-times', 'fa-bars');
                }
            }
        });

        // Close mobile menu on link click
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) icon.classList.replace('fa-times', 'fa-bars');
            });
        });
    }

    // 3. Scroll Reveal Animation
    const revealOnScroll = () => {
        const revealElements = document.querySelectorAll('.scroll-reveal, .course-card, .feature-item, .gallery-item');
        const triggerBottom = window.innerHeight * 0.85;
        revealElements.forEach(el => {
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

    // 4. Testimonial Carousel
    const track = document.querySelector('.testimonial-track');
    const cards = document.querySelectorAll('.testimonial-card');

    if (track && cards.length > 1) {
        let index = 0;
        const total = cards.length;

        setInterval(() => {
            index++;
            if (index >= total) index = 0;
            const cardWidth = cards[0].offsetWidth + 30;
            track.style.transform = `translateX(-${index * cardWidth}px)`;
        }, 5000);
    }

    // 5. Smooth Scroll for all anchor links
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

                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });

    // 6. WhatsApp Button Logic
    const waButton = document.querySelector('.wa-float');
    if (waButton) {
        waButton.addEventListener('click', () => {
            console.log('User clicked WhatsApp CTA');
        });
    }

    // 7. Enrollment Form Submission ─────────────────────────────────────
    const enrollForm = document.querySelector('#enrollForm, form[data-enroll], .enrollment-form, .enroll-form');

    if (enrollForm) {
        enrollForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const nameEl    = this.querySelector('[name="name"], #name, #enrollName');
            const phoneEl   = this.querySelector('[name="phone"], #phone, #enrollPhone');
            const courseEl  = this.querySelector('[name="course"], #course, #enrollCourse');
            const messageEl = this.querySelector('[name="message"], #message, #enrollMessage');

            const payload = {
                name:    nameEl    ? nameEl.value.trim()    : '',
                phone:   phoneEl   ? phoneEl.value.trim()   : '',
                course:  courseEl  ? (courseEl.tagName === 'SELECT' ? courseEl.value : courseEl.value.trim()) : '',
                message: messageEl ? messageEl.value.trim() : '',
            };

            // Basic client-side validation
            if (!payload.name || !payload.phone || !payload.course) {
                alert('Please fill in Name, Phone, and Course.');
                return;
            }

            const submitBtn = this.querySelector('[type="submit"], button');
            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }

            try {
                const res  = await fetch('/api/lead', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(payload),
                });
                const data = await res.json();

                if (data.success) {
                    // Show success popup / inline message
                    const popup = document.querySelector('#successPopup, .success-popup, .success-message');
                    if (popup) {
                        popup.style.display = 'block';
                        setTimeout(() => { popup.style.display = 'none'; }, 5000);
                    } else {
                        alert('Thank you! We will contact you soon.');
                    }
                    this.reset();
                } else {
                    alert(data.message || 'Submission failed. Please try again.');
                }
            } catch (err) {
                console.error('[Enrollment form]', err);
                alert('Network error. Please check your connection and try again.');
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit'; }
            }
        });
    }

    // 8. Dynamic Course Rendering & Tab Switching ──────────────────────────
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
            });
        }
    }

    renderOptionsAndCards();
    setTimeout(revealOnScroll, 100); // re-trigger for dynamically added cards

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const target = document.getElementById('tab-' + btn.dataset.tab);
            if (target) {
                target.classList.add('active');
                setTimeout(revealOnScroll, 50);
            }
        });
    });
});
