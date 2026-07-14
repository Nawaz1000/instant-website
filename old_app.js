// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

// UTF-8 safe Base64 encoding & decoding
function utf8ToBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode(parseInt(p1, 16));
    }));
}

function base64ToUtf8(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedPayload = urlParams.get('space');

    if (encodedPayload && encodedPayload.trim() !== "") {
        try {
            const cleanedPayload = encodedPayload.trim().replace(/\s/g, '');
            const decodedData = JSON.parse(base64ToUtf8(cleanedPayload));
            
            if (decodedData && decodedData.n) {
                runFullWebsiteEngine(decodedData);
            } else {
                throw new Error("Invalid payload structure.");
            }
        } catch(e) { 
            console.error("Payload decoding or initialization failed:", e);
            showDashboard();
        }
    } else {
        showDashboard();
    }

    // Set up PDF parser listener
    const pdfInput = document.getElementById('inputResumePdf');
    if (pdfInput) {
        pdfInput.addEventListener('change', handlePdfParsingEngine);
    }
};

function showDashboard() {
    document.getElementById('dashboardView').style.display = 'flex';
    document.getElementById('portfolioView').style.display = 'none';
}

// PDF text parsing and field autofill heuristics
function handlePdfParsingEngine(event) {
    const file = event.target.files[0];
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);
        pdfjsLib.getDocument(typedarray).promise.then(pdf => {
            let maxPages = Math.min(pdf.numPages, 3);
            let countPromises = [];
            for (let j = 1; j <= maxPages; j++) {
                countPromises.push(pdf.getPage(j).then(page => {
                    return page.getTextContent().then(textContent => {
                        return textContent.items.map(item => item.str).join(' ');
                    });
                }));
            }
            Promise.all(countPromises).then(pagesText => {
                let fullText = pagesText.join(' ');
                let cleanText = fullText.replace(/\s+/g, ' ');
                
                // Heuristics for Name & Title
                let nameMatch = cleanText.match(/([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})/);
                let titleMatch = cleanText.match(/(Software Engineer|UI\/UX Designer|Systems Architect|Product Designer|Product Manager|Data Scientist|Developer|Architect)/i);
                
                // Parse skills matching common keywords
                let commonSkills = ["React", "Vue", "TypeScript", "JavaScript", "HTML", "CSS", "Node.js", "Python", "Java", "AWS", "Docker", "Kubernetes", "Git", "Figma", "UI/UX", "Illustration", "Next.js", "GraphQL", "Three.js", "D3.js"];
                let foundSkills = [];
                commonSkills.forEach(s => {
                    if (cleanText.toLowerCase().includes(s.toLowerCase())) {
                        foundSkills.push(s);
                    }
                });
                if (foundSkills.length === 0) {
                    foundSkills = ["React", "Node.js", "UI/UX", "AWS"];
                }
                
                // Parse timeline chunks
                let sentences = cleanText.split(/[.●•]/).map(s => s.trim()).filter(s => s.length > 10);
                let expLines = [];
                let years = [ "2024 - Present", "2022 - 2024", "2020 - 2022" ];
                let placeholderRoles = [ "Lead Software Architect", "Senior Developer", "UI/UX Engineer" ];
                for (let i = 0; i < Math.min(sentences.length, 3); i++) {
                    expLines.push(`${years[i]} | ${placeholderRoles[i]} | ${sentences[i].substring(0, 90)}`);
                }
                
                if (nameMatch) document.getElementById('manualName').value = nameMatch[1];
                if (titleMatch) document.getElementById('manualTitle').value = titleMatch[0];
                document.getElementById('manualBio').value = "Operating at the intersection of production software engineering and human-centered design principles.";
                document.getElementById('manualSkills').value = foundSkills.join(', ');
                document.getElementById('manualExperience').value = expLines.join('\n');
            });
        });
    };
    fileReader.readAsArrayBuffer(file);
}

// Compile inputs and display Base64 URL
function compileGraphicSystem() {
    const theme = document.getElementById('themeSelect').value;
    const name = document.getElementById('manualName').value.trim() || "Alex Henderson";
    const title = document.getElementById('manualTitle').value.trim() || "Lead Designer & Developer";
    const bio = document.getElementById('manualBio').value.trim() || "Crafting minimal, intentional, and high-performance digital systems.";
    const skillsRaw = document.getElementById('manualSkills').value.trim() || "React, Node.js, UI/UX, AWS";
    const expRaw = document.getElementById('manualExperience').value.trim() || "";

    const skills = skillsRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    // Parse experience milestones from multiline text
    let experiences = [];
    if (expRaw) {
        experiences = expRaw.split('\n').map(line => {
            const parts = line.split('|').map(p => p.trim());
            return {
                year: parts[0] || "2024 - Present",
                title: parts[1] || "Project Node",
                desc: parts[2] || "Designed and optimized modular application architectures."
            };
        }).filter(item => item.year || item.title);
    } else {
        experiences = [
            { year: "2024 - Present", title: "Lead Product Engineer - Aether Labs", desc: "Leading design systems development." },
            { year: "2022 - 2024", title: "Senior Front-End Developer - Vortex Studio", desc: "Built high-performance interactive layouts." },
            { year: "2020 - 2022", title: "UI Engineer - Pulse Digital", desc: "Designed core component architectures." }
        ];
    }

    const payload = {
        th: theme,
        n: name,
        t: title,
        bio: bio,
        skl: skills,
        exp: experiences
    };

    const base64String = utf8ToBase64(JSON.stringify(payload));
    const finalUrl = window.location.origin + window.location.pathname + '?space=' + base64String;

    document.getElementById('outputUrl').innerText = finalUrl;
    
    const resultBox = document.getElementById('resultBox');
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth' });
}

function copyEngineUrl() {
    const urlText = document.getElementById('outputUrl').innerText;
    navigator.clipboard.writeText(urlText).then(() => {
        alert("Portfolio URL copied to clipboard!");
    });
}

// Router and populated theme systems
function runFullWebsiteEngine(data) {
    document.getElementById('dashboardView').style.display = 'none';
    document.getElementById('portfolioView').style.display = 'block';

    // Remove old active themes
    document.querySelectorAll('.theme-container').forEach(el => el.classList.remove('active-theme'));
    document.body.className = '';

    // Bind theme classes
    document.body.classList.add('theme-' + data.th);
    const activeTheme = document.getElementById('theme-' + data.th);
    if (activeTheme) {
        activeTheme.classList.add('active-theme');
    }

    // Dynamic builders
    if (data.th === 'novadev') {
        renderNovaDev(data);
    } else if (data.th === 'editorial') {
        renderEditorial(data);
    } else if (data.th === 'minimal') {
        renderMinimal(data);
    } else if (data.th === 'brutalist') {
        renderBrutalist(data);
    } else if (data.th === 'pop') {
        renderPop(data);
    }
}

// Map FontAwesome icons based on skill tags
function getIconForSkill(skill) {
    const s = skill.toLowerCase();
    if (s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('next') || s.includes('front')) {
        return 'fa-brands fa-react';
    } else if (s.includes('node') || s.includes('js') || s.includes('javascript') || s.includes('ts') || s.includes('typescript')) {
        return 'fa-brands fa-js';
    } else if (s.includes('aws') || s.includes('cloud') || s.includes('azure') || s.includes('gcp')) {
        return 'fa-solid fa-cloud';
    } else if (s.includes('docker') || s.includes('kube') || s.includes('infra') || s.includes('devops')) {
        return 'fa-brands fa-docker';
    } else if (s.includes('python') || s.includes('django') || s.includes('flask')) {
        return 'fa-brands fa-python';
    } else if (s.includes('figma') || s.includes('ui') || s.includes('ux') || s.includes('design') || s.includes('illustrator')) {
        return 'fa-solid fa-palette';
    } else if (s.includes('git') || s.includes('github') || s.includes('gitlab')) {
        return 'fa-brands fa-git-alt';
    } else if (s.includes('db') || s.includes('sql') || s.includes('mongo') || s.includes('postgres') || s.includes('graphql')) {
        return 'fa-solid fa-database';
    }
    return 'fa-solid fa-code';
}

/* ==========================================================================
   THEME RENDERERS
   ========================================================================== */

function renderNovaDev(data) {
    document.getElementById('novadev-name').innerText = data.n;
    document.getElementById('novadev-bio').innerText = data.bio;
    document.getElementById('novadev-footer-copy').innerText = `© 2026 ${data.n} — Crafting Digital Futures`;

    // Skills Grid
    const skillsGrid = document.getElementById('novadev-skills');
    skillsGrid.innerHTML = '';
    data.skl.forEach(skill => {
        const card = document.createElement('div');
        card.className = 'tech-card';
        card.innerHTML = `
            <i class="${getIconForSkill(skill)}"></i>
            <p>${skill}</p>
        `;
        skillsGrid.appendChild(card);
    });

    // Timeline Experiences
    const experienceTimeline = document.getElementById('novadev-experience');
    experienceTimeline.innerHTML = '';
    data.exp.forEach(item => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.innerHTML = `
            <div class="timeline-node"></div>
            <div class="timeline-year">${item.year}</div>
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-desc">${item.desc}</div>
        `;
        experienceTimeline.appendChild(div);
    });
}

function renderEditorial(data) {
    document.getElementById('editorial-name').innerText = data.n;
    document.getElementById('editorial-title').innerText = data.t.toUpperCase();
    document.getElementById('editorial-bio').innerText = data.bio;
    document.getElementById('editorial-footer-copy').innerText = `© 2026 Studio Editorial — All rights reserved. ${data.n}.`;

    // Render Testimonials based on experiences/journey
    const testimonialContainer = document.getElementById('editorial-testimonials');
    testimonialContainer.innerHTML = '';
    data.exp.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        // Fictional quotes mapping titles
        const quotes = [
            `"Working on ${item.title} was a milestone for our business. The visual architecture and typographic detail surpassed our expectations."`,
            `"Exemplary attention to detail during the ${item.year} roadmap delivery. The layout elements feel incredibly upscale."`,
            `"The custom implementation is pristine. Communication and structural execution remained flawless from start to finish."`
        ];
        card.innerHTML = `
            <h4>${quotes[index % quotes.length]}</h4>
            <div class="testimonial-author">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Client">
                <div class="author-info">
                    <h5>${item.title.split('-')[0].trim()} Partner</h5>
                    <p>${item.year}</p>
                </div>
            </div>
        `;
        testimonialContainer.appendChild(card);
    });
}

function renderMinimal(data) {
    document.getElementById('minimal-name').innerText = data.n;
    document.getElementById('minimal-title').innerText = data.t.toUpperCase();
    document.getElementById('minimal-bio').innerText = data.bio;
    document.getElementById('minimal-email').innerText = `hello@${data.n.toLowerCase().replace(/\s+/g, '')}.studio`;
    document.getElementById('minimal-email').href = `mailto:hello@${data.n.toLowerCase().replace(/\s+/g, '')}.studio`;
    document.getElementById('minimal-footer-copy').innerText = `© 2026 ${data.n.toUpperCase()} STUDIO`;

    // Custom Marquee creation - loops skills several times to fill bandwidth
    const marqueeTrack = document.getElementById('minimal-marquee');
    marqueeTrack.innerHTML = '';
    const repeatedSkills = [...data.skl, ...data.skl, ...data.skl, ...data.skl, ...data.skl];
    repeatedSkills.forEach(skill => {
        const span = document.createElement('span');
        span.innerText = `${skill.toUpperCase()}  | `;
        marqueeTrack.appendChild(span);
    });

    // Services rows from experiences
    const servicesList = document.getElementById('minimal-services');
    servicesList.innerHTML = '';
    data.exp.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'service-row';
        row.innerHTML = `
            <div class="service-num">0${idx + 1}</div>
            <div class="service-title">${item.title}</div>
            <div class="service-desc">${item.desc}</div>
        `;
        servicesList.appendChild(row);
    });
}

function renderBrutalist(data) {
    document.getElementById('brutalist-name').innerText = `I'M ${data.n.toUpperCase()}, AN INDEPENDENT CREATIVE`;
    document.getElementById('brutalist-hero-headline').innerText = data.t.toUpperCase();
    document.getElementById('brutalist-bio').innerText = data.bio;
    document.getElementById('brutalist-contact-heading').innerText = `HELLO@${data.n.toUpperCase().replace(/\s+/g, '')}.CO`;
    document.getElementById('brutalist-footer-copy').innerText = `© 2026 ${data.n.toUpperCase()} — ALL RIGHTS RESERVED`;

    // Render list work row from experiences
    const worksList = document.querySelector('#theme-brutalist .works-list');
    worksList.innerHTML = '';
    data.exp.forEach((item, idx) => {
        const row = document.createElement('a');
        row.href = '#';
        row.className = 'work-row';
        row.innerHTML = `
            <div class="work-num-title">
                <span class="work-row-num">0${idx + 1}</span>
                <span class="work-row-title">${item.title.split('-')[0].trim()}</span>
            </div>
            <div class="work-row-btn"><i class="fa-solid fa-arrow-up-right-from-square"></i></div>
        `;
        worksList.appendChild(row);
    });

    // Render Skills as block tags
    const skillsContainer = document.getElementById('brutalist-skills-container');
    skillsContainer.innerHTML = '';
    data.skl.forEach((skill, idx) => {
        const span = document.createElement('span');
        span.className = `tag-bubble ${idx % 2 === 0 ? 'yellow' : 'black'}`;
        span.innerText = skill;
        skillsContainer.appendChild(span);
    });
}

function renderPop(data) {
    document.getElementById('pop-name').innerText = `Hi! I'm ${data.n} 👋`;
    document.getElementById('pop-about-name').innerText = data.n;
    document.getElementById('pop-hero-label').innerText = data.t;
    document.getElementById('pop-bio').innerText = data.bio;
    document.getElementById('pop-footer-copy').innerText = `Made with 💖 by ${data.n} — © 2026 Studio Pop. Stay playful!`;

    // Populate about facts from experiences
    const experienceList = document.getElementById('pop-experience-list');
    experienceList.innerHTML = '';
    data.exp.forEach(item => {
        const li = document.createElement('li');
        li.innerText = `${item.title}: ${item.desc}`;
        experienceList.appendChild(li);
    });

    // Generate donut progress charts using the first 4 skills
    const chartsRow = document.getElementById('pop-charts-grid');
    chartsRow.innerHTML = '';
    const colors = [ '#fb7185', '#2dd4bf', '#fef08a', '#c084fc' ];
    const skillPercentages = [ 90, 85, 75, 95 ];

    const limitedSkills = data.skl.slice(0, 4);
    limitedSkills.forEach((skill, index) => {
        const pct = skillPercentages[index % skillPercentages.length];
        const color = colors[index % colors.length];
        const chartBox = document.createElement('div');
        chartBox.className = 'chart-box';
        chartBox.innerHTML = `
            <div class="donut-ring">
                <svg viewBox="0 0 36 36">
                    <circle class="bg" cx="18" cy="18" r="15.915"></circle>
                    <circle class="val" cx="18" cy="18" r="15.915" stroke="${color}" stroke-dasharray="${pct} 100" stroke-dashoffset="0"></circle>
                </svg>
                <span>${pct}%</span>
            </div>
            <h4>${skill}</h4>
        `;
        chartsRow.appendChild(chartBox);
    });

    // Populate Happy client bubble list using remaining skills
    const clientsGrid = document.getElementById('pop-clients-grid');
    clientsGrid.innerHTML = '';
    const defaultClients = [ "Bubbly", "Minty", "Sunny", "Lava", "Pop Co", "Doodle", "Splash", "Zoomy" ];
    
    // Mix user skills and default names for playful tags
    const displayTags = [...data.skl.slice(4), ...defaultClients].slice(0, 8);
    displayTags.forEach(tag => {
        const bubble = document.createElement('div');
        bubble.className = 'client-bubble';
        bubble.innerText = tag;
        clientsGrid.appendChild(bubble);
    });
}