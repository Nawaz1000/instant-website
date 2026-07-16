// Client-side pure JavaScript Information Extractor using Regex
// This parses text from description prompt and uploaded resume to structure content

const standardTitles = [
  "Software Engineer", "DevOps Engineer", "Junior DevOps Engineer", "Senior DevOps Engineer",
  "DevOps Architect", "Cloud Platform Engineer", "Systems Architect",
  "Frontend Developer", "Backend Developer", "Full Stack Developer", "UX/UI Designer",
  "Product Designer", "Graphic Designer", "Creative Director", "Fashion Designer",
  "Interior Designer", "Architect", "Photographer", "Videographer", "Data Scientist",
  "Product Manager", "Project Manager", "Scrum Master", "Content Writer", "Copywriter",
  "Marketing Specialist", "SEO Strategist", "Game Developer", "Cybersecurity Analyst",
  "Illustrator", "Digital Artist", "Mobile Developer", "Security Analyst"
];

const standardSkills = [
  "React", "Vue", "Angular", "Next.js", "Nuxt.js", "Svelte", "Node.js", "Express", "Koa",
  "Python", "Django", "Flask", "FastAPI", "Go", "Golang", "Rust", "C++", "C#", "Java", "Kotlin", "Swift",
  "JavaScript", "TypeScript", "HTML5", "CSS3", "Tailwind CSS", "Bootstrap", "Sass", "LESS",
  "Docker", "Kubernetes", "AWS", "Google Cloud", "Azure", "Terraform", "Ansible", "CI/CD", "GitHub Actions",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase", "Supabase", "GraphQL", "REST API",
  "Figma", "Adobe XD", "Photoshop", "Illustrator", "UI/UX", "Responsive Design", "Git", "GitLab"
];

const invalidKeywords = [
  // Job titles & roles
  'engineer', 'developer', 'designer', 'architect', 'programmer', 'coder', 'specialist', 
  'consultant', 'analyst', 'manager', 'lead', 'senior', 'senoir', 'junior', 'junoir', 'intern', 'associate', 
  'expert', 'professional', 'freelancer', 'student', 'ops', 'operations', 'systems', 
  'product', 'project', 'technology', 'technical', 'head', 'officer', 'director', 
  'administrator', 'admin', 'coordinator', 'supervisor',
  // Resume sections & layout
  'resume', 'cv', 'curriculum', 'vitae', 'profile', 'summary', 'experience', 'education', 
  'skills', 'contact', 'about', 'email', 'phone', 'address', 'github', 'linkedin', 
  'portfolio', 'website', 'details', 'objective', 'employment', 'history', 'projects', 
  'languages', 'hobbies', 'interests', 'certifications', 'certification', 'courses', 
  'course', 'training', 'awards', 'award', 'activities', 'publications', 'references',
  'achievements', 'technologies', 'tools', 'platforms', 'frameworks',
  // Academic terms
  'bachelor', 'master', 'doctor', 'degree', 'university', 'college', 'institute', 'school', 
  'academy', 'btech', 'mtech', 'phd', 'bsc', 'msc', 'bca', 'mca', 'science', 'engineering', 
  'arts', 'commerce', 'gpa', 'cgpa', 'class', 'board', 'division',
  // Common descriptors & verbs
  'full', 'stack', 'front', 'end', 'back', 'web', 'mobile', 'cloud', 'data', 'software', 
  'application', 'development', 'design', 'management', 'solutions', 'services', 'networks', 
  'information', 'highly', 'motivated', 'detail', 'oriented', 'experienced', 'seeking', 
  'passionate', 'dynamic', 'creative', 'result', 'driven', 'proficient', 'knowledgeable',
  // Common pronouns/articles/prepositions
  'about', 'me', 'who', 'am', 'working', 'personal', 'hello', 'welcome', 'meet', 'a', 'an', 'the',
  // Tech stack names
  'react', 'angular', 'vue', 'node', 'python', 'java', 'javascript', 'typescript', 
  'html', 'css', 'sql', 'nosql', 'mongodb', 'docker', 'kubernetes', 'aws', 'gcp', 'azure',
  // Months
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 
  'october', 'november', 'december', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 
  'oct', 'nov', 'dec'
];

export function extractName(text) {
  if (!text) return null;
  const cleanText = text.replace(/\s+/g, ' ');
  
  // Truncate candidate at common stopwords, articles, or level indicators/professions to avoid bleed
  const stopWords = [
    'a', 'an', 'the', 'with', 'junior', 'junoir', 'senior', 'senoir', 'devops', 'engineer', 
    'developer', 'designer', 'architect', 'at', 'in', 'of', 'for', 'from', '1yr', '2yr', '3yr', 
    'experience', 'intern', 'is', 'resume', 'cv', 'software', 'frontend', 'backend', 
    'fullstack', 'full', 'stack', 'cloud', 'systems', 'platform', 'security', 'analyst', 
    'programmer', 'coder', 'expert', 'lead', 'manager', 'specialist', 'product', 'project', 
    'graphics', 'creative', 'ux', 'ui', 'photographer', 'writer'
  ];

  // 1. Try first non-empty lines (very common in resumes)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    // Skip common headings
    if (/^(resume|cv|curriculum|vitae|contact|experience|education|skills|summary|projects|about)/i.test(line)) continue;
    
    const words = line.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2 && words.length <= 4) {
      const isAllCapitalized = words.every(w => /^[A-Z][a-zA-Z\.\u00c0-\u017f]*$/.test(w));
      const isInvalid = words.some(w => invalidKeywords.includes(w.toLowerCase()));
      if (isAllCapitalized && !isInvalid) {
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
    }
  }

  // 2. Prioritize explicit introduction patterns
  // We check extremely strong patterns (like "my name is") first, and allow 1-4 words.
  const explicitPatterns = [
    {
      pattern: /\b(?:my name is|name is|meet)\b\s+([a-zA-Z\.\u00c0-\u017f]+(?:\s+[a-zA-Z\.\u00c0-\u017f]+){0,3})/i,
      minWords: 1
    },
    {
      pattern: /\b(?:name|n)\b\s*[:\-=\s]\s*([a-zA-Z\.\u00c0-\u017f]+(?:\s+[a-zA-Z\.\u00c0-\u017f]+){0,3})/i,
      minWords: 1
    },
    // i am / i'm (but reject if followed by articles or common work/role verbs to avoid matching "i am a developer")
    {
      pattern: /\b(?:i am|i'm|im)\b\s+(?!a\b|an\b|the\b|working\b|employed\b|studying\b|seeking\b)([a-zA-Z\.\u00c0-\u017f]+(?:\s+[a-zA-Z\.\u00c0-\u017f]+){0,3})/i,
      minWords: 1
    }
  ];
  
  for (const { pattern, minWords } of explicitPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      let candidate = match[1].trim();
      const words = candidate.split(/\s+/);
      const cleanedWords = [];
      for (const w of words) {
        if (stopWords.includes(w.toLowerCase())) break;
        cleanedWords.push(w);
      }
      if (cleanedWords.length >= minWords) {
        candidate = cleanedWords.join(' ');
        const lowercaseWords = cleanedWords.map(w => w.toLowerCase());
        const isInvalid = lowercaseWords.some(w => invalidKeywords.includes(w));
        if (!isInvalid && candidate.length > 2 && candidate.length < 50) {
          return cleanedWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }
      }
    }
  }

  // 3. Scan for email and find the line before/above it
  const emailIndex = text.indexOf('@');
  if (emailIndex !== -1) {
    const emailLineIndex = lines.findIndex(l => l.includes('@'));
    if (emailLineIndex > 0) {
      const lineAbove = lines[emailLineIndex - 1];
      const words = lineAbove.split(/\s+/).filter(w => w.length > 0);
      if (words.length >= 2 && words.length <= 3) {
        const isAllCapitalized = words.every(w => /^[A-Z][a-zA-Z\.\u00c0-\u017f]*$/.test(w));
        const isInvalid = words.some(w => invalidKeywords.includes(w.toLowerCase()));
        if (isAllCapitalized && !isInvalid) {
          return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        }
      }
    }
  }

  // 4. Fallback: capitalized word sequence in first 300 characters
  const prefix = cleanText.substring(0, 300);
  const candidates = prefix.match(/\b[A-Z][a-zA-Z\.\u00c0-\u017f]+(?:\s+[A-Z][a-zA-Z\.\u00c0-\u017f]+){1,2}\b/g) || [];
  
  for (let candidate of candidates) {
    const words = candidate.split(/\s+/);
    const cleanedWords = [];
    for (const w of words) {
      if (stopWords.includes(w.toLowerCase())) break;
      cleanedWords.push(w);
    }
    if (cleanedWords.length >= 2) {
      candidate = cleanedWords.join(' ');
      const wordsLower = cleanedWords.map(w => w.toLowerCase());
      const isInvalid = wordsLower.some(w => invalidKeywords.includes(w));
      if (!isInvalid && candidate.length > 2 && candidate.length < 50) {
        return cleanedWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }
    }
  }

  // 5. Fallback 2: first 2-3 words of the clean text, if none are invalid
  const firstWords = cleanText.trim().split(/\s+/).slice(0, 3);
  if (firstWords.length >= 2) {
    const isAnyWordInvalid = firstWords.some(w => 
      invalidKeywords.includes(w.toLowerCase()) || 
      w.toLowerCase().includes('@') || 
      w.toLowerCase().includes('.') || 
      /\d/.test(w)
    );
    if (!isAnyWordInvalid) {
      return firstWords.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
  }

  return null;
}

function getCategory(title = "") {
  const tLower = title.toLowerCase();
  if (tLower.includes('devops') || tLower.includes('infrastructure') || tLower.includes('ops') || tLower.includes('sysadmin') || tLower.includes('reliability') || tLower.includes('sre') || tLower.includes('security')) {
    return 'devops';
  } else if (tLower.includes('developer') || tLower.includes('engineer') || tLower.includes('coder') || tLower.includes('programmer') || tLower.includes('tech') || tLower.includes('software') || tLower.includes('dev') || tLower.includes('web') || tLower.includes('data') || tLower.includes('backend') || tLower.includes('frontend') || tLower.includes('full stack')) {
    return 'developer';
  } else if (tLower.includes('designer') || tLower.includes('illustrator') || tLower.includes('creative') || tLower.includes('art') || tLower.includes('ux') || tLower.includes('ui') || tLower.includes('product') || tLower.includes('graphic')) {
    return 'designer';
  }
  return 'default';
}

export function extractInfo(promptText = "", documentText = "") {
  const combinedText = `${promptText}\n\n${documentText}`;
  const lines = combinedText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  const lowerText = combinedText.toLowerCase();

  // 1. Extract Name
  let name = extractName(combinedText);

  // 2. Extract Title
  let title = "";
  
  if (name) {
    const nameEscaped = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const nameTitleRegex = new RegExp(`(?:${nameEscaped})\\s+(?:is a|is an|is|as a|as an|a|an)?\\s*([a-zA-Z0-9\\s\\-\\/\\&]{3,40}?)(?=\\s+(?:with|at|for|since|in|who|that|from|has)\\b|\\.|\\,|\\n|$)`, 'i');
    const nameTitleMatch = combinedText.match(nameTitleRegex);
    if (nameTitleMatch) {
      title = nameTitleMatch[1].trim();
    }
  }

  if (!title) {
    const titleLabelMatch = combinedText.match(/(?:profession|title|role|job|occupation|work as)\s*[:\-=\s]\s*([a-zA-Z\s\-\&]+)(?:\n|\.|$|,)/i);
    if (titleLabelMatch) {
      title = titleLabelMatch[1].trim();
    } else {
      // Lookahead terminates before name indicators or default lookaheads to prevent title capturing names
      const titleIntroMatch = combinedText.match(/(?:i am a|i'm a|working as a|employed as a|role of|professional|certified|im|i'm|i am|as a|as an)\s+(?:a|an|the)?\s*([a-zA-Z0-9\s\/&]{3,40}?)(?=\s+(?:at|for|since|with|in|specialized|focused|who|that|from|my name is|name is|i am|i'm|im)\b|\.|\n|$|,)/i);
      if (titleIntroMatch) {
        title = titleIntroMatch[1].trim();
      }
    }
  }

  if (!title) {
    for (const t of standardTitles) {
      if (lowerText.includes(t.toLowerCase())) {
        title = t;
        break;
      }
    }
  }
  
  if (title) {
    title = title
      .replace(/\bjunoir\b/i, 'Junior')
      .replace(/\bsenoir\b/i, 'Senior')
      .replace(/\bdevops\b/i, 'DevOps')
      .replace(/\bgloud\b/i, 'Cloud')
      .replace(/\bterrform\b/i, 'Terraform');
  }

  if (!title) {
    title = "Full Stack Developer";
  }

  const category = getCategory(title);

  // 3. Extract Bio / About (Section-Based)
  let bio = "";
  
  const bioSectionRegex = /(?:summary|professional summary|objective|profile|about me|about|overview)\b([\s\S]*?)(?:\n\s*\n\s*(?:experience|work|employment|education|skills|technical skills|technical|projects|contact|certifications|languages|hobbies|interests|publications|awards)\b|$)/i;
  const bioSectionMatch = combinedText.match(bioSectionRegex);
  if (bioSectionMatch && bioSectionMatch[1].trim().length > 20) {
    bio = bioSectionMatch[1].replace(/\s+/g, ' ').trim();
  }

  if (!bio) {
    const bioLabelMatch = combinedText.match(/(?:bio|about|desc|description|summary|overview|philosophy)\s*[:\-=\s]\s*(.+?)(?:\n\n|\n[A-Z][a-zA-Z\s]+:|\.\s*\n|Projects:|Skills:|Experience:|Requirements:|$)/is);
    if (bioLabelMatch) {
      bio = bioLabelMatch[1].replace(/\s+/g, ' ').trim();
    }
  }

  if (!bio) {
    const paragraphs = combinedText.split(/\n\s*\n/).map(p => p.trim().replace(/\s+/g, ' '));
    for (const p of paragraphs) {
      if (p.length > 50 && !p.toLowerCase().startsWith("create") && !p.toLowerCase().startsWith("generate")) {
        bio = p;
        break;
      }
    }
  }

  if (bio) {
    if (bio.includes('@') || bio.includes('+') || bio.toLowerCase().includes('experience') || bio.toLowerCase().includes('education') || bio.length > 300) {
      const sentences = bio.split(/(?<=[.!?])\s+/);
      const cleanSentences = sentences.filter(s => {
        const lower = s.toLowerCase();
        return !lower.includes('@') && !/^\+?\d[\d\s\-]{7,15}/.test(s) && !lower.includes('work history') && !lower.includes('employment history');
      });
      bio = cleanSentences.slice(0, 3).join(' ').trim();
    }
  }

  if (!bio) {
    if (category === 'developer') {
      bio = `I am a skilled software engineer focused on building robust backends and highly responsive frontend interfaces. Passionate about performance tuning and clean code architectures.`;
    } else if (category === 'devops') {
      bio = `Dedicated DevOps and cloud platform architect specializing in containerized pipelines, infrastructure as code, and highly resilient system deployments.`;
    } else if (category === 'designer') {
      bio = `Creative UX/UI designer committed to translating complex customer problems into beautiful, highly accessible visual interfaces and robust design systems.`;
    } else {
      bio = `Experienced professional dedicated to delivering high-quality business value, optimizing team operational frameworks, and building structured visual layouts.`;
    }
  }

  // 4. Extract Skills
  const skills = [];
  
  const skillsSectionRegex = /(?:skills|technologies|technical skills|key skills|expertise|core competencies|stack)\b([\s\S]*?)(?:\n\s*\n\s*(?:experience|work|employment|education|projects|contact|about|summary|certifications)\b|$)/i;
  const skillsSectionMatch = combinedText.match(skillsSectionRegex);
  
  if (skillsSectionMatch) {
    const sectionText = skillsSectionMatch[1];
    const rawTokens = sectionText.split(/[,;\n•|\t\-\*]/);
    for (let token of rawTokens) {
      token = token.trim();
      if (token.includes(':')) {
        const parts = token.split(':');
        if (parts[0].length < 20) {
          token = parts[1].trim();
        }
      }
      token = token.replace(/[\.\*]/g, '').trim();
      if (token.length > 1 && token.length < 30 && !/^(skills|technologies|technical|key|expertise|core|competencies|stack)$/i.test(token)) {
        const cleanToken = token.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        if (!skills.includes(cleanToken)) {
          skills.push(cleanToken);
        }
      }
    }
  }

  for (const s of standardSkills) {
    const regex = new RegExp(`\\b${s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}\\b`, 'i');
    if (regex.test(combinedText)) {
      const exists = skills.some(val => val.toLowerCase() === s.toLowerCase());
      if (!exists) {
        skills.push(s);
      }
    }
  }

  const presetSkills = {
    developer: ["React", "Next.js", "TypeScript", "Node.js", "MongoDB", "CSS3", "HTML5", "Git"],
    devops: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions", "Linux", "Python"],
    designer: ["UI/UX Design", "Figma", "Design Systems", "Typography", "Motion Design", "Adobe CC", "Prototyping", "User Research"],
    default: ["Product Development", "Project Management", "Agile Delivery", "Client Strategy", "Systems Design", "User Research", "Figma", "Git"]
  };

  if (skills.length === 0) {
    skills.push(...presetSkills[category]);
  } else if (skills.length < 4) {
    const fill = presetSkills[category].filter(s => !skills.includes(s));
    skills.push(...fill.slice(0, 6 - skills.length));
  }

  // 5. Extract Projects
  const projects = [];
  const bulletLines = combinedText.split("\n").map(l => l.trim());
  const cleanDesc = (d) => d.replace(/[\*\_\`]/g, '').trim();

  // Explicit Section-Based Projects Parsing
  const projectSectionRegex = /(?:projects|selected projects|key projects|academic projects|personal projects|recent work)\b([\s\S]*?)(?:\n\s*\n\s*(?:experience|work|employment|education|skills|contact|summary|about|certifications)\b|$)/i;
  const projectSectionMatch = combinedText.match(projectSectionRegex);
  
  if (projectSectionMatch) {
    const sectionText = projectSectionMatch[1];
    const sectionLines = sectionText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let currentProj = null;
    let descLines = [];
    
    for (const line of sectionLines) {
      const colonMatch = line.match(/^(?:[\-\*\u2022\s]+)?(?:\*\*)?([a-zA-Z0-9\s\-\_\&]{3,40})(?:\*\*)?\s*[:\-\u2013\u2014]\s*(.+)/);
      if (colonMatch) {
        if (currentProj) {
          currentProj.desc = descLines.length > 0 ? cleanDesc(descLines.join(' ')) : currentProj.desc;
          projects.push(currentProj);
        }
        
        const pTitle = colonMatch[1].trim();
        const pDesc = cleanDesc(colonMatch[2]);
        const tags = [];
        for (const s of standardSkills) {
          if (pDesc.toLowerCase().includes(s.toLowerCase())) tags.push(s);
        }
        
        currentProj = { title: pTitle, desc: pDesc, tech: tags.slice(0, 3) };
        descLines = [];
      } else if (line.startsWith('-') || line.startsWith('*') || line.startsWith('•')) {
        const cleanedLine = line.replace(/^[\-\*\u2022\s]+/, '').trim();
        if (currentProj) {
          descLines.push(cleanedLine);
        }
      } else if (line.length > 3 && line.length < 45 && !invalidKeywords.includes(line.toLowerCase())) {
        // Line might be a project title without divider
        if (currentProj) {
          currentProj.desc = descLines.length > 0 ? cleanDesc(descLines.join(' ')) : currentProj.desc;
          projects.push(currentProj);
        }
        currentProj = { title: line, desc: "Project description.", tech: [] };
        descLines = [];
      } else if (line.length > 45 && currentProj) {
        descLines.push(line);
      }
    }
    
    if (currentProj) {
      currentProj.desc = descLines.length > 0 ? cleanDesc(descLines.join(' ')) : currentProj.desc;
      projects.push(currentProj);
    }
  }

  // Heuristic Fallback 1: Lines starting with bullet and containing a colon/dash
  if (projects.length === 0) {
    for (let i = 0; i < bulletLines.length; i++) {
      const line = bulletLines[i];
      const pMatch = line.match(/^[\-\*\u2022]\s*(?:\*\*)?([a-zA-Z0-9\s\-\_\&]{3,40})(?:\*\*)?\s*[:\-\u2013\u2014]\s*([^\n]+)/i);
      if (pMatch) {
        const projTitle = pMatch[1].trim();
        const projDesc = cleanDesc(pMatch[2]);
        if (projTitle.length > 2 && projTitle.length < 50 && projDesc.length > 10 && !invalidKeywords.includes(projTitle.toLowerCase())) {
          const tags = [];
          for (const s of standardSkills) {
            if (projDesc.toLowerCase().includes(s.toLowerCase())) tags.push(s);
          }
          projects.push({ title: projTitle, desc: projDesc, tech: tags.slice(0, 3) });
        }
      }
    }
  }

  // Fallback 4: Extract projects dynamically from user action phrases (e.g. "made multiple APIs", "solved bugs")
  if (projects.length === 0) {
    const actionRegex = /(?:built|made|developed|created|designed|solved|solve|resolved|implement|implemented|integrated|integrating)\s+([a-zA-Z0-9\s\-]+?)(?=\s+(?:using|with|at|for|in|on|and|but|from|to|during|pvt|ltd|inc|corp|company)\b|\.|\,|$)/gi;
    let match;
    while ((match = actionRegex.exec(combinedText)) !== null) {
      let target = match[1].trim();
      if (target.length > 2 && target.length < 50) {
        let title = target.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        // Format common keywords cleanly
        if (title.toLowerCase().includes("api")) {
          title = "API Development & Integration";
        } else if (title.toLowerCase().includes("bug")) {
          title = "Bug Resolution & System Optimization";
        }
        
        const desc = `Successfully designed, implemented, and optimized ${target} in production environments.`;
        
        const tags = [];
        for (const s of standardSkills) {
          if (desc.toLowerCase().includes(s.toLowerCase())) tags.push(s);
        }
        
        projects.push({
          title: title,
          desc: desc,
          tech: tags.slice(0, 3)
        });
      }
    }
  }

  if (projects.length === 0) {
    const hasApi = lowerText.includes("api") || lowerText.includes("apis");
    const hasBugs = lowerText.includes("bug") || lowerText.includes("bugs");
    const tech1 = skills[0] || (category === 'designer' ? "Figma" : "React");
    const tech2 = skills[1] || (category === 'designer' ? "UI/UX" : "Node.js");
    const tech3 = skills[2] || (category === 'designer' ? "Adobe CC" : "Tailwind CSS");

    if (category === 'developer') {
      projects.push(
        {
          title: hasApi ? "Production API Gateway" : "Enterprise Web Platform",
          desc: hasApi 
            ? "Designed and implemented high-performance API endpoints in production environment, handling key microservice telemetry and solving runtime bugs."
            : "A modern full-stack web application designed for high performance, featuring automated state sync and fluid layouts.",
          tech: [tech1, "REST API", "Docker"]
        },
        {
          title: "Microservice Processing Gateway",
          desc: hasBugs 
            ? "A secure processing gateway and backend orchestrator, built to solve bottleneck logic bugs and handle high request volumes."
            : "A high-throughput API gateway built to proxy core services and monitor pipeline latency.",
          tech: [tech2, "Express", "Redis"]
        },
        {
          title: "Automated Diagnostics Tool",
          desc: "An automation tool and scripting pipeline developed to optimize code quality, streamline diagnostics, and verify updates.",
          tech: [tech3, "Git", "GitHub Actions"]
        }
      );
    } else if (category === 'devops') {
      projects.push(
        {
          title: "CloudGuard Autoscaler",
          desc: "Event-driven serverless autoscaling controller dynamically adjusting replica weights based on network latency spikes.",
          tech: [tech1, "Kubernetes", "Go"]
        },
        {
          title: "Telemetry Flow Engine",
          desc: "A centralized logger and metric collection pipeline aggregating structured server warnings and alert queues.",
          tech: [tech2, "Prometheus", "Python"]
        },
        {
          title: "GitOps Provisioner",
          desc: "Declarative infrastructure provisioner executing auto-rollback webhooks on configuration drifts.",
          tech: [tech3, "Terraform", "AWS"]
        }
      );
    } else if (category === 'designer') {
      projects.push(
        {
          title: "Eclipse Design System",
          desc: "A unified, multi-platform token design system with dark-mode compliance and responsive layout guidelines.",
          tech: [tech1, "Design Systems", "Figma"]
        },
        {
          title: "Vivid Interactive Portfolio",
          desc: "A high-fidelity immersive creative portfolio designed to showcase interactive 3D media renders.",
          tech: [tech2, "Typography", "Motion Design"]
        },
        {
          title: "Zenith Retail Brand Redesign",
          desc: "Comprehensive digital rebranding project resulting in a 40% increase in checkout conversions through user research.",
          tech: [tech3, "User Research", "Prototyping"]
        }
      );
    } else {
      projects.push(
        {
          title: "Summit Dashboard",
          desc: "A strategic overview board consolidating key operational milestones and quarterly growth indicators.",
          tech: [tech1, "Project Management", "Agile"]
        },
        {
          title: "Omni Portal Builder",
          desc: "A flexible, zero-config landing page platform designed to elevate personal identity metrics.",
          tech: [tech2, "Product Strategy", "Figma"]
        },
        {
          title: "Vanguard Audit Engine",
          desc: "A compliance auditing roadmap aligning team operations with modern security standards.",
          tech: [tech3, "Systems Design", "Compliance"]
        }
      );
    }
  }

  // 6. Extract Experience
  const experience = [];
  const dateRangeRegex = /\b((?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\d{1,2})\s*[-/]?\s*(?:\d{4}|\d{2})|\d{4})\s*[\-\u2013\u2014to\s]+\s*((?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\d{1,2})\s*[-/]?\s*(?:\d{4}|\d{2})|\d{4}|present|current|now)\b/i;

  const experienceSectionRegex = /(?:experience|work experience|professional experience|employment history|work history|employment)\b([\s\S]*?)(?:\n\s*\n\s*(?:education|projects|skills|contact|summary|certifications|about)\b|$)/i;
  const experienceSectionMatch = combinedText.match(experienceSectionRegex);

  if (experienceSectionMatch) {
    const sectionText = experienceSectionMatch[1];
    const sectionLines = sectionText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    let currentJob = null;
    let descLines = [];
    
    for (let idx = 0; idx < sectionLines.length; idx++) {
      const line = sectionLines[idx];
      const dateMatch = line.match(dateRangeRegex);
      if (dateMatch) {
        if (currentJob) {
          currentJob.desc = descLines.length > 0 ? cleanDesc(descLines.join(' ')) : "Professional details and achievements in this role.";
          experience.push(currentJob);
        }
        
        const period = dateMatch[0].trim();
        const lineCleaned = line.replace(dateMatch[0], '').replace(/[|,\-\u2013\u2014]$/, '').trim();
        
        let role = "";
        let company = "";
        
        const jobMatch = lineCleaned.match(/([a-zA-Z\s\-\&]{3,40}?)\s+(?:@|at|for)\s+([a-zA-Z0-9\s\.\,\-]+)/i);
        if (jobMatch) {
          role = jobMatch[1].trim();
          company = jobMatch[2].replace(/[\(\[\)\]]/g, "").trim();
        } else {
          const lineAbove = idx > 0 ? sectionLines[idx - 1] : "";
          const isLineAboveHeader = lineAbove && lineAbove.length > 3 && lineAbove.length < 50 && !lineAbove.match(dateRangeRegex) && !lineAbove.startsWith('-') && !lineAbove.startsWith('*') && !lineAbove.startsWith('•');
          
          const parts = lineCleaned.split(/[,|\-\u2013\u2014]/).map(p => p.trim()).filter(p => p.length > 0);
          if (isLineAboveHeader) {
            role = lineAbove;
            company = lineCleaned || "Company Name";
          } else if (parts.length >= 2) {
            role = parts[0];
            company = parts[1];
          } else if (parts.length === 1) {
            role = parts[0];
            company = "Company Name";
          } else {
            role = "Software Developer";
            company = "Company Name";
          }
        }
        
        company = company.replace(/^[|,\-\s\u2013\u2014]+|[|,\-\s\u2013\u2014]+$/g, "").trim();
        
        currentJob = {
          role: role.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
          company: company.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "),
          period: period,
          desc: ""
        };
        descLines = [];
      } else if (currentJob) {
        const lineAbove = idx > 0 ? sectionLines[idx - 1] : "";
        if (line === lineAbove) continue;
        
        const cleaned = line.replace(/^[\-\*\u2022\s]+/, '').trim();
        if (cleaned.length > 0) {
          const nextLine = idx + 1 < sectionLines.length ? sectionLines[idx + 1] : "";
          const nextLineHasDates = nextLine && nextLine.match(dateRangeRegex);
          if (nextLineHasDates && line.length > 3 && line.length < 50 && !line.startsWith('-') && !line.startsWith('*') && !line.startsWith('•')) {
            continue;
          }
          descLines.push(cleaned);
        }
      }
    }
    
    if (currentJob) {
      currentJob.desc = descLines.length > 0 ? cleanDesc(descLines.join(' ')) : "Professional details and achievements in this role.";
      experience.push(currentJob);
    }
  }

  if (experience.length === 0) {
    for (let i = 0; i < bulletLines.length; i++) {
      const line = bulletLines[i];
      const dateMatch = line.match(dateRangeRegex);
      if (dateMatch) {
        const period = dateMatch[0].trim();
        const lineCleaned = line.replace(dateMatch[0], '').trim();
        const jobMatch = lineCleaned.match(/([a-zA-Z\s\-\&]{3,40}?)\s+(?:@|at)\s+([a-zA-Z0-9\s\.\,\-]+)/i);
        if (jobMatch) {
          const role = jobMatch[1].trim();
          let company = jobMatch[2].replace(/[\(\[\)\]]/g, "").trim();
          company = company.replace(/^[|,\-\s\u2013\u2014]+|[|,\-\s\u2013\u2014]+$/g, "").trim();
          let desc = "Professional details and achievements in this role.";
          if (i + 1 < bulletLines.length && (bulletLines[i+1].startsWith("-") || bulletLines[i+1].startsWith("*") || bulletLines[i+1].startsWith("•"))) {
            desc = bulletLines[i+1].replace(/^[\-\*\u2022\s]+/, '').trim();
          }
          experience.push({ 
            role: role.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "), 
            company: company.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "), 
            period, 
            desc: cleanDesc(desc) 
          });
        }
      }
    }
  }

  if (experience.length === 0) {
    const experienceRegex = /(?:work|worked|employed|experience|experiance|role|developer|engineer|designer|manager)\b[\s\S]{1,50}?(?:at|for|in)\s+([a-zA-Z0-9\s\.\-]+?)(?=\s+(?:for|and|to|with|who|from|since|during|as|at|in|pvt|ltd|inc|corp|company)\b|\.|\,|$|\n)/i;
    const match = combinedText.match(experienceRegex);
    if (match) {
      const company = match[1].trim();
      const role = title || "Software Developer";
      const expYrMatch = combinedText.match(/(\d+)\s*(?:yr|year|years|experiance|experience)/i);
      const yearsCount = expYrMatch ? parseInt(expYrMatch[1]) : 1;
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - yearsCount;
      const period = `${startYear} - Present`;
      
      const capitalizedCompany = company.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      const capitalizedRole = role.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      const desc = `Operating as a ${capitalizedRole} at ${capitalizedCompany}, implementing high-performance services, resolving critical logic bugs, and delivering updates in production environments.`;
      
      experience.push({
        role: capitalizedRole,
        company: capitalizedCompany,
        period,
        desc
      });
    }
  }

  if (experience.length === 0) {
    const presetExperience = {
      developer: [
        {
          role: "Senior Full Stack Engineer",
          company: "Vanguard Tech Solutions",
          period: "2023 - Present",
          desc: "Architected modern React web portals, led microservices migrations, and optimized database indexing to speed up search queries by 60%."
        },
        {
          role: "Frontend Developer",
          company: "WebScale Ventures",
          period: "2021 - 2023",
          desc: "Implemented responsive web UI interfaces in collaboration with designers, integrated state management structures, and built custom reusable UI components."
        }
      ],
      devops: [
        {
          role: "Lead Platform Engineer",
          company: "OpsScale Global",
          period: "2023 - Present",
          desc: "Managed multi-region Kubernetes clusters, reduced cloud infra spend by 35% through resource sizing, and implemented automated blue-green deployments."
        },
        {
          role: "DevOps Engineer",
          company: "CloudCore Systems",
          period: "2021 - 2023",
          desc: "Built CI/CD pipelines, managed Terraform environments, and monitored distributed service architectures using Prometheus and Grafana."
        }
      ],
      designer: [
        {
          role: "Lead Product Designer",
          company: "Creative Flow Agency",
          period: "2023 - Present",
          desc: "Designed high-fidelity user journeys, established visual branding, and conducted user testing sessions to iterate on web and mobile interfaces."
        },
        {
          role: "UI/UX Designer",
          company: "Studio Horizon",
          period: "2021 - 2023",
          desc: "Created user flows, wireframes, and interactive prototypes in Figma, and worked with developers to ensure pixel-perfect CSS alignment."
        }
      ],
      default: [
        {
          role: "Senior Product Strategist",
          company: "Summit Core Partners",
          period: "2023 - Present",
          desc: "Defined product roadmaps, led cross-functional engineering and design alignment, and optimized delivery cycles using Agile methodologies."
        },
        {
          role: "Operations Consultant",
          company: "Vanguard Alliance",
          period: "2021 - 2023",
          desc: "Conducted system design audits, mapped user feedback loops, and optimized brand communication guidelines to drive engagement."
        }
      ]
    };
    experience.push(...presetExperience[category]);
  }

  // 7. Extract Contacts
  const emailMatch = combinedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const githubMatch = combinedText.match(/(?:github\.com\/|github:\s*)([a-zA-Z0-9\-_]+)/i);
  const linkedinMatch = combinedText.match(/(?:linkedin\.com\/in\/|linkedin:\s*)([a-zA-Z0-9\-_]+)/i);

  const contact = {
    email: emailMatch ? emailMatch[0].trim() : "",
    github: githubMatch ? githubMatch[1].trim() : "",
    linkedin: linkedinMatch ? linkedinMatch[1].trim() : ""
  };

  if (name) {
    name = name.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  if (title) {
    title = title.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  return {
    name,
    title,
    bio,
    skills,
    projects: projects.slice(0, 6),
    experience: experience.slice(0, 4),
    contact
  };
}
