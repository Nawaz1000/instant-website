// 6 Minimal Placeholder Templates
// The user can easily replace the HTML design for each theme below.
// Each theme receives a 'data' object containing: name, title, bio, skills, projects, experience, contact

const commonHead = (data, themeName) => {
  const title = data.name ? `${data.name} | Portfolio` : 'Portfolio';
  const description = data.bio || 'Professional Portfolio';
  return `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@300;400;600;700&family=Fira+Code:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    .theme-label { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); }
  </style>
`;
};

export const themes = {
  theme1: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
  ${commonHead(data, "Theme 1 - Modern Tech Placeholder")}
  <style>
    body { font-family: 'Space Grotesk', sans-serif; }
  </style>
</head>
<body class="bg-[#0b0c16] text-[#e2e8f0] min-h-screen px-6 py-12 flex flex-col justify-between">
  <main class="max-w-3xl mx-auto w-full space-y-12">
    <!-- Header -->
    <header class="flex justify-between items-center border-b border-white/10 pb-6">
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">${data.name || 'Portfolio Owner'}</h1>
        <p class="text-sm text-gray-400 mt-1">${data.title || 'Your Title / Profession'}</p>
      </div>
      <span class="text-[10px] uppercase font-bold tracking-widest text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full bg-purple-500/5">Theme 1</span>
    </header>

    <!-- Bio -->
    <section class="space-y-3">
      <h2 class="text-lg font-bold text-white uppercase tracking-wider text-purple-400">About Me</h2>
      <p class="text-gray-300 font-light leading-relaxed">${data.bio || 'Provide a description or upload a document to generate your bio.'}</p>
    </section>

    <!-- Skills -->
    <section class="space-y-4">
      <h2 class="text-lg font-bold text-white uppercase tracking-wider text-purple-400">Skills</h2>
      <div class="flex flex-wrap gap-2">
        ${(data.skills && data.skills.length > 0 ? data.skills : ['HTML', 'CSS', 'JavaScript']).map(s => `
          <span class="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs text-gray-300">${s}</span>
        `).join('')}
      </div>
    </section>

    <!-- Projects -->
    <section class="space-y-6">
      <h2 class="text-lg font-bold text-white uppercase tracking-wider text-purple-400">Projects</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${(data.projects && data.projects.length > 0 ? data.projects : [{title: 'Sample Project', desc: 'A placeholder project description.', tags: ['React']}]).map(p => `
          <div class="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-3">
            <h3 class="font-bold text-white">${p.title}</h3>
            <p class="text-xs text-gray-450 font-light leading-relaxed">${p.desc}</p>
            <div class="flex gap-1.5 flex-wrap">
              ${(p.tags || []).map(t => `<span class="bg-purple-500/10 text-purple-300 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">${t}</span>`).join('')}
            </div>
            ${p.link ? `<a href="${p.link.startsWith('http') ? p.link : 'https://' + p.link}" target="_blank" class="text-[10px] text-purple-400 hover:text-purple-300 font-bold uppercase tracking-wider block">View →</a>` : ''}
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Experience -->
    <section class="space-y-6">
      <h2 class="text-lg font-bold text-white uppercase tracking-wider text-purple-400">Experience</h2>
      <div class="space-y-4 border-l-2 border-white/5 pl-4 ml-2">
        ${(data.experience && data.experience.length > 0 ? data.experience : [{role: 'Professional Role', company: 'Company Name', period: '2024 - Present', desc: 'Describe your achievements in this role.'}]).map(e => `
          <div class="space-y-1 relative">
            <div class="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-purple-500"></div>
            <div class="flex justify-between items-start flex-wrap gap-1">
              <h3 class="font-bold text-white text-sm">${e.role} @ ${e.company}</h3>
              <span class="text-[10px] text-gray-500 font-mono">${e.period}</span>
            </div>
            <p class="text-xs text-gray-400 leading-relaxed font-light">${e.desc}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Contact -->
    <footer class="border-t border-white/10 pt-8 text-center space-y-4">
      <h2 class="text-sm font-bold text-white uppercase tracking-wider">Get in Touch</h2>
      <div class="flex justify-center gap-6 text-sm text-gray-400">
        ${data.contact?.email ? `<a href="mailto:${data.contact.email}" class="hover:text-purple-400 transition-colors"><i class="fa-solid fa-envelope mr-1.5"></i>Email</a>` : ''}
        ${data.contact?.github ? `<a href="https://github.com/${data.contact.github.replace(/https?:\/\/github\.com\//i, '')}" target="_blank" class="hover:text-purple-400 transition-colors"><i class="fa-brands fa-github mr-1.5"></i>GitHub</a>` : ''}
        ${data.contact?.linkedin ? `<a href="https://linkedin.com/in/${data.contact.linkedin.replace(/https?:\/\/linkedin\.com\/in\//i, '')}" target="_blank" class="hover:text-purple-400 transition-colors"><i class="fa-brands fa-linkedin-in mr-1.5"></i>LinkedIn</a>` : ''}
      </div>
    </footer>
  </main>
</body>
</html>
`,

  theme2: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
  ${commonHead(data, "Theme 2 - Terminal Console")}
  <style>
    body { font-family: 'Fira Code', monospace; }
  </style>
</head>
<body class="bg-[#050505] text-[#00ff66] min-h-screen px-4 py-8 md:p-12 flex flex-col justify-between selection:bg-[#00ff66]/20 selection:text-[#00ff66]">
  <main class="max-w-3xl mx-auto w-full space-y-8">
    <!-- Header -->
    <header class="border border-[#00ff66]/30 p-4 rounded bg-[#0b0b0b]/60 flex justify-between items-center">
      <div>
        <div class="text-xs text-[#00ff66]/60 font-bold">$ whoami</div>
        <h1 class="text-2xl font-bold uppercase tracking-wider text-white mt-1">${data.name || 'DEVELOPER'}</h1>
        <p class="text-xs text-[#00ff66]/80 mt-1">&gt; ${data.title || 'SYSTEMS ENGINEER'}</p>
      </div>
      <span class="text-[10px] font-bold border border-[#00ff66]/50 px-2 py-0.5 rounded">THEME 2</span>
    </header>

    <!-- Bio / Info -->
    <section class="border border-[#00ff66]/20 p-4 rounded space-y-2">
      <div class="text-xs text-[#00ff66]/60 font-bold">$ cat about_me.txt</div>
      <p class="text-xs leading-relaxed text-white/90">${data.bio || 'Awaiting professional records. Provide a description or upload a document.'}</p>
    </section>

    <!-- Skills -->
    <section class="border border-[#00ff66]/20 p-4 rounded space-y-3">
      <div class="text-xs text-[#00ff66]/60 font-bold">$ ls skills/</div>
      <div class="text-xs flex flex-wrap gap-x-6 gap-y-2">
        ${(data.skills && data.skills.length > 0 ? data.skills : ['Shell', 'Python', 'Linux']).map(s => `
          <span>[ * ] ${s}</span>
        `).join('')}
      </div>
    </section>

    <!-- Projects -->
    <section class="border border-[#00ff66]/20 p-4 rounded space-y-4">
      <div class="text-xs text-[#00ff66]/60 font-bold">$ ./display_projects.sh</div>
      <div class="space-y-4">
        ${(data.projects && data.projects.length > 0 ? data.projects : [{title: 'Project Alpha', desc: 'Minimal CLI tool script.', tags: ['Bash']}]).map(p => `
          <div class="border-t border-[#00ff66]/10 pt-3 first:border-0 first:pt-0">
            <h3 class="font-bold text-white text-xs">&gt; ${p.title}</h3>
            <p class="text-[11px] text-[#00ff66]/80 mt-1">${p.desc}</p>
            <div class="text-[9px] text-[#00ff66]/50 mt-1.5 font-bold">TAGS: ${ (p.tags || []).join(', ') }</div>
            ${p.link ? `<a href="${p.link.startsWith('http') ? p.link : 'https://' + p.link}" target="_blank" class="text-[9px] text-[#00ff66] hover:underline font-bold mt-1 inline-block">[OPEN_LINK]</a>` : ''}
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Experience -->
    <section class="border border-[#00ff66]/20 p-4 rounded space-y-4">
      <div class="text-xs text-[#00ff66]/60 font-bold">$ query --history</div>
      <div class="space-y-3 text-xs">
        ${(data.experience && data.experience.length > 0 ? data.experience : [{role: 'Job Role', company: 'Company', period: '2024', desc: 'Responsibilities...'}]).map(e => `
          <div>
            <div class="flex justify-between">
              <span class="text-white font-bold">${e.role} @ ${e.company}</span>
              <span class="text-[#00ff66]/50 font-mono">${e.period}</span>
            </div>
            <p class="text-[11px] text-white/70 mt-1">${e.desc}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Contact / Footer -->
    <footer class="border border-[#00ff66]/30 p-4 rounded bg-[#0b0b0b]/60 text-center space-y-3">
      <div class="text-xs text-[#00ff66]/60 font-bold">$ ping -c 1 contact</div>
      <div class="text-xs flex justify-center gap-6">
        ${data.contact?.email ? `<a href="mailto:${data.contact.email}" class="hover:underline">email</a>` : ''}
        ${data.contact?.github ? `<a href="https://github.com/${data.contact.github.replace(/https?:\/\/github\.com\//i, '')}" target="_blank" class="hover:underline">github</a>` : ''}
        ${data.contact?.linkedin ? `<a href="https://linkedin.com/in/${data.contact.linkedin.replace(/https?:\/\/linkedin\.com\/in\//i, '')}" target="_blank" class="hover:underline">linkedin</a>` : ''}
      </div>
    </footer>
  </main>
</body>
</html>
`,

  theme3: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
  ${commonHead(data, "Theme 3 - Minimal Slate")}
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen px-6 py-12 md:py-20 flex flex-col justify-between">
  <main class="max-w-2xl mx-auto w-full space-y-12">
    <!-- Header -->
    <header class="space-y-2 border-b border-slate-200 pb-6 flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">${data.name || 'Portfolio Owner'}</h1>
        <p class="text-sm font-semibold text-slate-500 uppercase tracking-wider">${data.title || 'Profession / Title'}</p>
      </div>
      <span class="text-[9px] uppercase font-bold tracking-widest text-slate-400 border border-slate-200 px-2 py-0.5 bg-slate-100 rounded">Theme 3</span>
    </header>

    <!-- Bio -->
    <section class="space-y-2">
      <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Biography</h2>
      <p class="text-slate-600 text-sm leading-relaxed font-normal">${data.bio || 'Your bio will appear here after parsing prompt description or document.'}</p>
    </section>

    <!-- Skills -->
    <section class="space-y-3">
      <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Expertise</h2>
      <div class="flex flex-wrap gap-1.5">
        ${(data.skills && data.skills.length > 0 ? data.skills : ['Skills']).map(s => `
          <span class="bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded text-xs">${s}</span>
        `).join('')}
      </div>
    </section>

    <!-- Projects -->
    <section class="space-y-4">
      <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Works</h2>
      <div class="space-y-4">
        ${(data.projects && data.projects.length > 0 ? data.projects : [{title: 'Project Title', desc: 'Description of project.'}]).map(p => `
          <div class="border border-slate-200 p-5 rounded bg-white space-y-2">
            <h3 class="font-bold text-slate-900 text-sm">${p.title}</h3>
            <p class="text-xs text-slate-600 leading-relaxed font-light">${p.desc}</p>
            ${p.tags && p.tags.length > 0 ? `<div class="text-[10px] text-slate-400 font-medium">Built with: ${p.tags.join(', ')}</div>` : ''}
            ${p.link ? `<a href="${p.link.startsWith('http') ? p.link : 'https://' + p.link}" target="_blank" class="text-[10px] text-slate-500 hover:text-slate-800 font-semibold block">View Project →</a>` : ''}
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Experience -->
    <section class="space-y-4">
      <h2 class="text-xs font-bold text-slate-400 uppercase tracking-widest">Career History</h2>
      <div class="space-y-4">
        ${(data.experience && data.experience.length > 0 ? data.experience : [{role: 'Professional Role', company: 'Company Name', period: '2024', desc: 'Role description.'}]).map(e => `
          <div class="flex justify-between items-start border-l border-slate-200 pl-4">
            <div class="space-y-1">
              <h3 class="font-bold text-slate-900 text-sm">${e.role} @ ${e.company}</h3>
              <p class="text-xs text-slate-600 font-light leading-relaxed">${e.desc}</p>
            </div>
            <span class="text-[10px] font-mono text-slate-400">${e.period}</span>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Contact -->
    <footer class="border-t border-slate-200 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
      <p>© ${data.name || 'Portfolio Owner'}. All rights reserved.</p>
      <div class="flex gap-4">
        ${data.contact?.email ? `<a href="mailto:${data.contact.email}" class="hover:text-slate-800 transition-colors">Email</a>` : ''}
        ${data.contact?.github ? `<a href="https://github.com/${data.contact.github.replace(/https?:\/\/github\.com\//i, '')}" target="_blank" class="hover:text-slate-800 transition-colors">GitHub</a>` : ''}
        ${data.contact?.linkedin ? `<a href="https://linkedin.com/in/${data.contact.linkedin.replace(/https?:\/\/linkedin\.com\/in\//i, '')}" target="_blank" class="hover:text-slate-800 transition-colors">LinkedIn</a>` : ''}
      </div>
    </footer>
  </main>
</body>
</html>
`,

  theme5: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
  ${commonHead(data, "Theme 5 - Editorial Serif")}
  <style>
    body { font-family: 'Playfair Display', serif; }
    .sans-serif-text { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="bg-[#fbfbf8] text-[#1c1c1c] min-h-screen px-6 py-16 flex flex-col justify-between">
  <main class="max-w-2xl mx-auto w-full space-y-12">
    <!-- Header -->
    <header class="p-6 md:p-12 flex justify-between items-end border-b-2 border-black">
      <h1 class="text-4xl font-normal italic tracking-tight text-[#1c1c1c]">${data.name || 'Portfolio Owner'}</h1>
      <p class="sans-serif-text text-xs uppercase tracking-widest font-semibold text-gray-500 mt-1">${data.title || 'Profession / Specialization'}</p>
    </header>

    <!-- Bio -->
    <section class="text-center max-w-xl mx-auto">
      <p class="text-base md:text-lg leading-relaxed font-normal text-gray-800 italic">"${data.bio || 'Your biography will appear here after parsing your text.'}"</p>
    </section>

    <!-- Skills -->
    <section class="space-y-4 border-t border-b border-[#1c1c1c]/10 py-6 text-center">
      <span class="sans-serif-text text-[10px] uppercase font-bold tracking-widest text-gray-400">Core Focus Areas</span>
      <div class="sans-serif-text flex flex-wrap justify-center gap-3 text-xs font-semibold">
        ${(data.skills && data.skills.length > 0 ? data.skills : ['Editorial Design']).map(s => `
          <span class="text-[#1c1c1c] border-b border-[#1c1c1c] pb-0.5">${s}</span>
        `).join('')}
      </div>
    </section>

    <!-- Projects -->
    <section class="space-y-6">
      <h2 class="sans-serif-text text-[10px] uppercase font-bold tracking-widest text-center text-gray-400">Selected Case Studies</h2>
      <div class="space-y-6">
        ${(data.projects && data.projects.length > 0 ? data.projects : [{title: 'Case Title', desc: 'Case study description.'}]).map(p => `
          <div class="space-y-2 text-center">
            <h3 class="text-xl font-bold text-gray-900">${p.title}</h3>
            <p class="sans-serif-text text-xs text-gray-600 leading-relaxed font-light max-w-lg mx-auto">${p.desc}</p>
            ${p.link ? `<a href="${p.link.startsWith('http') ? p.link : 'https://' + p.link}" target="_blank" class="sans-serif-text text-[10px] text-gray-500 hover:text-gray-800 font-semibold block mt-2">Read More →</a>` : ''}
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Experience -->
    <section class="space-y-6">
      <h2 class="sans-serif-text text-[10px] uppercase font-bold tracking-widest text-center text-gray-400">Professional History</h2>
      <div class="space-y-4">
        ${(data.experience && data.experience.length > 0 ? data.experience : [{role: 'Professional Role', company: 'Company Name', period: '2024', desc: 'Role description.'}]).map(e => `
          <div class="text-center space-y-1">
            <h3 class="text-lg font-bold">${e.role} @ ${e.company}</h3>
            <span class="sans-serif-text text-[10px] text-gray-400 italic">${e.period}</span>
            <p class="sans-serif-text text-xs text-gray-650 leading-relaxed font-light max-w-lg mx-auto mt-2">${e.desc}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Footer / Contact -->
    <footer class="sans-serif-text border-t border-[#1c1c1c]/10 pt-8 text-center text-xs space-y-4 text-gray-500">
      <div class="flex justify-center gap-6">
        ${data.contact?.email ? `<a href="mailto:${data.contact.email}" class="hover:text-black">email</a>` : ''}
        ${data.contact?.github ? `<a href="https://github.com/${data.contact.github.replace(/https?:\/\/github\.com\//i, '')}" target="_blank" class="hover:text-black">github</a>` : ''}
        ${data.contact?.linkedin ? `<a href="https://linkedin.com/in/${data.contact.linkedin.replace(/https?:\/\/linkedin\.com\/in\//i, '')}" target="_blank" class="hover:text-black">linkedin</a>` : ''}
      </div>
      <p class="text-[10px]">© ${data.name || 'Portfolio'}. All rights reserved.</p>
    </footer>
  </main>
</body>
</html>
`,

  theme4: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
  ${commonHead(data, "Theme 4 - Awwwards Minimal")}
  <style>
    body { font-family: 'Space Grotesk', sans-serif; background-color: #000; color: #fff; }
    .project-row { border-bottom: 1px solid rgba(255, 255, 255, 0.15); transition: all 0.3s ease; }
    .project-row:hover { background-color: rgba(255, 255, 255, 0.05); padding-left: 10px; }
  </style>
</head>
<body class="bg-black text-white min-h-screen px-6 py-16 flex flex-col justify-between selection:bg-white/20 selection:text-white">
  <main class="max-w-4xl mx-auto w-full space-y-24">
    <!-- Header/Hero -->
    <header class="space-y-6 pt-12">
      <div class="flex justify-between items-start">
        <h1 class="text-5xl md:text-7xl font-extrabold uppercase tracking-tight">${data.name || 'Portfolio Owner'}</h1>
        <span class="text-[10px] font-bold border border-white/30 px-3 py-1 rounded-full uppercase tracking-widest text-neutral-400">THEME 4</span>
      </div>
      <p class="text-lg md:text-xl font-light text-neutral-400 max-w-xl leading-relaxed">${data.title || 'Creative Developer'} — ${data.bio || 'Crafting digital experiences.'}</p>
    </header>

    <!-- Skills -->
    <section class="space-y-6">
      <h2 class="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Core Technologies</h2>
      <div class="flex flex-wrap gap-3">
        ${(data.skills && data.skills.length > 0 ? data.skills : ['React', 'Next.js', 'WebGL']).map(s => `
          <span class="border border-white/10 px-4 py-2 rounded-full text-xs hover:border-white/50 transition-colors">${s}</span>
        `).join('')}
      </div>
    </section>

    <!-- Projects -->
    <section class="space-y-6">
      <h2 class="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Selected Works</h2>
      <div class="flex flex-col">
        ${(data.projects && data.projects.length > 0 ? data.projects : [{title: 'Project Title', desc: 'Creative website build.', tags: ['Vite']}]).map(p => `
          <div class="project-row py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div class="space-y-2">
              <h3 class="text-2xl font-semibold hover:text-neutral-300 transition-colors">${p.title}</h3>
              <p class="text-sm text-neutral-400 max-w-lg">${p.desc}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <div class="flex gap-2">
                ${(p.tags || []).map(t => `<span class="text-[10px] bg-white/10 px-3 py-1 rounded-full text-neutral-300">${t}</span>`).join('')}
              </div>
              ${p.link ? `<a href="${p.link.startsWith('http') ? p.link : 'https://' + p.link}" target="_blank" class="text-[10px] text-neutral-400 hover:text-white font-bold uppercase tracking-wider mt-2 inline-block">View →</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Experience -->
    <section class="space-y-6">
      <h2 class="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Professional Journey</h2>
      <div class="space-y-8">
        ${(data.experience && data.experience.length > 0 ? data.experience : [{role: 'Professional Role', company: 'Company Name', period: '2024', desc: 'Work history.'}]).map(e => `
          <div class="flex flex-col md:flex-row justify-between items-start gap-4">
            <div class="space-y-2">
              <h3 class="text-xl font-bold text-white">${e.role} @ ${e.company}</h3>
              <p class="text-sm text-neutral-400 font-light max-w-xl">${e.desc}</p>
            </div>
            <span class="font-mono text-sm text-neutral-400">${e.period}</span>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500 gap-6">
      <p>© ${data.name || 'Portfolio Owner'}. All rights reserved.</p>
      <div class="flex gap-6">
        ${data.contact?.email ? `<a href="mailto:${data.contact.email}" class="hover:text-white transition-colors">Email</a>` : ''}
        ${data.contact?.github ? `<a href="https://github.com/${data.contact.github.replace(/https?:\/\/github\.com\//i, '')}" target="_blank" class="hover:text-white transition-colors">GitHub</a>` : ''}
        ${data.contact?.linkedin ? `<a href="https://linkedin.com/in/${data.contact.linkedin.replace(/https?:\/\/linkedin\.com\/in\//i, '')}" target="_blank" class="hover:text-white transition-colors">LinkedIn</a>` : ''}
      </div>
    </footer>
  </main>
</body>
</html>
`,

  theme6: (data) => `
<!DOCTYPE html>
<html lang="en">
<head>
  ${commonHead(data, "Theme 6 - Neon Cyberpunk")}
  <style>
    body { font-family: 'Space Grotesk', sans-serif; }
    .neon-text { text-shadow: 0 0 5px #ff0055, 0 0 10px #ff0055; }
    .neon-border { border-color: #ff0055; box-shadow: 0 0 8px rgba(255, 0, 85, 0.4); }
  </style>
</head>
<body class="bg-[#030205] text-[#ffe600] min-h-screen px-6 py-12 flex flex-col justify-between selection:bg-[#ff0055]/30 selection:text-[#ffe600]">
  <main class="max-w-2xl mx-auto w-full space-y-10">
    <!-- Header -->
    <header class="border-2 border-[#ff0055] p-5 rounded-lg bg-[#0c0512]/60 flex justify-between items-center neon-border">
      <div>
        <h1 class="text-2xl font-black uppercase tracking-wider neon-text text-[#ff0055]">${data.name || 'USER_ADMIN'}</h1>
        <p class="text-xs text-white uppercase tracking-widest mt-1">[ ${data.title || 'CYBER_AGENT'} ]</p>
      </div>
      <span class="text-[9px] font-bold border-2 border-[#ffe600] px-2 py-0.5 rounded text-[#ffe600]">THEME 6</span>
    </header>

    <!-- Bio -->
    <section class="border border-[#ff0055]/30 p-5 rounded bg-black/60 space-y-2">
      <h2 class="text-xs font-bold uppercase tracking-widest text-[#ff0055] neon-text">ABOUT_ME</h2>
      <p class="text-xs leading-relaxed text-white/90 font-light">${data.bio || 'Awaiting personal prompt input records...'}</p>
    </section>

    <!-- Skills -->
    <section class="border border-[#ff0055]/30 p-5 rounded bg-black/60 space-y-3">
      <h2 class="text-xs font-bold uppercase tracking-widest text-[#ff0055] neon-text">CORE_SKILLS</h2>
      <div class="flex flex-wrap gap-2 text-xs">
        ${(data.skills && data.skills.length > 0 ? data.skills : ['CYBER_NET']).map(s => `
          <span class="bg-black border border-[#ffe600]/40 px-3 py-1 rounded font-bold">${s}</span>
        `).join('')}
      </div>
    </section>

    <!-- Projects -->
    <section class="border border-[#ff0055]/30 p-5 rounded bg-black/60 space-y-4">
      <h2 class="text-xs font-bold uppercase tracking-widest text-[#ff0055] neon-text">SYS_PROJECTS</h2>
      <div class="space-y-4">
        ${(data.projects && data.projects.length > 0 ? data.projects : [{title: 'Sys Project', desc: 'Sys description.', tags: ['React']}]).map(p => `
          <div class="border-t border-[#ff0055]/20 pt-3 first:border-0 first:pt-0 space-y-2">
            <h3 class="font-bold text-white text-xs">&gt; ${p.title}</h3>
            <p class="text-xs text-white/85 font-light leading-relaxed">${p.desc}</p>
            <div class="text-[9px] font-bold text-[#ff0055]">MODULES: ${(p.tags || []).join(', ')}</div>
            ${p.link ? `<a href="${p.link.startsWith('http') ? p.link : 'https://' + p.link}" target="_blank" class="text-[9px] text-[#ffe600] hover:underline font-bold mt-1 inline-block">[VIEW_PROJECT]</a>` : ''}
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Experience -->
    <section class="border border-[#ff0055]/30 p-5 rounded bg-black/60 space-y-4">
      <h2 class="text-xs font-bold uppercase tracking-widest text-[#ff0055] neon-text">HIST_HISTORY</h2>
      <div class="space-y-3 text-xs">
        \${(data.experience && data.experience.length > 0 ? data.experience : [{role: 'Professional Role', company: 'Company Name', period: '2024', desc: 'Work history.'}]).map(e => \`
          <div>
            <div class="flex justify-between">
              <span class="text-white font-bold">\${e.role} @ \${e.company}</span>
              <span class="font-mono text-[#ffe600]/60">\${e.period}</span>
            </div>
            <p class="text-xs text-white/70 font-light mt-1">\${e.desc}</p>
          </div>
        \`).join('')}
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-2 border-[#ff0055] p-5 rounded bg-[#0c0512]/60 text-center space-y-3 neon-border text-xs">
      <div class="flex justify-center gap-6">
        \${data.contact?.email ? \`<a href="mailto:\${data.contact.email}" class="hover:underline">email</a>\` : ''}
        \${data.contact?.github ? \`<a href="https://github.com/\${data.contact.github.replace(/https?:\\/\\/github\\.com\\//i, '')}" target="_blank" class="hover:underline">github</a>\` : ''}
        \${data.contact?.linkedin ? \`<a href="https://linkedin.com/in/\${data.contact.linkedin.replace(/https?:\\/\\/linkedin\\.com\\/in\\//i, '')}" target="_blank" class="hover:underline">linkedin</a>\` : ''}
      </div>
    </footer>
  </main>
</body>
</html>
`
};
