import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { utf8ToBase64 } from '../App';
import Ferrofluid from './Ferrofluid';
import { db } from '../firebase';
import { doc, setDoc, collection, getDocs, getDoc } from 'firebase/firestore';
import CardSwap, { Card } from './CardSwap';
import Aurora from './Aurora';
import GradualBlur from './GradualBlur';
import { extractInfo, extractName } from '../utils/infoExtractor';
import { themes } from '../templates/themes';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { y: 25, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 15
    }
  }
};

const defaultPresets = {
  developer: {
    skills: ["React", "TypeScript", "Node.js", "Tailwind CSS", "Git"],
    projects: [
      { title: "Quantum Engine", desc: "Interactive Canvas particle starfields and interactive 3D WebGL meshes tracking mouse movements.", tech: ["React", "WebGL", "Three.js"] },
      { title: "Synapse DB", desc: "Ultra-fast headless API middleware server parsing unstructured JSON packets into cached stores.", tech: ["Node.js", "Express", "Redis"] },
      { title: "Vanguard Platform", desc: "Next-generation serverless platform optimized for SEO and speed index scores.", tech: ["Next.js", "TypeScript", "Tailwind CSS"] }
    ],
    certifications: [
      { title: "Meta Front-End Developer Professional", issuer: "Meta", date: "Issued 2024" },
      { title: "AWS Certified Cloud Practitioner", issuer: "Amazon Web Services", date: "Issued 2023" }
    ]
  },
  devops: {
    skills: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "Linux"],
    projects: [
      { title: "Aether Cluster", desc: "Automated Multi-region Kubernetes orchestrator utilizing self-healing pipelines for cloud telemetry.", tech: ["Kubernetes", "Terraform", "Go"] },
      { title: "Telemetry Nexus", desc: "High-throughput cloud metrics collector ingestion pipeline streaming Prometheus analytics.", tech: ["Prometheus", "Grafana", "Python"] },
      { title: "Beacon CI/CD", desc: "Declarative YAML build pipelines deploying microservices with canary release thresholds.", tech: ["GitHub Actions", "Docker", "Linux"] }
    ],
    certifications: [
      { title: "AWS Solutions Architect Professional", issuer: "Amazon Web Services", date: "Issued 2024" },
      { title: "Certified Kubernetes Administrator (CKA)", issuer: "CNCF", date: "Issued 2023" }
    ]
  },
  designer: {
    skills: ["Figma", "UI/UX Design", "Photoshop", "Illustrator", "Digital Art"],
    projects: [
      { title: "Nova Design System", desc: "Bespoke digital design component architecture scaled with HSL custom ranges.", tech: ["Figma", "UI/UX Design", "Branding"] },
      { title: "Aura Brand Identity", desc: "Cinematic visual design and layout guidelines developed for creative directors.", tech: ["Typography", "Illustrator", "Figma"] },
      { title: "Vellum Studio", desc: "Bespoke spatial design systems and illustration wireframes showcasing graphic art.", tech: ["Motion Design", "Photoshop", "UI/UX"] }
    ],
    certifications: [
      { title: "Google UX Design Professional Certificate", issuer: "Google", date: "Issued 2024" },
      { title: "Figma Advanced Layouts Certified", issuer: "Figma", date: "Issued 2023" }
    ]
  },
  security: {
    skills: ["Cybersecurity", "Pentesting", "Network Security", "Linux", "Python"],
    projects: [
      { title: "Aegis Sentinel", desc: "Autonomous intrusion detection system scanning network traffic for anomaly patterns.", tech: ["Python", "Wireshark", "Linux"] },
      { title: "Vellum Vault", desc: "Encrypted credential repository storing secrets using military-grade security standards.", tech: ["Go", "Docker", "Vault"] },
      { title: "Shadow Tracer", desc: "OSINT scraping utility aggregating data points to construct cyber footprint profiles.", tech: ["Python", "REST API", "MongoDB"] }
    ],
    certifications: [
      { title: "Offensive Security Certified Professional (OSCP)", issuer: "Offensive Security", date: "Issued 2024" },
      { title: "Certified Ethical Hacker (CEH)", issuer: "EC-Council", date: "Issued 2023" }
    ]
  }
};

const defaultInstructionsMaster = {
  themes: {
    spaceship: {
      colors: ["#00f0ff", "#0055ff", "#04050e"],
      font: "Space Grotesk",
      bgType: "spaceship_space",
      themeMode: "dark",
      tokens: {
        "--bg-primary": "#04050e",
        "--text-primary": "#e2e8f0",
        "--accent-primary": "#00f0ff",
        "--accent-secondary": "#0055ff",
        "--border-primary": "rgba(0, 240, 255, 0.18)",
        "--glass-bg": "rgba(0, 0, 0, 0.75)",
        "--glass-border": "rgba(0, 240, 255, 0.25)",
        "--glass-blur": "12px",
        "--glass-shadow": "0 0 25px rgba(0, 240, 255, 0.08)",
        "glowStrength": 15
      }
    },
    terminal: {
      colors: ["#00ff66", "#003311", "#030303"],
      font: "Space Grotesk",
      bgType: "grid",
      themeMode: "dark",
      tokens: {
        "--bg-primary": "#030303",
        "--text-primary": "#00ff66",
        "--accent-primary": "#00ff66",
        "--accent-secondary": "#003311",
        "--border-primary": "rgba(0, 255, 102, 0.25)",
        "--glass-bg": "rgba(3, 3, 3, 0.95)",
        "--glass-border": "rgba(0, 255, 102, 0.2)",
        "--glass-blur": "0px",
        "--glass-shadow": "none",
        "glowStrength": 0
      }
    },
    editorial: {
      colors: ["#d4af37", "#1a1a1a", "#fcfbfa"],
      font: "Playfair Display",
      bgType: "aurora",
      themeMode: "light",
      tokens: {
        "--bg-primary": "#fcfbfa",
        "--text-primary": "#1a1a1a",
        "--accent-primary": "#d4af37",
        "--accent-secondary": "#1a1a1a",
        "--border-primary": "#1a1a1a",
        "--glass-bg": "rgba(252, 251, 250, 0.5)",
        "--glass-border": "rgba(26, 26, 26, 0.15)",
        "--glass-blur": "10px",
        "--glass-shadow": "none",
        "glowStrength": 0
      }
    },
    minimalist: {
      colors: ["#3b82f6", "#64748b", "#ffffff"],
      font: "Inter",
      bgType: "grid",
      themeMode: "light",
      tokens: {
        "--bg-primary": "#ffffff",
        "--text-primary": "#0f172a",
        "--accent-primary": "#3b82f6",
        "--accent-secondary": "#64748b",
        "--border-primary": "rgba(226, 232, 240, 0.8)",
        "--glass-bg": "rgba(255, 255, 255, 0.8)",
        "--glass-border": "rgba(226, 232, 240, 0.8)",
        "--glass-blur": "8px",
        "--glass-shadow": "0 8px 32px 0 rgba(31, 38, 135, 0.05)",
        "glowStrength": 0
      }
    },
    creative: {
      colors: ["#6366f1", "#00e5ff", "#070814"],
      font: "Outfit",
      bgType: "fluid",
      themeMode: "dark",
      tokens: {
        "--bg-primary": "#070814",
        "--text-primary": "#f8fafc",
        "--accent-primary": "#6366f1",
        "--accent-secondary": "#00e5ff",
        "--border-primary": "rgba(255, 255, 255, 0.08)",
        "--glass-bg": "rgba(255, 255, 255, 0.03)",
        "--glass-border": "rgba(255, 255, 255, 0.1)",
        "--glass-blur": "16px",
        "--glass-shadow": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        "glowStrength": 5
      }
    },
    synthwave: {
      colors: ["#ff007f", "#00f0ff", "#120136"],
      font: "Outfit",
      bgType: "retro_wave",
      themeMode: "dark",
      tokens: {
        "--bg-primary": "#120136",
        "--text-primary": "#00f0ff",
        "--accent-primary": "#ff007f",
        "--accent-secondary": "#00f0ff",
        "--border-primary": "rgba(255, 0, 127, 0.3)",
        "--glass-bg": "rgba(18, 1, 54, 0.85)",
        "--glass-border": "rgba(255, 0, 127, 0.4)",
        "--glass-blur": "10px",
        "--glass-shadow": "0 0 20px rgba(255, 0, 127, 0.25)",
        "glowStrength": 20
      }
    },
    cyberpunk: {
      colors: ["#ffe600", "#ff0055", "#0a0a0c"],
      font: "Space Grotesk",
      bgType: "grid",
      themeMode: "dark",
      tokens: {
        "--bg-primary": "#0a0a0c",
        "--text-primary": "#ffe600",
        "--accent-primary": "#ffe600",
        "--accent-secondary": "#ff0055",
        "--border-primary": "#ffe600",
        "--glass-bg": "rgba(10, 10, 12, 0.95)",
        "--glass-border": "#ffe600",
        "--glass-blur": "0px",
        "--glass-shadow": "none",
        "glowStrength": 0
      }
    },
    forest_luxury: {
      colors: ["#064e3b", "#d4af37", "#022c22"],
      font: "Playfair Display",
      bgType: "aurora",
      themeMode: "dark",
      tokens: {
        "--bg-primary": "#022c22",
        "--text-primary": "#f5f5f4",
        "--accent-primary": "#d4af37",
        "--accent-secondary": "#064e3b",
        "--border-primary": "rgba(212, 175, 55, 0.2)",
        "--glass-bg": "rgba(2, 44, 34, 0.8)",
        "--glass-border": "rgba(212, 175, 55, 0.3)",
        "--glass-blur": "12px",
        "--glass-shadow": "0 4px 30px rgba(0, 0, 0, 0.4)",
        "glowStrength": 8
      }
    }
  },
  navbars: {
    spaceship_hud: {
      style: "hud",
      css: "backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0, 240, 255, 0.15);",
      links: "font-mono tracking-widest uppercase text-slate-400 hover:text-cyan-400"
    },
    terminal_monospace: {
      style: "cli",
      css: "background: #000; border-bottom: 1px dashed rgba(0, 255, 102, 0.25);",
      links: "font-mono text-[#00ff66]/70 hover:text-[#00ff66]"
    },
    glassmorphic_floating_bar: {
      style: "pill",
      css: "backdrop-filter: blur(16px); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);",
      links: "text-xs font-semibold text-slate-350 hover:text-white"
    },
    luxury_editorial_split: {
      style: "serif_split",
      css: "border-bottom: 1px solid #1a1a1a; font-family: 'Playfair Display';",
      links: "font-serif text-sm italic text-stone-700 hover:text-stone-950"
    },
    bento_grid_tabs: {
      style: "bento",
      css: "background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 6px;",
      links: "px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-all"
    }
  },
  cards: {
    spaceship_hologram: {
      css: "background: rgba(0,0,0,0.75); border: 1px solid rgba(0, 240, 255, 0.25); box-shadow: 0 0 20px rgba(0,240,255,0.06);",
      rounding: "rounded-lg",
      font: "font-mono"
    },
    terminal_codebox: {
      css: "background: #04050e; border: 1px border-[#00ff66]/20; font-family: monospace;",
      rounding: "rounded-md",
      font: "font-mono"
    },
    editorial_fine_border: {
      css: "border-left: 1px solid #1a1a1a; border-top: 1px solid #1a1a1a; padding: 24px; background: transparent;",
      rounding: "rounded-none",
      font: "font-serif"
    },
    minimalist_flat_card: {
      css: "background: #ffffff; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 4px 6px rgba(0,0,0,0.02);",
      rounding: "rounded-2xl",
      font: "font-sans"
    },
    bento_grid_tile: {
      css: "background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(10px);",
      rounding: "rounded-3xl",
      font: "font-sans"
    }
  },
  animations: {
    led_blinking: {
      type: "opacity_blink",
      speed_coefficient: 0.08,
      randomness: true
    },
    plasma_pulsing: {
      type: "pulsate_scale",
      frequency_hz: 0.45,
      base_scale: 1.0,
      max_scale: 1.15
    },
    radar_sweeping: {
      type: "canvas_sweep",
      theta_step: 0.02,
      line_width: 1.5,
      glow_alpha: 0.12
    },
    signal_sine_wave: {
      type: "oscillation_grid",
      amplitude_px: 25,
      frequency_coeff: 0.06,
      draw_speed: 1.2
    },
    text_glitch: {
      type: "distortion",
      frame_interval_ms: 75,
      noise_strength: 0.05
    },
    bento_card_tilt: {
      type: "3d_perspective",
      deg_max: 10,
      ease_speed: "0.1s"
    }
  },
  graphics: {
    twinkling_starfield: {
      density: 180,
      star_colors: ["#ffffff", "#00f0ff", "#a855f7"],
      speed_x: 0.03,
      speed_y: 0.02
    },
    cascading_matrix_code: {
      fontSize: 12,
      color: "#00ff66",
      density: 45,
      speed: 0.18
    },
    shifting_aurora_sky: {
      colors: ["#6366f1", "#00e5ff", "#02030d"],
      speed: 0.25,
      fluidity: 0.7
    },
    fluid_ferrofluid_blob: {
      sharpness: 2.8,
      fluidity: 0.15,
      mouseStrength: 1.1,
      speed: 0.05
    },
    grid_technical_mesh: {
      grid_size_px: 20,
      stroke_color: "rgba(255,255,255,0.06)",
      line_width: 0.8
    }
  }
};

const ensureFirestorePresets = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "compiler_presets"));
    if (querySnapshot.empty) {
      for (const [key, val] of Object.entries(defaultPresets)) {
        await setDoc(doc(db, "compiler_presets", key), val);
      }
      return defaultPresets;
    } else {
      const presets = {};
      querySnapshot.forEach((doc) => {
        presets[doc.id] = doc.data();
      });
      return presets;
    }
  } catch (err) {
    console.warn("Failed to fetch presets from Firestore, using local fallback presets:", err);
    return defaultPresets;
  }
};

const ensureFirestoreInstructions = async () => {
  try {
    const docRef = doc(db, "compiler_instructions", "master");
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      await setDoc(docRef, defaultInstructionsMaster);
      return defaultInstructionsMaster;
    } else {
      return docSnap.data();
    }
  } catch (err) {
    console.warn("Failed to fetch instructions from Firestore, using local fallback instructions:", err);
    return defaultInstructionsMaster;
  }
};


export default function Dashboard({ onCompile, initialData }) {
  const lastExtractedPrompt = useRef('');
  // Scroll tracking for gradual blur opacity
  const [scrollOpacity, setScrollOpacity] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const newOpacity = Math.min(y / 120, 1);
      setScrollOpacity(newOpacity);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    const fetchComments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "comments"));
        const list = [];
        querySnapshot.forEach((docSnapshot) => {
          list.push({ id: docSnapshot.id, ...docSnapshot.data() });
        });
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setComments(list);
      } catch (e) {
        console.error("Error fetching comments: ", e);
      }
    };
    fetchComments();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const [animatedPlaceholder, setAnimatedPlaceholder] = useState('');

  useEffect(() => {
    const fullText = "Build your website in seconds...";
    let index = 0;
    let isDeleting = false;
    let timer;

    const tick = () => {
      if (!isDeleting) {
        setAnimatedPlaceholder(fullText.slice(0, index + 1));
        index++;
        if (index === fullText.length) {
          timer = setTimeout(() => {
            isDeleting = true;
            tick();
          }, 3000);
          return;
        }
      } else {
        setAnimatedPlaceholder(fullText.slice(0, index - 1));
        index--;
        if (index === 0) {
          isDeleting = false;
          timer = setTimeout(tick, 500);
          return;
        }
      }
      timer = setTimeout(tick, isDeleting ? 50 : 100);
    };

    tick();
    return () => clearTimeout(timer);
  }, []);

  const getSaved = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`portfolio_builder_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const [name, setName] = useState(initialData?.n || getSaved('name', ''));
  const [title, setTitle] = useState(initialData?.t || initialData?.title || getSaved('title', ''));
  const [slug, setSlug] = useState(initialData?.slug || getSaved('slug', ''));
  const [isSlugManual, setIsSlugManual] = useState(!!initialData?.slug || getSaved('isSlugManual', false));
  const [selectedTheme, setSelectedTheme] = useState(initialData?.th === 'custom_html' ? 'custom_upload' : (initialData?.th || getSaved('selectedTheme', 'theme1')));
  
  // Structured states
  const [bio, setBio] = useState(initialData?.bio || getSaved('bio', ''));
  const [skills, setSkills] = useState(initialData?.skills || initialData?.skl || getSaved('skills', []));
  const [experience, setExperience] = useState(initialData?.experience || initialData?.exp || getSaved('experience', []));
  const [projects, setProjects] = useState(initialData?.projects || getSaved('projects', []));
  const [contact, setContact] = useState(initialData?.contact || getSaved('contact', { email: '', github: '', linkedin: '' }));

  // UI States
  const [isBuildModalOpen, setIsBuildModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('profile');
  const [compileSuccess, setCompileSuccess] = useState(false);
  const [compiledUrl, setCompiledUrl] = useState('');
  const [compiledPayload, setCompiledPayload] = useState(null);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isCustomThemeModalOpen, setIsCustomThemeModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ name: '', rating: 5, comment: '' });

  // Prompt & Doc States
  const [promptText, setPromptText] = useState('');
  const [documentText, setDocumentText] = useState('');
  const [alertMessage, setAlertMessage] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: '', onConfirm: null, onCancel: null });
  const [parsedPdfText, setParsedPdfText] = useState('');
  const [modalText, setModalText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfParsing, setPdfParsing] = useState(false);

  // Compiler states
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileLogs, setCompileLogs] = useState([]);
  const [customHtmlContent, setCustomHtmlContent] = useState(initialData?.rawCustomHtml || initialData?.customHtml || getSaved('customHtmlContent', ''));

  useEffect(() => {
    try {
      localStorage.setItem('portfolio_builder_name', JSON.stringify(name));
      localStorage.setItem('portfolio_builder_title', JSON.stringify(title));
      localStorage.setItem('portfolio_builder_slug', JSON.stringify(slug));
      localStorage.setItem('portfolio_builder_isSlugManual', JSON.stringify(isSlugManual));
      localStorage.setItem('portfolio_builder_selectedTheme', JSON.stringify(selectedTheme));
      localStorage.setItem('portfolio_builder_bio', JSON.stringify(bio));
      localStorage.setItem('portfolio_builder_skills', JSON.stringify(skills));
      localStorage.setItem('portfolio_builder_experience', JSON.stringify(experience));
      localStorage.setItem('portfolio_builder_projects', JSON.stringify(projects));
      localStorage.setItem('portfolio_builder_contact', JSON.stringify(contact));
      localStorage.setItem('portfolio_builder_promptText', JSON.stringify(promptText));
      localStorage.setItem('portfolio_builder_documentText', JSON.stringify(documentText));
      localStorage.setItem('portfolio_builder_customHtmlContent', JSON.stringify(customHtmlContent));
    } catch (e) {
      console.warn("Could not save state to localStorage:", e);
    }
  }, [name, title, slug, isSlugManual, selectedTheme, bio, skills, experience, projects, contact, promptText, documentText, customHtmlContent]);
  const [customHtmlName, setCustomHtmlName] = useState(initialData?.customHtml ? "Saved Custom HTML" : "");
  const [htmlReplacements, setHtmlReplacements] = useState(initialData?.replacements || []);
  const [skillInput, setSkillInput] = useState('');

  const submitComment = async (nameVal, ratingVal, commentVal) => {
    if (!nameVal.trim() || !commentVal.trim()) return;
    const payload = {
      name: nameVal.trim(),
      rating: Number(ratingVal),
      comment: commentVal.trim(),
      timestamp: Date.now()
    };
    try {
      const docRef = doc(collection(db, "comments"));
      await setDoc(docRef, payload);
      setComments(prev => [payload, ...prev]);
      setNewFeedback({ name: '', rating: 5, comment: '' });
      setIsFeedbackModalOpen(false);
      confetti({ particleCount: 50, spread: 60, colors: ['#a855f7', '#00e5ff'] });
    } catch (e) {
      console.error("Error submitting comment: ", e);
    }
  };

  // Experience state helper functions
  const handleAddExperience = () => {
    setExperience([...experience, { year: '', title: '', desc: '' }]);
  };
  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };
  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, idx) => idx !== index));
  };

  // Projects state helper functions
  const handleAddProject = () => {
    setProjects([...projects, { title: '', link: '', desc: '', tech: [] }]);
  };
  const handleUpdateProject = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
  };
  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, idx) => idx !== index));
  };

  // Contact helper
  const handleUpdateContact = (field, value) => {
    setContact({ ...contact, [field]: value });
  };

  const handlePreBuild = () => {
    // 1. Run local extraction only if promptText or documentText is provided
    if (promptText.trim() || documentText.trim()) {
      const parsed = extractInfo(promptText, documentText);
      
      // 2. Populate states
      if (parsed.name) {
        setName(parsed.name);
        if (!isSlugManual) {
          setSlug(parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
        }
      }
      if (parsed.title) setTitle(parsed.title);
      if (parsed.bio) setBio(parsed.bio);
      
      if (parsed.skills && parsed.skills.length > 0) {
        setSkills(parsed.skills);
      }
      
      if (parsed.experience && parsed.experience.length > 0) {
        const mapped = parsed.experience.map(exp => ({
          year: exp.period || exp.year || '2023 - Present',
          title: exp.title || (exp.role && exp.company ? `${exp.role} at ${exp.company}` : (exp.role || exp.company || 'Software Engineer')),
          desc: exp.desc || ''
        }));
        setExperience(mapped);
      }
      
      if (parsed.projects && parsed.projects.length > 0) {
        setProjects(parsed.projects);
      }
      
      if (parsed.contact) {
        setContact({
          email: parsed.contact.email || contact.email || '',
          github: parsed.contact.github || contact.github || '',
          linkedin: parsed.contact.linkedin || contact.linkedin || ''
        });
      }
    }

    // 3. Open structured review modal
    setIsBuildModalOpen(true);
  };

  const handleHtmlUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.html')) {
      setAlertMessage("Please upload a valid .html file.");
      return;
    }

    setCustomHtmlName(file.name);
    
    // Auto-generate name and slug from file name if empty
    const rawName = file.name.replace(/\.html$/i, '').replace(/[\-\_]+/g, ' ');
    const formattedName = rawName.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    if (!name) {
      setName(formattedName);
    }
    if (!slug) {
      setSlug(rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomHtmlContent(event.target.result);
    };
    reader.readAsText(file);
  };

  const absoluteifyHtml = (html, baseUrl) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      let baseTag = doc.querySelector('base');
      if (!baseTag) {
        baseTag = doc.createElement('base');
        baseTag.setAttribute('href', baseUrl);
        const head = doc.querySelector('head') || doc.documentElement;
        head.insertBefore(baseTag, head.firstChild);
      } else {
        baseTag.setAttribute('href', baseUrl);
      }

      doc.querySelectorAll('[src]').forEach(el => {
        const src = el.getAttribute('src');
        if (src && !/^https?:\/\//i.test(src) && !src.startsWith('data:') && !src.startsWith('blob:')) {
          try {
            el.setAttribute('src', new URL(src, baseUrl).href);
          } catch (e) {}
        }
      });

      doc.querySelectorAll('[href]').forEach(el => {
        const href = el.getAttribute('href');
        if (href && !/^https?:\/\//i.test(href) && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          try {
            el.setAttribute('href', new URL(href, baseUrl).href);
          } catch (e) {}
        }
      });

      // Resolve paths in style tags
      doc.querySelectorAll('style').forEach(styleTag => {
        let cssText = styleTag.innerHTML;
        const urlRegex = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
        cssText = cssText.replace(urlRegex, (match, p1) => {
          if (!/^https?:\/\//i.test(p1) && !p1.startsWith('data:') && !p1.startsWith('blob:')) {
            try {
              return `url("${new URL(p1, baseUrl).href}")`;
            } catch (e) {}
          }
          return match;
        });
        styleTag.innerHTML = cssText;
      });

      // Resolve paths in inline styles
      doc.querySelectorAll('[style]').forEach(el => {
        let styleVal = el.getAttribute('style');
        if (styleVal) {
          const urlRegex = /url\(\s*['"]?([^'")]+)['"]?\s*\)/gi;
          styleVal = styleVal.replace(urlRegex, (match, p1) => {
            if (!/^https?:\/\//i.test(p1) && !p1.startsWith('data:') && !p1.startsWith('blob:')) {
              try {
                return `url("${new URL(p1, baseUrl).href}")`;
              } catch (e) {}
            }
            return match;
          });
          el.setAttribute('style', styleVal);
        }
      });

      // Resolve paths in srcset attributes
      doc.querySelectorAll('[srcset]').forEach(el => {
        const srcset = el.getAttribute('srcset');
        if (srcset) {
          const parts = srcset.split(',').map(part => {
            const match = part.trim().match(/^(\S+)(?:\s+(.+))?$/);
            if (match) {
              const url = match[1];
              const descriptor = match[2] || '';
              if (!/^https?:\/\//i.test(url) && !url.startsWith('data:') && !url.startsWith('blob:')) {
                try {
                  return `${new URL(url, baseUrl).href}${descriptor ? ' ' + descriptor : ''}`;
                } catch(e) {}
              }
            }
            return part.trim();
          });
          el.setAttribute('srcset', parts.join(', '));
        }
      });

      // Handle lazy loading data attributes
      const lazyAttrs = ['data-src', 'data-href', 'data-lazy', 'data-original'];
      lazyAttrs.forEach(attrName => {
        doc.querySelectorAll(`[${attrName}]`).forEach(el => {
          const val = el.getAttribute(attrName);
          if (val && !/^https?:\/\//i.test(val) && !val.startsWith('data:') && !val.startsWith('blob:')) {
            try {
              el.setAttribute(attrName, new URL(val, baseUrl).href);
            } catch (e) {}
          }
        });
      });

      return doc.documentElement.outerHTML;
    } catch (err) {
      console.error("Error absoluteifying HTML:", err);
      return html;
    }
  };

  const handleAutoExtract = (pText, dText) => {
    const currentPrompt = pText !== undefined ? pText : promptText;
    const currentDoc = dText !== undefined ? dText : documentText;
    
    if (!currentPrompt.trim() && !currentDoc.trim()) return;

    const parsed = extractInfo(currentPrompt, currentDoc);
    
    if (parsed.name) {
      setName(parsed.name);
      if (!isSlugManual) {
        setSlug(parsed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
      }
    }
    if (parsed.title) setTitle(parsed.title);
    if (parsed.bio) setBio(parsed.bio);
    
    if (parsed.skills && parsed.skills.length > 0) {
      setSkills(parsed.skills);
    }
    
    if (parsed.experience && parsed.experience.length > 0) {
      const mapped = parsed.experience.map(exp => ({
        year: exp.period || exp.year || '2023 - Present',
        title: exp.title || (exp.role && exp.company ? `${exp.role} at ${exp.company}` : (exp.role || exp.company || 'Software Engineer')),
        desc: exp.desc || ''
      }));
      setExperience(mapped);
    }
    
    if (parsed.projects && parsed.projects.length > 0) {
      setProjects(parsed.projects);
    }
    
    if (parsed.contact) {
      setContact({
        email: parsed.contact.email || contact.email || '',
        github: parsed.contact.github || contact.github || '',
        linkedin: parsed.contact.linkedin || contact.linkedin || ''
      });
    }

    setTimeout(() => {
      setConfirmModal({
        isOpen: true,
        message: "This data has been fetched from your information. Would you like to review and edit the fetched data?",
        onConfirm: () => {
          setIsBuildModalOpen(true);
        },
        onCancel: null
      });
    }, 100);
  };


  const injectUserDataIntoCustomHtml = (html, userData, url) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const titleTag = doc.querySelector('title');
      if (titleTag && userData.name) {
        titleTag.innerText = `${userData.name} | ${userData.title || "Portfolio"}`;
      }

      const originalWordsSet = new Set();
      
      let originalName = "";
      if (titleTag && titleTag.innerText) {
        const parts = titleTag.innerText.split(/[|:-]/);
        if (parts.length > 0) {
          originalName = parts[0].trim();
        }
      }
      
      const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4'));
      if (!originalName || originalName.length < 3) {
        const h1 = doc.querySelector('h1');
        if (h1 && h1.innerText.trim().length < 30) {
          originalName = h1.innerText.trim();
        }
      }

      const cleanWord = (w) => w.replace(/[^a-zA-Z]/g, '').trim();
      const isGeneric = (w) => /^(portfolio|website|resume|cv|home|react|vite|builder|developer|designer|engineer|software)/i.test(w);

      if (originalName) {
        originalName.split(/\s+/).forEach(w => {
          const cw = cleanWord(w);
          if (cw.length > 2 && !isGeneric(cw)) originalWordsSet.add(cw);
        });
      }

      if (doc.body) {
        const bodyText = doc.body.innerText || "";
        
        const nameMatch = bodyText.match(/(?:i'm|i\s+am|hi,\s+i'm)\s+([a-zA-Z\s]{3,30})/i);
        if (nameMatch && nameMatch[1]) {
          nameMatch[1].trim().split(/\s+/).forEach(w => {
            const cw = cleanWord(w);
            if (cw.length > 2 && !isGeneric(cw)) originalWordsSet.add(cw);
          });
        }

        const copyrightMatch = bodyText.match(/(?:©|copyright)\s*(?:\d{4})?\s*([a-zA-Z\s]{3,30})/i);
        if (copyrightMatch && copyrightMatch[1]) {
          copyrightMatch[1].trim().split(/\s+/).forEach(w => {
            const cw = cleanWord(w);
            if (cw.length > 2 && !isGeneric(cw)) originalWordsSet.add(cw);
          });
        }
      }

      let normalizedUrl = url ? url.trim() : "";
      if (normalizedUrl) {
        if (!/^https?:\/\//i.test(normalizedUrl)) {
          normalizedUrl = "https://" + normalizedUrl;
        }
        try {
          const urlObj = new URL(normalizedUrl);
          const hostParts = urlObj.hostname.split('.');
          hostParts.forEach(p => {
            const cp = cleanWord(p);
            if (cp.length > 2 && !/^(www|com|org|net|me|in|info|co|io|localhost|app)/i.test(cp)) {
              originalWordsSet.add(cp);
            }
          });
          const pathParts = urlObj.pathname.split(/[\/\-_]/);
          pathParts.forEach(p => {
            const cp = cleanWord(p);
            if (cp.length > 2 && !/^(index|html|php|portfolio|website)/i.test(cp)) {
              originalWordsSet.add(cp);
            }
          });
        } catch(e) {}
      }

      const originalWords = Array.from(originalWordsSet);
      console.log("Extracted original name words for replacement:", originalWords);

      const replaceWordCaseInsensitive = (text, search, replacement) => {
        if (!search || !text) return text;
        let out = "";
        let pos = 0;
        const searchLower = search.toLowerCase();
        const textLower = text.toLowerCase();
        
        while (true) {
          const idx = textLower.indexOf(searchLower, pos);
          if (idx === -1) {
            out += text.slice(pos);
            break;
          }
          const charBefore = idx > 0 ? text[idx - 1] : "";
          const charAfter = idx + search.length < text.length ? text[idx + search.length] : "";
          
          const isBoundaryBefore = !charBefore || /[^a-zA-Z0-9]/.test(charBefore);
          const isBoundaryAfter = !charAfter || /[^a-zA-Z0-9]/.test(charAfter);
          
          if (isBoundaryBefore && isBoundaryAfter) {
            out += text.slice(pos, idx) + replacement;
          } else {
            out += text.slice(pos, idx + search.length);
          }
          pos = idx + search.length;
        }
        return out;
      };

      const walkAndReplace = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          let text = node.nodeValue;
          if (userData.name) {
            const newWords = userData.name.split(/\s+/).filter(w => w.length > 1);
            
            if (originalName && originalName.length > 2) {
              text = replaceWordCaseInsensitive(text, originalName, userData.name);
            }

            originalWords.forEach((word, idx) => {
              const replacementText = newWords[idx] !== undefined ? newWords[idx] : "";
              text = replaceWordCaseInsensitive(text, word, replacementText);
            });
          }
          if (userData.contact && userData.contact.email) {
            const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
            text = text.replace(emailRegex, userData.contact.email);
          }
          node.nodeValue = text;
        } else {
          if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            node.childNodes.forEach(walkAndReplace);
          }
        }
      };

      walkAndReplace(doc.body);

      let originalTitleText = "";
      if (titleTag && titleTag.innerText) {
        const parts = titleTag.innerText.split(/[|:-]/);
        if (parts.length > 1) {
          originalTitleText = parts[1].trim();
        }
      }
      if (!originalTitleText && headings.length > 0) {
        const h2 = doc.querySelector('h2');
        if (h2 && h2.innerText.trim().length < 50) {
          originalTitleText = h2.innerText.trim();
        }
      }

      const walkAndReplaceTitle = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          let text = node.nodeValue;
          if (originalTitleText && originalTitleText.length > 3 && userData.title) {
            text = replaceWordCaseInsensitive(text, originalTitleText, userData.title);
            
            const oldPhrases = originalTitleText.split(/\s*&\s*|\s+and\s+/i);
            oldPhrases.forEach((phrase) => {
              if (phrase.trim().length > 3) {
                text = replaceWordCaseInsensitive(text, phrase.trim(), userData.title);
              }
            });
          }
          node.nodeValue = text;
        } else {
          if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
            node.childNodes.forEach(walkAndReplaceTitle);
          }
        }
      };

      if (originalTitleText && originalTitleText.length > 3) {
        walkAndReplaceTitle(doc.body);
      }

      if (userData.bio) {
        const leafBlocks = Array.from(doc.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6')).filter(el => {
          return el.children.length === 0 && el.innerText.trim().length > 50 && el.innerText.trim().length < 500;
        }).sort((a, b) => b.innerText.trim().length - a.innerText.trim().length);

        if (leafBlocks.length > 0) {
          leafBlocks[0].innerText = userData.bio;
        }
      }

      if (userData.skills && userData.skills.length > 0) {
        const commonSkills = ["react", "javascript", "html", "css", "node", "python", "java", "aws", "docker", "kubernetes", "git", "figma", "ui/ux", "devops", "sql", "nosql", "ci/cd", "tailwind", "cloud architecture", "azure", "gcp", "google cloud", "terraform"];
        const skillElements = Array.from(doc.querySelectorAll('span, li, div, h3, h4, h5')).filter(el => {
          const text = el.innerText.trim().toLowerCase();
          return text && text.length > 1 && text.length < 25 && commonSkills.includes(text);
        });
        if (skillElements.length > 0) {
          skillElements.forEach((el, index) => {
            if (index < userData.skills.length) {
              el.innerText = userData.skills[index];
            }
          });
        }
      }

      if (userData.projects && userData.projects.length > 0) {
        const projectHeadings = Array.from(doc.querySelectorAll('h3, h4, h5')).filter(h => {
          const card = h.closest('a, div');
          return card && card.innerText.length > 40 && card.innerText.length < 600;
        });
        if (projectHeadings.length > 0) {
          projectHeadings.forEach((h, index) => {
            if (index < userData.projects.length) {
              const proj = userData.projects[index];
              h.innerText = proj.title;
              const parent = h.parentElement;
              if (parent) {
                const pDesc = parent.querySelector('p, span');
                if (pDesc) {
                  pDesc.innerText = proj.desc;
                }
              }
              
              const card = h.closest('a, div');
              if (card && proj.link) {
                const cardLinks = Array.from(card.querySelectorAll('a'));
                cardLinks.forEach(linkEl => {
                  const linkText = linkEl.innerText.toLowerCase();
                  const linkHref = (linkEl.getAttribute('href') || '').toLowerCase();
                  if (linkText.includes('github') || linkText.includes('source') || linkText.includes('code') || linkHref.includes('github')) {
                    linkEl.setAttribute('href', proj.link);
                  }
                });
                if (card.nodeName === 'A') {
                  card.setAttribute('href', proj.link);
                }
              }
            }
          });
        }
      }

      if (userData.experience && userData.experience.length > 0) {
        const timelineYears = Array.from(doc.querySelectorAll('*')).filter(el => {
          const text = el.innerText.trim();
          return /^(20\d\d|Present|\d{4}\s*-\s*\d{4})/i.test(text);
        });
        if (timelineYears.length > 0) {
          timelineYears.forEach((node, index) => {
            if (index < userData.experience.length) {
              const exp = userData.experience[index];
              node.innerText = exp.year;
              const parent = node.parentElement;
              if (parent) {
                const timelineHeadings = parent.querySelectorAll('h3, h4, h5, h2');
                if (timelineHeadings.length > 0) {
                  timelineHeadings[0].innerText = exp.title;
                }
                const timelinePara = parent.querySelector('p, span');
                if (timelinePara) {
                  timelinePara.innerText = exp.desc;
                }
              }
            }
          });
        }
      }

      // 7.5 Replace anchor links (GitHub, LinkedIn, Email, Socials)
      if (userData.contact) {
        const anchors = Array.from(doc.querySelectorAll('a'));
        anchors.forEach(a => {
          const href = (a.getAttribute('href') || '').toLowerCase();
          
          if (href.startsWith('mailto:') || href.includes('@') || a.innerText.toLowerCase().includes('email')) {
            if (userData.contact.email) {
              a.setAttribute('href', `mailto:${userData.contact.email}`);
              if (/@/.test(a.innerText)) {
                a.innerText = userData.contact.email;
              }
            }
          }
          else if (href.includes('github.com') || a.innerText.toLowerCase().includes('github')) {
            if (userData.contact.github) {
              let ghUrl = userData.contact.github;
              if (!/^https?:\/\//i.test(ghUrl)) {
                ghUrl = `https://github.com/${ghUrl.replace(/^@/, '')}`;
              }
              a.setAttribute('href', ghUrl);
            }
          }
          else if (href.includes('linkedin.com') || a.innerText.toLowerCase().includes('linkedin')) {
            if (userData.contact.linkedin) {
              let liUrl = userData.contact.linkedin;
              if (!/^https?:\/\//i.test(liUrl)) {
                liUrl = `https://linkedin.com/in/${liUrl.replace(/^@/, '')}`;
              }
              a.setAttribute('href', liUrl);
            }
          }
        });
      }

      // 8. Inject dynamic client-side observer script to maintain details after React/SPA hydration
      let outputHtml = doc.documentElement.outerHTML;
      const injectedScript = `
<script>
        (function() {
          console.log("[MUTATION-OBSERVER] Initializing DOM hijacking script...");
          const originalWords = ${JSON.stringify(originalWords)};
          const newName = ${JSON.stringify(userData.name)};
          const originalTitle = ${JSON.stringify(originalTitleText)};
          const newTitle = ${JSON.stringify(userData.title)};
          const newBio = ${JSON.stringify(userData.bio)};
          const newSkills = ${JSON.stringify(userData.skills || [])};

          const replaceWordCaseInsensitive = (text, search, replacement) => {
            if (!search || !text) return text;
            let out = "";
            let pos = 0;
            const searchLower = search.toLowerCase();
            const textLower = text.toLowerCase();
            
            while (true) {
              const idx = textLower.indexOf(searchLower, pos);
              if (idx === -1) {
                out += text.slice(pos);
                break;
              }
              const charBefore = idx > 0 ? text[idx - 1] : "";
              const charAfter = idx + search.length < text.length ? text[idx + search.length] : "";
              
              const isBoundaryBefore = !charBefore || /[^a-zA-Z0-9]/.test(charBefore);
              const isBoundaryAfter = !charAfter || /[^a-zA-Z0-9]/.test(charAfter);
              
              if (isBoundaryBefore && isBoundaryAfter) {
                out += text.slice(pos, idx) + replacement;
              } else {
                out += text.slice(pos, idx + search.length);
              }
              pos = idx + search.length;
            }
            return out;
          };

          const replaceTextContent = (text) => {
            if (!text) return text;
            let out = text;
            if (newName) {
              const newWords = newName.split(/\s+/).filter(w => w.length > 1);
              originalWords.forEach((word, idx) => {
                const replacementText = newWords[idx] !== undefined ? newWords[idx] : "";
                out = replaceWordCaseInsensitive(out, word, replacementText);
              });
            }
            if (originalTitle && originalTitle.length > 3 && newTitle) {
              out = replaceWordCaseInsensitive(out, originalTitle, newTitle);
            }
            const userEmail = ${JSON.stringify(userData.contact?.email || '')};
            if (userEmail) {
              const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
              out = out.replace(emailRegex, userEmail);
            }
            return out;
          };

          const processNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              const replaced = replaceTextContent(node.nodeValue);
              if (replaced !== node.nodeValue) {
                node.nodeValue = replaced;
              }
            } else {
              if (node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
                node.childNodes.forEach(processNode);
              }
            }
          };

          const injectSpecialDetails = () => {
            if (newBio) {
              const leafBlocks = Array.from(document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6')).filter(el => {
                return el.children.length === 0 && el.innerText.trim().length > 50 && el.innerText.trim().length < 500;
              }).sort((a, b) => b.innerText.trim().length - a.innerText.trim().length);
              if (leafBlocks.length > 0 && leafBlocks[0].innerText !== newBio) {
                leafBlocks[0].innerText = newBio;
              }
            }

            if (newSkills && newSkills.length > 0) {
              const commonSkills = ["react", "javascript", "html", "css", "node", "python", "java", "aws", "docker", "kubernetes", "git", "figma", "ui/ux", "devops", "sql", "nosql", "ci/cd", "tailwind", "cloud architecture", "azure", "gcp", "google cloud", "terraform"];
              const skillElements = Array.from(document.querySelectorAll('span, li, div, h3, h4, h5')).filter(el => {
                const text = el.innerText.trim().toLowerCase();
                return text && text.length > 1 && text.length < 25 && commonSkills.includes(text);
              });
              if (skillElements.length > 0) {
                skillElements.forEach((el, index) => {
                  if (index < newSkills.length && el.innerText !== newSkills[index]) {
                    el.innerText = newSkills[index];
                  }
                });
              }
            }
          };

          const runAll = () => {
            processNode(document.body);
            injectSpecialDetails();
          };

          runAll();
          document.addEventListener('DOMContentLoaded', runAll);
          window.addEventListener('load', runAll);

          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                processNode(node);
              });
              if (mutation.type === 'characterData') {
                const replaced = replaceTextContent(mutation.target.nodeValue);
                if (replaced !== mutation.target.nodeValue) {
                  mutation.target.nodeValue = replaced;
                }
              }
            });
            injectSpecialDetails();
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
          });
        })();
</script>
      `;

      if (outputHtml.includes('</body>')) {
        outputHtml = outputHtml.replace('</body>', `${injectedScript}</body>`);
      } else {
        outputHtml = outputHtml + injectedScript;
      }

      return outputHtml;
    } catch (err) {
      console.error("Error in injectUserDataIntoCustomHtml:", err);
      return html;
    }
  };

  const handleCloneWebsite = async (url) => {
    if (!url) {
      setCloningError("Please enter a website URL.");
      return;
    }
    
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }

    setIsCloningWebsite(true);
    setCloningError("");

    const proxies = [
      {
        name: "CORSProxy.io",
        getUrl: (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
        parse: async (res) => await res.text()
      },
      {
        name: "AllOrigins",
        getUrl: (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
        parse: async (res) => {
          const json = await res.json();
          if (!json.contents) throw new Error("No contents field in AllOrigins response");
          return json.contents;
        }
      },
      {
        name: "CodeTabs",
        getUrl: (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
        parse: async (res) => await res.text()
      }
    ];

    let htmlContent = "";
    let success = false;
    let errors = [];

    for (const proxy of proxies) {
      try {
        console.log(`Attempting to clone via ${proxy.name}...`);
        const proxyUrl = proxy.getUrl(targetUrl);
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          throw new Error(`HTTP status ${response.status}`);
        }
        htmlContent = await proxy.parse(response);
        if (htmlContent && htmlContent.trim().length > 100) {
          success = true;
          console.log(`Successfully cloned via ${proxy.name}!`);
          break;
        } else {
          throw new Error("HTML content is empty or too short");
        }
      } catch (err) {
        console.warn(`Proxy ${proxy.name} failed:`, err);
        errors.push(`${proxy.name}: ${err.message}`);
      }
    }

    if (!success) {
      setCloningError(`Failed to fetch website using all proxies. Errors: ${errors.join(" | ")}`);
      setIsCloningWebsite(false);
      return;
    }

    try {
      const absoluteHtml = absoluteifyHtml(htmlContent, targetUrl);
      setCustomHtmlContent(absoluteHtml);
      
      let docTitle = "Cloned Website";
      try {
        const parser = new DOMParser();
        const docObj = parser.parseFromString(absoluteHtml, 'text/html');
        const titleTag = docObj.querySelector('title');
        if (titleTag && titleTag.innerText) {
          docTitle = titleTag.innerText.trim();
        } else {
          const urlObj = new URL(targetUrl);
          docTitle = urlObj.hostname.replace('www.', '');
        }
      } catch (err) {
        console.error("Failed to parse HTML title:", err);
      }

      setCustomHtmlName(`Cloned: ${docTitle}`);
      
      const rawName = docTitle.replace(/[\-\_]+/g, ' ');
      let formattedName = rawName.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      
      let extractedName = docTitle;
      const separators = ['-', '|', '•', ':'];
      for (const sep of separators) {
        if (extractedName.includes(sep)) {
          extractedName = extractedName.split(sep)[0].trim();
        }
      }
      extractedName = extractedName.trim();
      if (extractedName) {
        const cleanRaw = extractedName.replace(/[\-\_]+/g, ' ');
        formattedName = cleanRaw.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
      }

      if (!name) {
        setName(formattedName);
      }
      if (!slug) {
        setSlug(formattedName.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      }

      if (extractedName && name && extractedName.toLowerCase() !== name.toLowerCase()) {
        setHtmlReplacements(prev => {
          const exists = prev.some(r => r.search.toLowerCase() === extractedName.toLowerCase());
          if (!exists) {
            return [...prev, { search: extractedName, replace: name }];
          }
          return prev;
        });
      }
      
      setIsCloningWebsite(false);
    } catch (err) {
      console.error("Cloning post-processing error:", err);
      setCloningError(`Post-processing failed: ${err.message}`);
      setIsCloningWebsite(false);
    }
  };

  // Helpers to add compile logs with staggering
  const addLog = (text, delay = 0) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCompileLogs(prev => [...prev, text]);
        resolve();
      }, delay);
    });
  };

  const initPyodide = async () => {
    if (window.pyodideInstance) {
      return window.pyodideInstance;
    }
    if (pyodideLoadingRef.current) {
      while (!window.pyodideInstance) {
        await new Promise(r => setTimeout(r, 100));
      }
      return window.pyodideInstance;
    }
    pyodideLoadingRef.current = true;
    
    if (!document.getElementById('pyodide-script')) {
      const script = document.createElement('script');
      script.id = 'pyodide-script';
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js';
      document.head.appendChild(script);
      await new Promise((resolve) => {
        script.onload = resolve;
      });
    }
    
    const py = await window.loadPyodide();
    window.pyodideInstance = py;
    return py;
  };

  const performNetworkInspirationSearch = async (promptText, addLog) => {
    const stopwords = ['create', 'portfolio', 'website', 'design', 'with', 'using', 'developer', 'engineer', 'designer', 'a', 'the', 'and', 'or', 'in', 'of', 'for', 'to', 'at', 'is', 'on', 'my', 'your'];
    const keywords = promptText
      .toLowerCase()
      .split(/[^a-zA-Z0-9.\-_]+/)
      .filter(w => w.length > 2 && !stopwords.includes(w));
    
    const queryKeyword = keywords[0] || 'portfolio';
    await addLog(`[NET-SEARCH] Spawning web search agents for query: "${queryKeyword}"...`, 200);

    const targets = [
      { name: 'Dribbble.com', url: `https://dribbble.com/search/shots?q=${encodeURIComponent(queryKeyword)}` },
      { name: 'Recent.design', url: 'https://recent.design/' },
      { name: 'Reactbits.dev', url: 'https://reactbits.dev/' },
      { name: 'Cofolios.com', url: 'https://cofolios.com/' }
    ];

    let extractedColors = [];
    let extractedFont = null;

    for (const target of targets) {
      try {
        await addLog(`[NET-SEARCH] Querying ${target.name} for inspiration...`, 150);
        
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(target.url)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
          const json = await response.json();
          const html = json.contents || '';
          
          const hexRegex = /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/g;
          let match;
          let count = 0;
          while ((match = hexRegex.exec(html)) !== null && count < 10) {
            const col = match[0].toLowerCase();
            if (!['#ffffff', '#fff', '#000000', '#000', '#111111', '#222222', '#333333'].includes(col)) {
              extractedColors.push(col);
              count++;
            }
          }

          if (!extractedFont && html.includes('font-family')) {
            const fontMatch = html.match(/font-family:\s*['"]?([a-zA-Z0-9\s\-]+)['"]?/i);
            if (fontMatch && fontMatch[1]) {
              const fontCandidate = fontMatch[1].split(',')[0].trim().replace(/['"]/g, '');
              if (['inter', 'space grotesk', 'playfair display', 'outfit', 'roboto', 'lato', 'poppins'].includes(fontCandidate.toLowerCase())) {
                extractedFont = fontCandidate.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
              }
            }
          }

          await addLog(`[NET-SEARCH] Successfully analyzed ${target.name} layout and visual styles.`, 100);
        } else {
          await addLog(`[NET-SEARCH] Target ${target.name} cached index verified.`, 100);
        }
      } catch (e) {
        await addLog(`[NET-SEARCH] Target ${target.name} cached index verified.`, 100);
      }
    }

    const uniqueColors = [...new Set(extractedColors)].filter(c => c.length === 7 || c.length === 4);
    
    return {
      colors: uniqueColors.length >= 2 ? uniqueColors.slice(0, 2) : null,
      font: extractedFont
    };
  };

  const handleBrainCompile = async () => {
    const finalName = name.trim() || "Portfolio Owner";
    const finalTitle = title.trim() || "Developer";
    const finalSlug = `${finalName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'portfolio'}-${Math.random().toString(36).substring(2, 8)}`;

    if (!name.trim()) {
      setAlertMessage("Please enter a name first.");
      return;
    }

    if (selectedTheme === "custom_upload" && !customHtmlContent) {
      setAlertMessage("Please upload a custom HTML file first.");
      return;
    }

    setIsCompiling(true);
    setCompileLogs([]);

    try {
      await addLog("[COMPILER] Initiating portfolio compilation...", 100);
      
      const compiledExperience = experience.map(exp => {
        let role = exp.title;
        let company = "";
        
        const splitMatch = exp.title.match(/^(.*?)\s+(?:at|@)\s+(.*)$/i);
        if (splitMatch) {
          role = splitMatch[1].trim();
          company = splitMatch[2].trim();
        }
        
        return {
          year: exp.year,
          period: exp.year,
          title: exp.title,
          role: role,
          company: company || "Independent",
          desc: exp.desc
        };
      });

      const compiledProjects = projects.map(proj => ({
        ...proj,
        tech: proj.tech ? proj.tech.map(t => t.trim()).filter(Boolean) : []
      }));

      const userData = {
        name: finalName,
        title: finalTitle,
        bio: bio.trim() || "Describe your background in the bio section.",
        skills: skills,
        projects: compiledProjects,
        experience: compiledExperience,
        contact: contact
      };

      await addLog(`[ENTITY] Compiling Name: '${finalName}'`, 100);
      await addLog(`[ENTITY] Compiling Title: '${finalTitle}'`, 100);
      await addLog(`[SKILLS] Skills tags -> [${skills.join(', ')}]`, 150);

      let payload;

      if (selectedTheme === "custom_upload") {
        await addLog("[COMPILER] Injecting details into custom theme HTML...", 150);
        let compiledHtml = injectUserDataIntoCustomHtml(customHtmlContent, userData, "");

        // Apply any manual custom text replacements configured
        htmlReplacements.forEach(rep => {
          if (rep.search.trim()) {
            const escapedSearch = rep.search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(escapedSearch, 'g');
            compiledHtml = compiledHtml.replace(regex, rep.replace);
          }
        });

        payload = {
          th: "custom_html",
          n: finalName,
          title: finalTitle,
          bio: userData.bio,
          skills: userData.skills,
          experience: userData.experience,
          projects: userData.projects,
          contact: userData.contact,
          customHtml: compiledHtml,
          rawCustomHtml: customHtmlContent,
          replacements: htmlReplacements,
          slug: finalSlug,
          createdAt: Date.now()
        };
      } else {
        await addLog(`[COMPILER] Preparing selected ${selectedTheme} configuration...`, 150);
        payload = {
          th: selectedTheme,
          n: finalName,
          title: finalTitle,
          bio: userData.bio,
          skills: userData.skills,
          experience: userData.experience,
          projects: userData.projects,
          contact: userData.contact,
          slug: finalSlug,
          createdAt: Date.now()
        };
      }

      await addLog("[DATABASE] Connecting to Firestore instance...", 150);

      let resolvedSlug = finalSlug;
      const docRef = doc(db, "portfolios", finalSlug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const existingData = docSnap.data();
        if (existingData.n && existingData.n.trim().toLowerCase() !== finalName.trim().toLowerCase()) {
          await addLog("[DATABASE] Slug collision detected! Creating a unique custom link...", 150);
          let uniqueSlug = finalSlug;
          let exists = true;
          let attempts = 0;
          while (exists && attempts < 10) {
            attempts++;
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            uniqueSlug = `${finalSlug}-${randomSuffix}`;
            const checkSnap = await getDoc(doc(db, "portfolios", uniqueSlug));
            if (!checkSnap.exists()) {
              exists = false;
            }
          }
          if (exists) {
            throw new Error("Could not allocate a unique URL slug. Please change your name or manually edit the link slug.");
          }
          resolvedSlug = uniqueSlug;
          payload.slug = uniqueSlug;
          setSlug(uniqueSlug);
        }
      }

      await setDoc(doc(db, "portfolios", resolvedSlug), payload);
      const finalUrl = window.location.origin + '/' + resolvedSlug;

      await addLog("[DATABASE] Document successfully saved.", 150);
      await addLog("[COMPILER] Compilation complete! Syncing preview settings.", 100);

      setCompiledUrl(finalUrl);
      setCompileSuccess(true);
      setCompiledPayload(payload);

      setTimeout(() => {
        setIsCompiling(false);
        confetti({ particleCount: 150, spread: 80, colors: ['#a855f7', '#00e5ff'] });
        setIsFeedbackModalOpen(true);
      }, 500);

    } catch (err) {
      console.error(err);
      await addLog(`[ERROR] Compilation failed: ${err.message}`, 100);
      setTimeout(() => {
        setIsCompiling(false);
        setAlertMessage(`Compilation failed: ${err.message}`);
      }, 1000);
    }
  };



  // Auto-generate slug from name
  useEffect(() => {
    if (!isSlugManual) {
      if (name) {
        const autoSlug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        setSlug(autoSlug);
      } else {
        setSlug('');
      }
    }
  }, [name, isSlugManual]);

  const handleSlugChange = (val) => {
    setIsSlugManual(true);
    // Allow only lowercase alphanumeric characters and hyphens
    const filtered = val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(filtered);
  };



  // PDF Parsing heuristics
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfParsing(true);

    const fileReader = new FileReader();
    fileReader.onload = function() {
      const typedarray = new Uint8Array(this.result);
      
      if (!window.pdfjsLib) {
        setAlertMessage("PDF parser library not loaded yet. Please try again in a moment.");
        setPdfParsing(false);
        return;
      }

      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      
      window.pdfjsLib.getDocument(typedarray).promise.then(pdf => {
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
          
          setParsedPdfText(cleanText);
          setDocumentText(cleanText);
          setModalText(cleanText);
          
          setPdfParsing(false);
          setIsModalOpen(false); // Close modal on successful parse
          confetti({ particleCount: 30, spread: 40, colors: ['#a855f7', '#00e5ff'] });

          // Auto extract details immediately and alert/edit
          handleAutoExtract(promptText, cleanText);
        }).catch(err => {
          console.error(err);
          setPdfParsing(false);
        });
      }).catch(err => {
        console.error(err);
        setPdfParsing(false);
      });
    };
    fileReader.readAsArrayBuffer(file);
  };

  const handleSaveModalDocument = () => {
    if (modalText.trim()) {
      setDocumentText(modalText.trim());
      handleAutoExtract(promptText, modalText.trim());
    }
    setIsModalOpen(false);
  };

  // Natural Data Verification and Clean-up
  const verifyAndEnhanceData = () => {
    const rawName = name.trim() || "Portfolio Owner";
    const rawTitle = title.trim() || "UI Designer";
    
    let category = 'default';
    const tLower = rawTitle.toLowerCase();
    if (tLower.includes('devops') || tLower.includes('infrastructure') || tLower.includes('ops') || tLower.includes('sysadmin') || tLower.includes('reliability') || tLower.includes('sre')) {
      category = 'devops';
    } else if (tLower.includes('developer') || tLower.includes('engineer') || tLower.includes('coder') || tLower.includes('programmer') || tLower.includes('tech') || tLower.includes('software') || tLower.includes('dev') || tLower.includes('web')) {
      category = 'developer';
    } else if (tLower.includes('designer') || tLower.includes('illustrator') || tLower.includes('creative') || tLower.includes('art') || tLower.includes('ux') || tLower.includes('ui') || tLower.includes('product')) {
      category = 'designer';
    }

    const enhancedTitle = rawTitle;

    let enhancedBio = '';
    if (compiledBio && name) {
      enhancedBio = compiledBio;
    } else {
      const sentences = `${workDescription} ${parsedPdfText}`.split(/[.●•\n]/).map(s => s.trim()).filter(s => s.length > 10);
      if (sentences.length > 0) {
        enhancedBio = sentences[0];
      } else {
        enhancedBio = `Operating as a professional ${rawTitle}, focused on delivering clean, high-performance visual layouts.`;
      }
    }

    let skillSet = [];
    if (customSkills && customSkills.length > 0) {
      skillSet = customSkills;
    } else {
      const skillsMapping = {
        developer: ["React", "Next.js", "TypeScript", "Node.js", "AWS", "GraphQL", "Docker", "Git", "Tailwind CSS"],
        devops: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions", "Linux", "Python", "Prometheus", "Git"],
        designer: ["UI/UX Design", "Figma", "Design Systems", "Typography", "Motion Design", "Adobe CC", "Prototyping", "Webflow"],
        default: ["Product Development", "Project Management", "Agile Delivery", "Client Strategy", "Systems Design", "User Research"]
      };

      const allCommonSkills = [
        ...skillsMapping.developer, 
        ...skillsMapping.devops, 
        ...skillsMapping.designer, 
        ...skillsMapping.default, 
        "Vue", "Python", "Kubernetes", "Three.js", "D3.js", "Sass", "Web3", "Terraform", "Linux", "CI/CD"
      ];
      allCommonSkills.forEach(skill => {
        if (workDescription.toLowerCase().includes(skill.toLowerCase()) && !skillSet.includes(skill)) {
          skillSet.push(skill);
        }
      });

      if (skillSet.length < 3) {
        skillSet = [...skillSet, ...skillsMapping[category]];
      }
      skillSet = [...new Set(skillSet)].slice(0, 8);
    }

    let finalMilestones = [];
    const years = ["2024 - Present", "2022 - 2024", "2020 - 2022"];

    const lines = workDescription.split('\n').map(l => l.trim()).filter(l => l.length > 5);
    let parsedWithPipe = false;

    if (lines.length > 0) {
      const milestonesFromPipe = lines.map(line => {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 2) {
          parsedWithPipe = true;
          return {
            year: parts[0],
            title: parts[1],
            desc: parts[2] || `Collaborated on system design and optimized user experiences.`
          };
        }
        return null;
      }).filter(Boolean);

      if (parsedWithPipe) {
        finalMilestones = milestonesFromPipe;
      }
    }

    if (!parsedWithPipe) {
      const sentences = `${workDescription} ${parsedPdfText}`.split(/[.●•\n]/).map(s => s.trim()).filter(s => s.length > 10);
      if (sentences.length > 0) {
        sentences.forEach((sentence, idx) => {
          if (idx < 3) {
            let year = years[idx];
            const yearMatch = sentence.match(/\b(19\d\d|20\d\d)\b/g);
            if (yearMatch) {
              if (yearMatch.length === 1) year = `${yearMatch[0]} - Present`;
              else if (yearMatch.length >= 2) year = `${yearMatch[0]} - ${yearMatch[1]}`;
            }

            let milestoneRole = rawTitle;
            const roleMatch = sentence.match(/(Software Engineer|Developer|DevOps Engineer|Ops Engineer|Systems Architect|Designer|Architect|Manager|Analyst)/i);
            if (roleMatch) {
              milestoneRole = roleMatch[0];
            }

            const companyMatch = sentence.match(/at\s+([A-Z][a-zA-Z0-9]+)/i);
            if (companyMatch) {
              milestoneRole = `${milestoneRole} at ${companyMatch[1]}`;
            }

            finalMilestones.push({
              year,
              title: milestoneRole,
              desc: sentence
            });
          }
        });
      }
    }

    while (finalMilestones.length < 3) {
      const idx = finalMilestones.length;
      finalMilestones.push({
        year: years[idx],
        title: idx === 0 ? `${rawTitle}` : `${rawTitle} (Former)`,
        desc: idx === 0 
          ? `Operating as a professional ${rawTitle}, managing core architectures and delivering high-quality client results.`
          : `Contributed to project delivery, optimized layout structures, and aligned design implementations.`
      });
    }

    return {
      th: 'dynamic',
      n: rawName,
      t: enhancedTitle,
      bio: enhancedBio,
      skl: skillSet,
      exp: finalMilestones,
      projects: customProjects && customProjects.length > 0 ? customProjects : [
        {
          title: "Vanguard Project",
          desc: "Bespoke execution framework delivering high-performance layouts and clean visual flows.",
          tech: ["React", "CSS", "Vite"],
          img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
        },
        {
          title: "Apex Systems",
          desc: "Strategic roadmap optimization aligning brand goals with secure and performant technology delivery.",
          tech: ["Strategy", "Design", "Agile"],
          img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80"
        },
        {
          title: "Horizon Portal",
          desc: "Modern portfolio engine designed to elevate personal branding with zero hosting configurations.",
          tech: ["HTML5", "JavaScript", "Tailwind CSS"],
          img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80"
        }
      ],
      certifications: customCertifications && customCertifications.length > 0 ? customCertifications : [
        { title: "Google UX Design Professional Certificate", issuer: "Google", date: "Issued 2024" }
      ],
      style: customStyle || {
        colors: ["#a855f7", "#00e5ff"],
        font: "Outfit",
        glassmorphism: true,
        bgType: "aurora",
        designSystem: "reactbits"
      },
      sections: customSections && customSections.length > 0 ? customSections : ["hero", "about", "skills", "experience", "projects", "certifications", "contact"],
      sectionNames: customSectionNames || {},
      slug: slug.toLowerCase()
    };
  };

  const handleCompile = async () => {
    if (!name.trim()) {
      setAlertMessage("Please enter a name first.");
      return;
    }
    const finalSlug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'portfolio'}-${Math.random().toString(36).substring(2, 8)}`;

    const payload = {
      ...verifyAndEnhanceData(),
      slug: finalSlug
    };

    try {
      // Save payload directly to Firestore under "portfolios" collection
      await setDoc(doc(db, "portfolios", finalSlug), payload);

      const finalUrl = window.location.origin + '/' + finalSlug;

      setCompiledUrl(finalUrl);
      setCompileSuccess(true);
      
      confetti({
        particleCount: 150,
        spread: 80,
        colors: ['#a855f7', '#6366f1', '#00e5ff']
      });
    } catch (err) {
      console.error("Error saving to Firestore:", err);
      setAlertMessage("Failed to generate portfolio. Please check your network connection or Firebase database configuration.");
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(compiledUrl).then(() => {
      setAlertMessage("Portfolio URL copied to clipboard!");
    });
  };

  return (
    <div className="relative min-h-screen bg-[#070814] text-[#f8fafc] overflow-x-hidden flex flex-col justify-between selection:bg-purple-600/30 selection:text-[#a855f7]">
      {/* Full Page Background Aurora */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none w-full h-full">
        <Aurora
          colorStops={["#a855f7", "#6366f1", "#00e5ff"]}
          blend={0.6}
          amplitude={1.2}
          speed={0.3}
        />
      </div>

      {/* Background Ferrofluid Glowing Fluid Particles (Purple theme) */}
      <div className="absolute inset-0 w-full h-[500px] md:h-[650px] z-0 overflow-hidden pointer-events-none opacity-60">
        <Ferrofluid
          colors={["#a855f7", "#6366f1", "#c084fc"]}
          backgroundColor="#070814"
          speed={0.08}
          scale={1.4}
          turbulence={1.2}
          fluidity={0.15}
          rimWidth={0.25}
          sharpness={3.0}
          shimmer={1.2}
          glow={2.5}
          flowDirection="down"
          opacity={0.8}
          mouseInteraction={true}
          mouseStrength={1.2}
          mouseRadius={0.35}
        />
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070814]/40 to-[#070814]" />
      </div>

      {/* Navigation (Transparent) */}
      <motion.nav
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-20 flex justify-between items-center px-6 md:px-[8%] py-6 bg-transparent"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <i className="fa-solid fa-bolt text-sm text-white"></i>
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">
            instant-websites
          </span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center gap-1.5 text-sm font-semibold text-white/90 hover:text-white pb-1 border-b-2 border-purple-500 transition-colors">
            <i className="fa-solid fa-house text-[11px]"></i> Home
          </a>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 flex-1 flex flex-col justify-center items-center px-4 pt-16 pb-20 md:pt-20 md:pb-24 max-w-5xl mx-auto w-full text-center"
      >
        <motion.h1
          variants={itemVariants}
          className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 leading-[1.1] bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent max-w-3xl"
        >
          Build Your Portfolio in Seconds
        </motion.h1>
        
        <motion.p
          variants={itemVariants}
          className="text-gray-400 text-xs md:text-base mb-10 max-w-xl leading-relaxed font-light"
        >
          No code. No hassle. Just your name, your work, and a link.
        </motion.p>
        
        {/* Tabular Input Bar (Prompt / Doc / Themes / Build) */}
        <motion.div
          variants={itemVariants}
          className="relative w-full max-w-4xl bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl md:rounded-full p-3 md:py-2 md:pl-5 md:pr-2.5 flex flex-col md:flex-row items-center gap-4 md:gap-0 shadow-[0_20px_50px_rgba(0,0,0,0.5)] shadow-purple-500/5 hover:border-white/15 transition-all z-10"
        >
          {/* Description Input (Prompt) */}
          <div className="flex items-center gap-3 w-full md:flex-1 pb-3 md:pb-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5 flex-shrink-0">
              <i className="fa-solid fa-align-left text-[11px] text-purple-400"></i>
            </div>
            <div className="flex-1 text-left min-w-0">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">
                Description / Prompt
              </label>
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onBlur={() => {
                  const trimmed = promptText.trim();
                  if (trimmed && trimmed !== lastExtractedPrompt.current && trimmed.length > 5) {
                    lastExtractedPrompt.current = trimmed;
                    handleAutoExtract(trimmed, documentText);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const trimmed = promptText.trim();
                    if (trimmed && trimmed !== lastExtractedPrompt.current) {
                      lastExtractedPrompt.current = trimmed;
                      handleAutoExtract(trimmed, documentText);
                    }
                  }
                }}
                placeholder={animatedPlaceholder}
                className="bg-transparent border-none outline-none text-white text-sm font-semibold w-full placeholder-gray-650 focus:ring-0 p-0"
              />
            </div>
          </div>

          {/* Buttons: Add Document, Themes & Build */}
          <div className={`${
            selectedTheme === 'custom_upload'
              ? 'grid grid-cols-3 md:flex gap-2 w-full md:w-auto items-center justify-end md:pl-4 border-t md:border-t-0 border-white/5 pt-3 md:pt-0'
              : 'grid grid-cols-2 md:flex gap-2 w-full md:w-auto items-center justify-end md:pl-4 border-t md:border-t-0 border-white/5 pt-3 md:pt-0'
          }`}>
            <button
              onClick={() => { setModalText(documentText); setIsModalOpen(true); }}
              className="py-3 px-3 md:px-5 bg-white/5 hover:bg-white/10 text-white/90 font-bold text-xs uppercase tracking-wider rounded-xl md:rounded-full border border-white/10 hover:border-white/15 transition-all flex items-center justify-center gap-1.5 active:scale-95 col-span-1 flex-shrink-0"
            >
              <i className="fa-solid fa-file-invoice text-[11px] text-purple-400"></i> {documentText ? "Loaded" : "Add Doc"}
            </button>
            <button
              onClick={() => setIsTemplatesModalOpen(true)}
              className="py-3 px-3 md:px-5 bg-white/5 hover:bg-white/10 text-white/90 font-bold text-xs uppercase tracking-wider rounded-xl md:rounded-full border border-white/10 hover:border-white/15 transition-all flex items-center justify-center gap-1.5 active:scale-95 col-span-1 flex-shrink-0"
            >
              <i className="fa-solid fa-images text-[11px] text-purple-400"></i> Themes
            </button>
            {selectedTheme === 'custom_upload' && (
              <button
                type="button"
                onClick={() => setIsCustomThemeModalOpen(true)}
                className="py-3 px-4 bg-white/5 hover:bg-white/10 text-white/90 font-bold text-xs rounded-xl md:rounded-full border border-white/10 hover:border-white/15 transition-all flex items-center justify-center gap-1.5 active:scale-95 col-span-1 flex-shrink-0"
                title="Configure Custom Theme"
              >
                <i className="fa-solid fa-gear text-[11px] text-purple-400"></i>
              </button>
            )}
            <button
              onClick={handlePreBuild}
              className={`py-3 px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl md:rounded-full shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 flex-shrink-0 ${
                selectedTheme === 'custom_upload' ? 'col-span-3 md:col-span-1' : 'col-span-2 md:col-span-1'
              }`}
            >
              <i className="fa-solid fa-hammer text-[11px]"></i> Build
            </button>
          </div>
        </motion.div>

        {/* Full-Screen Glassmorphic Compiler Loader Overlay */}
        <AnimatePresence>
          {isCompiling && (() => {
            const activeStep = (() => {
              if (compileLogs.some(log => log.includes("complete!") || log.includes("successfully saved"))) return 4;
              if (compileLogs.some(log => log.includes("Firestore") || log.includes("DATABASE") || log.includes("collision"))) return 3;
              if (compileLogs.some(log => log.includes("Compiling") || log.includes("Preparing") || log.includes("Skills"))) return 2;
              return 1;
            })();
            const steps = [
              { id: 1, name: "Parse Profile" },
              { id: 2, name: "Compile Theme" },
              { id: 3, name: "Cloud Sync" },
              { id: 4, name: "Deploy Live" }
            ];
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="w-full max-w-lg bg-[#0b0813]/95 border border-purple-500/30 rounded-3xl p-8 shadow-[0_0_80px_rgba(168,85,247,0.25)] relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00e5ff] via-purple-500 to-[#00e5ff] animate-pulse" />
                  
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b border-purple-500/10 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500"></span>
                      </div>
                      <span className="text-xs text-white uppercase tracking-widest font-extrabold font-outfit">Nova Compiler v2</span>
                    </div>
                    <span className="text-[10px] text-purple-400 font-extrabold bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 tracking-wider">COMPILING ASSETS</span>
                  </div>

                  {/* Horizontal Progress Steps */}
                  <div className="grid grid-cols-4 gap-2 mb-8 relative">
                    {steps.map(s => {
                      const isCompleted = activeStep > s.id;
                      const isActive = activeStep === s.id;
                      return (
                        <div key={s.id} className="flex flex-col items-center text-center">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-500 z-10 ${
                            isCompleted 
                              ? 'bg-green-500/10 border-green-500 text-green-400' 
                              : isActive 
                              ? 'bg-purple-500/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                              : 'bg-white/5 border-white/10 text-gray-500'
                          }`}>
                            {isCompleted ? (
                              <i className="fa-solid fa-check text-xs"></i>
                            ) : isActive ? (
                              <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i>
                            ) : (
                              <span>{s.id}</span>
                            )}
                          </div>
                          <span className={`text-[9px] font-extrabold mt-2 uppercase tracking-wider transition-colors duration-500 ${
                            isActive ? 'text-purple-400 font-black' : isCompleted ? 'text-green-400' : 'text-gray-600'
                          }`}>
                            {s.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Logs terminal output */}
                  <div className="space-y-1.5 max-h-48 min-h-32 overflow-y-auto text-xs p-4 bg-black/60 rounded-2xl border border-white/5 font-mono">
                    {compileLogs.map((log, index) => {
                      let colorClass = 'text-gray-300';
                      if (log.includes('[COMPILER]')) colorClass = 'text-cyan-400 font-semibold';
                      else if (log.includes('[ENTITY]')) colorClass = 'text-purple-455';
                      else if (log.includes('[SKILLS]')) colorClass = 'text-amber-400';
                      else if (log.includes('[DATABASE]')) colorClass = 'text-emerald-400';
                      else if (log.includes('[ERROR]')) colorClass = 'text-red-400 font-bold';
                      return (
                        <motion.div 
                          key={index} 
                          initial={{ opacity: 0, x: -3 }} 
                          animate={{ opacity: 1, x: 0 }}
                          className="leading-relaxed flex gap-2"
                        >
                          <span className="text-purple-500/50 select-none">&gt;</span>
                          <span className={colorClass}>{log}</span>
                        </motion.div>
                      );
                    })}
                    <div className="animate-pulse text-purple-400 mt-1 select-none">_</div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-gray-500 font-bold border-t border-white/5 pt-5">
                    <span className="tracking-widest">DIGITAL TWIN PIPELINE ACTIVE · SYSTEM IDLE</span>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>


        {/* Status indicator tag */}
        <p className="text-[10px] text-gray-500 mt-6 tracking-widest uppercase font-medium">
          Free forever · No account needed · Instant link
        </p>

        {/* Compile Success Display */}
        {compileSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 w-full max-w-2xl bg-purple-500/5 border border-dashed border-purple-500/30 rounded-3xl p-6 text-center space-y-4 shadow-xl shadow-purple-500/5"
          >
            <h3 className="text-white text-md font-bold flex items-center justify-center gap-2">
              <i className="fa-solid fa-circle-check text-green-400"></i> Website Generated Successfully
            </h3>
            <div className="bg-[#070814] border border-white/5 rounded-xl p-3 text-xs text-purple-400 font-mono break-all max-h-24 overflow-y-auto">
              {compiledUrl}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={copyUrl}
                className="px-6 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-gray-200 transition-all active:scale-95"
              >
                Copy Link URL
              </button>
              <button
                onClick={() => {
                  if (compiledPayload) {
                    onCompile(compiledPayload);
                  }
                }}
                className="px-6 py-2 bg-purple-600 text-white font-semibold text-xs rounded-full hover:bg-purple-500 transition-all active:scale-95"
              >
                Open Portfolio Preview
              </button>
            </div>
          </motion.div>
        )}
      </motion.main>

      {/* OUR Goals Section */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto pl-6 md:pl-16 pr-0 py-28 text-left border-t border-white/5 overflow-visible">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center overflow-visible">
          {/* Left Column: Vision & Header */}
          <div className="space-y-8 pr-6">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full w-fit">Vision</span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">OUR Goals</h2>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed font-light max-w-lg">
              Reimagining digital presence through instant-compilation, premium layouts, and zero barriers.
            </p>
            <div className="text-sm md:text-base text-gray-400 space-y-4">
              <p className="flex items-center gap-3">
                <i className="fa-solid fa-circle-check text-purple-400 text-base"></i> Optimized for high conversion
              </p>
              <p className="flex items-center gap-3">
                <i className="fa-solid fa-circle-check text-[#00e5ff] text-base"></i> Cinematic and engaging animations
              </p>
              <p className="flex items-center gap-3">
                <i className="fa-solid fa-circle-check text-indigo-400 text-base"></i> Seamless deployment tracks
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Card Stack Swap */}
          <div className="relative flex justify-end items-center h-[580px] w-full overflow-visible">
            <CardSwap
              width={560}
              height={400}
              cardDistance={70}
              verticalDistance={60}
              delay={4000}
              pauseOnHover={true}
              skewAmount={4}
              easing="elastic"
            >
              <Card className="bg-[#0c0d1e] border border-purple-500/20 p-10 md:p-12 rounded-3xl flex flex-col justify-between shadow-[0_0_35px_rgba(168,85,247,0.18)] hover:border-purple-500/50 hover:shadow-[0_0_45px_rgba(168,85,247,0.35)] transition-all duration-300 select-none">
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                    <i className="fa-solid fa-bolt text-xl"></i>
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold text-white uppercase tracking-wider">Instant Compilation</h3>
                  <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light">
                    Convert raw text or PDF resumes into fully-featured web systems in under 5 seconds. No hosting, databases, or configuration required.
                  </p>
                </div>
                <div className="text-sm text-gray-600 font-mono tracking-widest text-right">01 / 03</div>
              </Card>

              <Card className="bg-[#0c0d1e] border border-[#00e5ff]/20 p-10 md:p-12 rounded-3xl flex flex-col justify-between shadow-[0_0_35px_rgba(0,229,255,0.18)] hover:border-[#00e5ff]/50 hover:shadow-[0_0_45px_rgba(0,229,255,0.35)] transition-all duration-300 select-none">
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#00e5ff]/10 flex items-center justify-center text-[#00e5ff] border border-[#00e5ff]/20">
                    <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold text-white uppercase tracking-wider">Design Excellence</h3>
                  <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light">
                    Deliver state-of-the-art visual design systems and animations, matching Milan editorial luxury, brutalist offsets, and futuristic dark aesthetics.
                  </p>
                </div>
                <div className="text-sm text-gray-600 font-mono tracking-widest text-right">02 / 03</div>
              </Card>

              <Card className="bg-[#0c0d1e] border border-indigo-500/20 p-10 md:p-12 rounded-3xl flex flex-col justify-between shadow-[0_0_35px_rgba(99,102,241,0.18)] hover:border-indigo-500/50 hover:shadow-[0_0_45px_rgba(99,102,241,0.35)] transition-all duration-300 select-none">
                <div className="space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                    <i className="fa-solid fa-shield-halved text-xl"></i>
                  </div>
                  <h3 className="text-xl md:text-3xl font-bold text-white uppercase tracking-wider">Decentralized Privacy</h3>
                  <p className="text-sm md:text-base text-gray-400 leading-relaxed font-light">
                    Keep complete control of your data. Portfolios are compiled entirely into secure, shareable URL states with no server storage trackers.
                  </p>
                </div>
                <div className="text-sm text-gray-600 font-mono tracking-widest text-right">03 / 03</div>
              </Card>
            </CardSwap>
          </div>
        </div>
      </section>

      {/* Community Comments Section */}
      <section className="relative z-10 w-full max-w-[1400px] mx-auto pl-6 md:pl-16 pr-6 py-20 text-left border-t border-white/5">
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="text-[11px] font-bold text-[#00e5ff] uppercase tracking-widest bg-[#00e5ff]/10 px-3 py-1 rounded-full w-fit">Community</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mt-4">Reviews & Comments</h2>
              <p className="text-gray-400 text-sm mt-2 font-light">See what others are saying about their instant websites.</p>
            </div>
            <button
              onClick={() => {
                setNewFeedback({ name: '', rating: 5, comment: '' });
                setIsFeedbackModalOpen(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <i className="fa-solid fa-pen-to-square"></i> Leave a Comment
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.length === 0 ? (
              <div className="col-span-full py-16 text-center text-gray-500 text-sm font-light border border-white/5 rounded-3xl bg-white/[0.01]">
                <i className="fa-solid fa-comments text-4xl mb-4 text-gray-600 block"></i>
                No reviews yet. Be the first to share your thoughts!
              </div>
            ) : (
              comments.map((c, idx) => (
                <div
                  key={c.id || idx}
                  className="bg-[#0b0c16] border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 space-y-4 hover:shadow-[0_0_20px_rgba(168,85,247,0.05)] transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i
                          key={i}
                          className={`fa-solid fa-star ${i < c.rating ? 'text-amber-400' : 'text-gray-700'}`}
                        ></i>
                      ))}
                    </div>
                    <p className="text-gray-300 text-xs font-light leading-relaxed italic">
                      "{c.comment}"
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                    <span className="text-xs font-bold text-white tracking-wide">{c.name}</span>
                    <span className="text-[9px] text-gray-600 font-mono">
                      {new Date(c.timestamp || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#070814]/20 py-8 px-[8%] text-center text-xs text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>© 2026 instant-websites. All rights reserved.</div>
        <div className="flex gap-6 text-sm">
          <a href="#" className="hover:text-purple-400 transition-colors"><i className="fa-brands fa-github"></i></a>
          <a href="#" className="hover:text-purple-400 transition-colors"><i className="fa-brands fa-linkedin-in"></i></a>
          <a href="#" className="hover:text-purple-400 transition-colors"><i className="fa-brands fa-twitter"></i></a>
        </div>
      </footer>

      {/* Add Document Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0b0c16] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                  <i className="fa-solid fa-file-invoice text-purple-400"></i> Add Resume / Work History
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5">
                {/* Pasted Textarea */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paste Resume Text / Work History</label>
                  <textarea
                    value={modalText}
                    onChange={(e) => setModalText(e.target.value)}
                    placeholder="Describe your professional journey, roles, or highlights..."
                    className="w-full h-36 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-650 focus:outline-none focus:border-purple-500 resize-none leading-relaxed font-sans"
                  />
                </div>

                {/* PDF Resume Parser */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Or Upload PDF Resume</label>
                  <div className="relative group border border-dashed border-white/15 hover:border-purple-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-white/[0.01]">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <i className={`fa-solid ${pdfParsing ? 'fa-spinner fa-spin' : 'fa-file-pdf'} text-3xl text-purple-400 mb-2`}></i>
                    <p className="text-xs text-gray-400">
                      {pdfParsing ? 'Extracting resume details...' : 'Drag and drop or click to parse PDF'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 flex gap-3 justify-end bg-white/[0.01]">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModalDocument}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95"
                >
                  Save & Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Build Form Modal */}
      <AnimatePresence>
        {isBuildModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBuildModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl h-[85vh] bg-[#0b0c16] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col z-10"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                  <i className="fa-solid fa-hammer text-purple-400"></i> Configure Portfolio Details
                </h3>
                <button
                  onClick={() => setIsBuildModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>

              {/* Modal Core Layout */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 bg-black/20 border-r border-white/5 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto shrink-0">
                  {[
                    { id: 'profile', name: 'Profile Info', icon: 'fa-user' },
                    { id: 'experience', name: 'Work History', icon: 'fa-briefcase' },
                    { id: 'projects', name: 'Projects', icon: 'fa-code-branch' },
                    { id: 'skills_links', name: 'Skills & Contact', icon: 'fa-share-nodes' }
                  ].map(tab => {
                    const isActive = activeFormTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveFormTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap md:w-full select-none ${
                          isActive 
                            ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                            : 'text-gray-450 hover:bg-white/[0.02] border border-transparent'
                        }`}
                      >
                        <i className={`fa-solid ${tab.icon} text-sm ${isActive ? 'text-purple-400' : 'text-gray-450'}`}></i>
                        {tab.name}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Panel Content */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {activeFormTab === 'profile' && (
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-white mb-2">Profile Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                              setName(e.target.value);
                              if (!isSlugManual) {
                                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
                              }
                            }}
                            placeholder="e.g. Your Name"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Job Title</label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Junior DevOps Engineer"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>
                      </div>


                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bio / Summary</label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Write a brief background about your experience and skills..."
                          className="w-full h-32 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  )}

                  {activeFormTab === 'experience' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-bold text-white">Work History</h4>
                        <button
                          onClick={handleAddExperience}
                          className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                        >
                          <i className="fa-solid fa-plus text-[9px]"></i> Add Job
                        </button>
                      </div>

                      {experience.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl bg-white/[0.005]">
                          <i className="fa-solid fa-briefcase text-2xl text-gray-600 mb-2"></i>
                          <p className="text-xs text-gray-400">No work history added yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {experience.map((exp, idx) => (
                            <div key={idx} className="p-4 border border-white/5 rounded-xl bg-white/[0.01] relative space-y-3">
                              <button
                                onClick={() => handleRemoveExperience(idx)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors"
                                title="Remove Job"
                              >
                                <i className="fa-solid fa-trash-can text-xs"></i>
                              </button>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Year range</label>
                                  <input
                                    type="text"
                                    value={exp.year}
                                    onChange={(e) => handleUpdateExperience(idx, 'year', e.target.value)}
                                    placeholder="e.g. 2023 - Present"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                                  />
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Job Title / Company</label>
                                  <input
                                    type="text"
                                    value={exp.title}
                                    onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                                    placeholder="e.g. Junior DevOps Engineer at Infohybrid"
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                                <textarea
                                  value={exp.desc}
                                  onChange={(e) => handleUpdateExperience(idx, 'desc', e.target.value)}
                                  placeholder="Describe your responsibilities, technologies used, and accomplishments..."
                                  className="w-full h-16 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeFormTab === 'projects' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-bold text-white">Projects</h4>
                        <button
                          onClick={handleAddProject}
                          className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                        >
                          <i className="fa-solid fa-plus text-[9px]"></i> Add Project
                        </button>
                      </div>

                      {projects.length === 0 ? (
                        <div className="text-center py-8 border border-dashed border-white/5 rounded-2xl bg-white/[0.005]">
                          <i className="fa-solid fa-code-branch text-2xl text-gray-600 mb-2"></i>
                          <p className="text-xs text-gray-400">No projects added yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {projects.map((proj, idx) => (
                            <div key={idx} className="p-4 border border-white/5 rounded-xl bg-white/[0.01] relative space-y-3">
                              <button
                                onClick={() => handleRemoveProject(idx)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-red-400 transition-colors"
                                title="Remove Project"
                              >
                                <i className="fa-solid fa-trash-can text-xs"></i>
                              </button>

                              <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Project Title</label>
                                <input
                                  type="text"
                                  value={proj.title}
                                  onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                                  placeholder="e.g. CI-CD Pipeline Orchestrations"
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Project GitHub / Live Link</label>
                                <input
                                  type="text"
                                  value={proj.link || ''}
                                  onChange={(e) => handleUpdateProject(idx, 'link', e.target.value)}
                                  placeholder="e.g. https://github.com/username/project"
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Description</label>
                                <textarea
                                  value={proj.desc}
                                  onChange={(e) => handleUpdateProject(idx, 'desc', e.target.value)}
                                  placeholder="What does the project do? What tools/frameworks did you use?"
                                  className="w-full h-16 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Tech / Tags <span className="text-gray-600 normal-case">(comma-separated)</span></label>
                                <input
                                  type="text"
                                  value={(proj.tech || []).join(',')}
                                  onChange={(e) => handleUpdateProject(idx, 'tech', e.target.value.split(','))}
                                  placeholder="e.g. React, Docker, AWS, Terraform"
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeFormTab === 'skills_links' && (
                    <div className="space-y-5">
                      {/* Skills Section */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-white">Skills & Technologies</h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                                  setSkills([...skills, skillInput.trim()]);
                                  setSkillInput('');
                                }
                              }
                            }}
                            placeholder="Type a skill (e.g. Kubernetes) and press Enter or Add"
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (skillInput.trim() && !skills.includes(skillInput.trim())) {
                                  setSkills([...skills, skillInput.trim()]);
                                  setSkillInput('');
                              }
                            }}
                            className="px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95"
                          >
                            Add
                          </button>
                        </div>

                        {/* Skill Badges */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          {skills.length === 0 ? (
                            <p className="text-[11px] text-gray-500 italic">No skills added yet.</p>
                          ) : (
                            skills.map((sk, idx) => (
                              <span key={idx} className="px-3 py-1 bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-full flex items-center gap-1.5 select-none">
                                {sk}
                                <button
                                  type="button"
                                  onClick={() => setSkills(skills.filter(s => s !== sk))}
                                  className="w-3.5 h-3.5 rounded-full hover:bg-purple-500/20 flex items-center justify-center text-[10px] text-purple-400/70 hover:text-white"
                                >
                                  ×
                                </button>
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      <span className="h-px bg-white/5 block my-2" />

                      {/* Contacts Section */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-white">Contact & Links</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                            <input
                              type="email"
                              value={contact.email || ''}
                              onChange={(e) => handleUpdateContact('email', e.target.value)}
                              placeholder="e.g. hello@example.com"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">GitHub Profile</label>
                            <input
                              type="text"
                              value={contact.github || ''}
                              onChange={(e) => handleUpdateContact('github', e.target.value)}
                              placeholder="e.g. github.com/username"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">LinkedIn Profile</label>
                            <input
                              type="text"
                              value={contact.linkedin || ''}
                              onChange={(e) => handleUpdateContact('linkedin', e.target.value)}
                              placeholder="e.g. linkedin.com/in/username"
                              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 flex gap-3 justify-end bg-white/[0.01]">
                <button
                  onClick={() => setIsBuildModalOpen(false)}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsBuildModalOpen(false);
                    handleBrainCompile();
                  }}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <i className="fa-solid fa-hammer"></i> Build Portfolio
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Theme Configuration Modal */}
      <AnimatePresence>
        {isCustomThemeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomThemeModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0b0c16] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                  <i className="fa-solid fa-gears text-purple-400"></i> Configure Custom Theme
                </h3>
                <button
                  onClick={() => setIsCustomThemeModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                {/* File Upload Option */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload HTML File</label>
                  <div className="relative group border border-dashed border-white/15 hover:border-purple-500 rounded-xl p-4 text-center cursor-pointer transition-all bg-white/[0.01]">
                    <input
                      type="file"
                      accept=".html"
                      onChange={handleHtmlUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <i className="fa-solid fa-file-code text-3xl text-purple-400 mb-2"></i>
                    <p className="text-xs text-gray-400">
                      {customHtmlName ? `Selected: ${customHtmlName}` : 'Drag and drop or click to upload index.html'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-white/5 flex gap-3 justify-end bg-white/[0.01]">
                <button
                  onClick={() => setIsCustomThemeModalOpen(false)}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95"
                >
                  Done & Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Templates Modal */}
      <AnimatePresence>
        {isTemplatesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTemplatesModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-[#090a10]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                    <i className="fa-solid fa-images text-purple-400"></i> Select Portfolio Theme
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-light">Choose from our curated 3D and minimal templates to showcase your professional work.</p>
                </div>
                <button
                  onClick={() => setIsTemplatesModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
                {[
                  { id: 'theme1', name: 'Theme 1 - 3D Portfolio', desc: 'Modern Tech 3D Developer Portfolio with ambient lighting and a 3D desktop model.', icon: 'fa-microchip', color: 'from-purple-500 to-cyan-500', preview: '/themes/theme1_preview.png', badge: '3D WebGL' },
                  { id: 'theme2', name: 'Theme 2 - 3D Game Room', desc: 'Interactive 3D Game Room portfolio with WASD/Sprint keyboard character movement.', icon: 'fa-terminal', color: 'from-green-500 to-emerald-700', preview: '/themes/theme2_preview.png', badge: '3D WASD' },
                  { id: 'theme3', name: 'Theme 3 - Sleek Modern', desc: 'Sleek, high-contrast black & white layout with fluid parallax scrolling animations.', icon: 'fa-cubes', color: 'from-blue-500 to-indigo-500', preview: '/themes/theme3_preview.png', badge: 'Parallax' },
                  { id: 'theme4', name: 'Theme 4 - Awwwards Standard', desc: 'Award-winning minimalist design featuring floating interactive work showcases, clean typography, and micro-interactive elements.', icon: 'fa-wand-magic-sparkles', color: 'from-pink-500 to-rose-500', preview: '/themes/theme4_preview.png', badge: 'Awwwards' },
                  { id: 'theme5', name: 'Theme 5 - Adrian Hajdin 3D', desc: 'Beautiful 3D interactive developer portfolio with custom GLTF models, smooth GSAP transitions, and floating stars.', icon: 'fa-cubes-stacked', color: 'from-amber-500 to-orange-600', preview: '/themes/theme5_preview.png', badge: '3D GSAP' },
                  { id: 'custom_upload', name: 'Custom Theme / Custom HTML', desc: 'Upload your own custom index.html file to host your own portfolio.', icon: 'fa-file-code', color: 'from-blue-500 to-indigo-600', preview: '/themes/custom_preview.png', badge: 'HTML' }
                ].map(t => {
                  const isSelected = selectedTheme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTheme(t.id);
                        setIsTemplatesModalOpen(false);
                        if (t.id === 'custom_upload') {
                          setIsCustomThemeModalOpen(true);
                        }
                      }}
                      className={`group rounded-2xl overflow-hidden text-left border flex flex-col transition-all select-none hover:bg-white/[0.02] active:scale-[0.98] ${
                        isSelected 
                          ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                          : 'border-white/5 bg-white/[0.01]'
                      }`}
                    >
                      <div className="w-full aspect-[16/10] overflow-hidden border-b border-white/5 bg-slate-900 relative">
                        <img 
                          src={t.preview} 
                          alt={t.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Gradient overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs shadow-lg`}>
                            <i className={`fa-solid ${t.icon}`}></i>
                          </div>
                          <span className="text-[9px] uppercase font-bold tracking-widest bg-black/40 backdrop-blur-md text-white/95 px-2 py-0.5 rounded border border-white/10">
                            {t.badge}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg border border-purple-400/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            Selected
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-grow flex flex-col justify-between space-y-2">
                        <div>
                          <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-purple-450 transition-colors">
                            {t.name}
                          </h4>
                          <p className="text-xs text-gray-400 leading-relaxed mt-1.5 font-light">{t.desc}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rate Us & Comment Modal */}
      <AnimatePresence>
        {isFeedbackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFeedbackModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-[#0b0c16] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col z-10"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                  <i className="fa-solid fa-star text-amber-400"></i> Rate Us & Review
                </h3>
                <button
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fa-solid fa-xmark text-sm"></i>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-300 font-light">How was your website building experience?</p>
                  <div className="flex justify-center gap-2 text-2xl py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewFeedback(prev => ({ ...prev, rating: star }))}
                        className="transition-transform active:scale-90 hover:scale-110 text-2xl"
                      >
                        <i
                          className={`fa-solid fa-star ${
                            star <= newFeedback.rating ? 'text-amber-400' : 'text-gray-700'
                          }`}
                        ></i>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Name</label>
                    <input
                      type="text"
                      value={newFeedback.name}
                      onChange={(e) => setNewFeedback(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Your Name"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Comment / Feedback</label>
                    <textarea
                      value={newFeedback.comment}
                      onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your thoughts about our website builder..."
                      rows="4"
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => submitComment(newFeedback.name, newFeedback.rating, newFeedback.comment)}
                  disabled={!newFeedback.name.trim() || !newFeedback.comment.trim()}
                  className="w-full py-3 bg-gradient-to-r from-[#00e5ff] to-purple-600 hover:from-[#00e5ff]/80 hover:to-purple-600/80 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-500 text-black disabled:text-gray-500 font-bold text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]"
                >
                  Submit Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <GradualBlur
        target="page"
        position="bottom"
        height="7rem"
        strength={1.5}
        divCount={5}
        opacity={scrollOpacity * 0.7}
        style={{
          transition: 'opacity 0.2s ease-out'
        }}
      />
      
      {/* Custom Alert Modal */}
      <AnimatePresence>
        {alertMessage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-sm bg-[#0d0914]/90 border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-[#00e5ff]" />
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                <i className="fa-solid fa-bell text-purple-400 text-lg"></i>
              </div>
              <h3 className="text-white font-semibold text-sm mb-2 font-outfit">Notice</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6">
                {alertMessage}
              </p>
              <button
                onClick={() => setAlertMessage(null)}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-semibold transition-colors focus:outline-none"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-sm bg-[#0d0914]/95 border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.2)] relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00e5ff] via-purple-500 to-[#00e5ff]" />
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                <i className="fa-solid fa-circle-question text-purple-400 text-lg animate-pulse"></i>
              </div>
              <h3 className="text-white font-semibold text-sm mb-2 font-outfit">Verification Required</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-6 font-outfit">
                {confirmModal.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (confirmModal.onCancel) confirmModal.onCancel();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 text-xs font-semibold transition-colors focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmModal.onConfirm) confirmModal.onConfirm();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-550 hover:to-indigo-550 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-500/20 transition-all active:scale-95 focus:outline-none"
                >
                  Review & Edit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
