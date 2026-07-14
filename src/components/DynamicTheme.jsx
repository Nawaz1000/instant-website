import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Aurora from './Aurora';
import Ferrofluid from './Ferrofluid';
import GradualBlur from './GradualBlur';

// Custom 3D Tilt Card Component using vanilla React mouse tracking
function TiltCard({ children, className }) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse position inside card
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Rotate max 12 degrees
    const rotateX = -((y - centerY) / centerY) * 12;
    const rotateY = ((x - centerX) / centerX) * 12;
    
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-200 ease-out select-none cursor-pointer ${className}`}
      style={{
        transform: isHovered 
          ? `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1.02, 1.02, 1.02)` 
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transformStyle: 'preserve-3d',
      }}
    >
      <div style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}>
        {children}
      </div>
    </div>
  );
}

// Particle Starfield Background Component (Canvas 2D)
function CanvasParticles({ colors }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 70;
    const colorsList = colors || ['#a855f7', '#00e5ff', '#6366f1'];

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.color = colorsList[Math.floor(Math.random() * colorsList.length)];
        this.alpha = Math.random() * 0.5 + 0.3;
        this.dAlpha = (Math.random() - 0.5) * 0.01;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        this.alpha += this.dAlpha;
        if (this.alpha < 0.2 || this.alpha > 0.8) this.dAlpha *= -1;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [colors]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none w-full h-full" />;
}

// 3D Canvas Wireframe Geometric Mesh (Built using Canvas 2D to ensure 100% reliability and light weight)
function Canvas3DObject({ colors, designSystem }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = 300);
    let height = (canvas.height = 300);

    const color = colors?.[0] || '#00e5ff';
    const color2 = colors?.[1] || '#a855f7';

    // 3D points for a torus / donut shape
    const points = [];
    
    if (designSystem === 'spline') {
      const R = 75;
      const r = 25;
      const segmentsU = 12;
      const segmentsV = 12;

      for (let i = 0; i < segmentsU; i++) {
        const u = (i / segmentsU) * Math.PI * 2;
        for (let j = 0; j < segmentsV; j++) {
          const v = (j / segmentsV) * Math.PI * 2;
          const x = (R + r * Math.cos(v)) * Math.cos(u);
          const y = (R + r * Math.cos(v)) * Math.sin(u);
          const z = r * Math.sin(v);
          points.push({ x, y, z, type: 'torus' });
        }
      }

      // Central sphere inside torus
      const sphereRadius = 25;
      const segmentsLat = 8;
      const segmentsLong = 8;
      for (let i = 0; i <= segmentsLat; i++) {
        const theta = (i / segmentsLat) * Math.PI;
        for (let j = 0; j < segmentsLong; j++) {
          const phi = (j / segmentsLong) * Math.PI * 2;
          const x = sphereRadius * Math.sin(theta) * Math.cos(phi);
          const y = sphereRadius * Math.sin(theta) * Math.sin(phi);
          const z = sphereRadius * Math.cos(theta);
          points.push({ x, y, z, type: 'sphere' });
        }
      }
    } else {
      const R = 80;
      const r = 30;
      const segmentsU = 16;
      const segmentsV = 16;

      for (let i = 0; i < segmentsU; i++) {
        const u = (i / segmentsU) * Math.PI * 2;
        for (let j = 0; j < segmentsV; j++) {
          const v = (j / segmentsV) * Math.PI * 2;
          const x = (R + r * Math.cos(v)) * Math.cos(u);
          const y = (R + r * Math.cos(v)) * Math.sin(u);
          const z = r * Math.sin(v);
          points.push({ x, y, z, type: 'torus' });
        }
      }
    }

    let angleX = 0;
    let angleY = 0;
    let bounce = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - width / 2;
      const y = e.clientY - rect.top - height / 2;
      mouseRef.current = { x: x * 0.005, y: y * 0.005 };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const project = (x, y, z) => {
      const focalLength = 350;
      const scale = focalLength / (focalLength + z);
      return {
        x: x * scale + width / 2,
        y: y * scale + height / 2,
        scale
      };
    };

    const rotateX3D = (point, rad) => {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const y = point.y * cos - point.z * sin;
      const z = point.y * sin + point.z * cos;
      return { ...point, y, z };
    };

    const rotateY3D = (point, rad) => {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const x = point.x * cos + point.z * sin;
      const z = -point.x * sin + point.z * cos;
      return { ...point, x, z };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      angleX += 0.01 + mouseRef.current.y * 0.2;
      angleY += 0.01 + mouseRef.current.x * 0.2;
      bounce += 0.03;

      mouseRef.current.x *= 0.95;
      mouseRef.current.y *= 0.95;

      const projected = points.map((p) => {
        let x = p.x;
        let y = p.y;
        let z = p.z;
        
        if (p.type === 'sphere') {
          y += Math.sin(bounce) * 10;
        }

        let rotated = rotateX3D({ x, y, z }, angleX);
        rotated = rotateY3D(rotated, angleY);
        return {
          ...project(rotated.x, rotated.y, rotated.z),
          orig: p
        };
      });

      ctx.strokeStyle = color;
      ctx.lineWidth = 0.5;

      const torusProjected = projected.filter(p => p.orig.type === 'torus');
      const sphereProjected = projected.filter(p => p.orig.type === 'sphere');

      if (designSystem === 'spline') {
        const segmentsU = 12;
        const segmentsV = 12;
        for (let i = 0; i < segmentsU; i++) {
          ctx.beginPath();
          for (let j = 0; j <= segmentsV; j++) {
            const idx = i * segmentsV + (j % segmentsV);
            const p = torusProjected[idx];
            if (p) {
              if (j === 0) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
          }
          ctx.strokeStyle = i % 2 === 0 ? color : color2;
          ctx.stroke();
        }

        ctx.beginPath();
        sphereProjected.forEach((p, idx) => {
          if (idx % 8 === 0) ctx.beginPath();
          ctx.arc(p.x, p.y, p.scale * 0.8, 0, Math.PI * 2);
          ctx.strokeStyle = color2;
          ctx.stroke();
        });
      } else {
        const segmentsU = 16;
        const segmentsV = 16;
        for (let i = 0; i < segmentsU; i++) {
          ctx.beginPath();
          for (let j = 0; j <= segmentsV; j++) {
            const idx = i * segmentsV + (j % segmentsV);
            const p = torusProjected[idx];
            if (p) {
              if (j === 0) ctx.moveTo(p.x, p.y);
              else ctx.lineTo(p.x, p.y);
            }
          }
          ctx.strokeStyle = i % 2 === 0 ? color : color2;
          ctx.stroke();
        }
      }

      projected.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.scale * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = p.scale > 1 ? color : color2;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [colors, designSystem]);

  return <canvas ref={canvasRef} width={300} height={300} className="w-[300px] h-[300px] pointer-events-none drop-shadow-[0_0_20px_rgba(0,229,255,0.2)]" />;
}

// Guest terminal component for 21.dev style
function TerminalConsole({ name, title, bio, primaryColor, secondaryColor }) {
  const [logs, setLogs] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const terminalEndRef = useRef(null);

  useEffect(() => {
    const initialLogs = [
      `Initializing twenty_one_dev local kernel v21.0.0...`,
      `Connection established with db.portfolio.slug...`,
      `[LOAD] Fetching entity variables for node '${name.toLowerCase().replace(/ /g, '-')}'`,
      `[INFO] Target: ${title}`,
      `[INFO] Status: Active and Open for Collaboration.`,
      `Type 'help' to list available terminal protocols.`,
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < initialLogs.length) {
        setLogs(prev => [...prev, `guest@twenty-one-dev:~$ ${initialLogs[current]}`]);
        current++;
      } else {
        clearInterval(interval);
      }
    }, 350);

    return () => clearInterval(interval);
  }, [name, title]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    
    const cmd = inputVal.trim().toLowerCase();
    const newLogs = [...logs, `guest@twenty-one-dev:~$ ${inputVal}`];

    if (cmd === 'help') {
      newLogs.push(`guest@twenty-one-dev:~$ Protocols: [bio, skills, projects, clear]`);
    } else if (cmd === 'bio') {
      newLogs.push(`guest@twenty-one-dev:~$ ${bio}`);
    } else if (cmd === 'skills') {
      newLogs.push(`guest@twenty-one-dev:~$ Loaded Modules: npm install --save-dev`);
    } else if (cmd === 'projects') {
      newLogs.push(`guest@twenty-one-dev:~$ Executing core projects pipeline... Query projects section below.`);
    } else if (cmd === 'clear') {
      setLogs([]);
      setInputVal('');
      return;
    } else {
      newLogs.push(`guest@twenty-one-dev:~$ Command not recognized: '${inputVal}'. Type 'help' for protocols.`);
    }

    setLogs(newLogs);
    setInputVal('');
  };

  return (
    <div className="w-full max-w-lg bg-[#04050e] border border-[#00ff66]/20 rounded-xl overflow-hidden font-mono shadow-[0_0_30px_rgba(0,255,102,0.08)] select-none">
      <div className="bg-[#0b0c16] px-4 py-2 flex items-center justify-between border-b border-[#00ff66]/10 text-xs text-gray-500">
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        </div>
        <span>Guest Console v21.dev</span>
        <i className="fa-solid fa-terminal text-[10px] text-[#00ff66] opacity-60 animate-pulse"></i>
      </div>

      <div className="p-4 h-64 overflow-y-auto space-y-2 text-xs text-[#00ff66] text-left">
        {logs.map((log, index) => (
          <div key={index} className="leading-relaxed whitespace-pre-wrap">{log}</div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center gap-1.5 pt-1.5 border-t border-[#00ff66]/10">
          <span className="text-purple-400">guest@twenty-one-dev:~$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="bg-transparent border-none outline-none focus:ring-0 p-0 m-0 text-white text-xs flex-1 caret-[#00ff66]"
            placeholder="Type 'help'..."
          />
        </form>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}

// Spaceship Starfield and Planetary Canvas Background
function SpaceshipSpaceBackground() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    
    const stars = [];
    const starCount = 120;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random(),
        dAlpha: (Math.random() - 0.5) * 0.015
      });
    }
    
    const planets = [
      {
        x: width * 0.2,
        y: height * 0.25,
        r: 65,
        vx: 0.02,
        vy: 0.01,
        c1: '#00e5ff',
        c2: '#0b1626',
        ring: true
      },
      {
        x: width * 0.85,
        y: height * 0.65,
        r: 35,
        vx: -0.01,
        vy: -0.008,
        c1: '#a855f7',
        c2: '#0e0b1f',
        ring: false
      }
    ];
    
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Starfield
      ctx.fillStyle = '#ffffff';
      stars.forEach(s => {
        s.alpha += s.dAlpha;
        if (s.alpha < 0.1 || s.alpha > 0.95) s.dAlpha *= -1;
        ctx.save();
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      
      // Drifting Planets
      planets.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x - p.r < -100 || p.x + p.r > width + 100) p.vx *= -1;
        if (p.y - p.r < -100 || p.y + p.r > height + 100) p.vy *= -1;
        
        ctx.save();
        const grad = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, p.r * 0.1, p.x, p.y, p.r);
        grad.addColorStop(0, p.c1);
        grad.addColorStop(1, p.c2);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        
        if (p.ring) {
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
          ctx.lineWidth = 3;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(-0.3);
          ctx.scale(2.4, 0.25);
          ctx.beginPath();
          ctx.arc(0, 0, p.r * 0.85, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none w-full h-full" />;
}

// Blinking Spaceship LED Indicators
function BlinkingLights({ count = 6, className = "" }) {
  const [states, setStates] = useState(Array(count).fill(false));
  
  useEffect(() => {
    const interval = setInterval(() => {
      setStates(prev => prev.map(() => Math.random() > 0.45));
    }, 450);
    return () => clearInterval(interval);
  }, [count]);
  
  const colors = [
    'bg-[#00f0ff] shadow-[#00f0ff]/80',
    'bg-emerald-400 shadow-emerald-400/80',
    'bg-amber-400 shadow-amber-400/80',
    'bg-red-500 shadow-red-500/80'
  ];
  
  return (
    <div className={`flex gap-1.5 items-center ${className}`}>
      {states.map((active, i) => (
        <div 
          key={i}
          className={`w-2 h-2 rounded-full transition-all duration-200 border border-black/35 ${active ? `${colors[i % colors.length]} shadow-[0_0_8px_1.5px]` : 'bg-[#0f172a]'}`}
        />
      ))}
    </div>
  );
}

// Interactive Cockpit Radar Sweep
function SpaceshipRadar() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;
    
    const render = () => {
      ctx.clearRect(0, 0, 200, 200);
      
      // Radar rings
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.arc(100, 100, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(100, 100, 50, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(100, 100, 20, 0, Math.PI * 2);
      ctx.stroke();
      
      // Cross axes
      ctx.beginPath();
      ctx.moveTo(100, 10);
      ctx.lineTo(100, 190);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(10, 100);
      ctx.lineTo(190, 100);
      ctx.stroke();
      
      // Sweep sweep
      angle += 0.016;
      const endX = 100 + 80 * Math.cos(angle);
      const endY = 100 + 80 * Math.sin(angle);
      
      // Tail gradient
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.arc(100, 100, 80, angle - 0.45, angle);
      ctx.lineTo(100, 100);
      const sweepGrad = ctx.createRadialGradient(100, 100, 5, 100, 100, 80);
      sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
      sweepGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.fill();
      ctx.restore();
      
      // Pointer
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(100, 100);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Blips
      ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
      ctx.beginPath();
      ctx.arc(60, 75, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(135, 140, 3.5, 0, Math.PI * 2);
      ctx.fill();
      
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);
  
  return (
    <div className="relative w-[200px] h-[200px] bg-[#04050e]/90 border border-cyan-500/25 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.08)]">
      <canvas ref={canvasRef} width={200} height={200} className="w-[200px] h-[200px]" />
      <div className="absolute top-2 left-2 text-[8px] font-mono text-cyan-400 tracking-wider">HUD_ORBITAL_RADAR</div>
    </div>
  );
}

// Engine Room Pulse Reactor
function SpaceshipReactor({ isHovered, setHovered }) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let angle = 0;
    
    const render = () => {
      ctx.clearRect(0, 0, 240, 240);
      
      // Outer border rings
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(120, 120, 105, 0, Math.PI * 2);
      ctx.stroke();
      
      angle += isHovered ? 0.045 : 0.015;
      
      ctx.save();
      ctx.translate(120, 120);
      ctx.rotate(angle);
      
      // Spokes
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(95, 0);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(0, 240, 255, 0.55)';
        ctx.beginPath();
        ctx.arc(85, 0, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // Core pulsing glow
      const pulseRadius = 38 + 12 * Math.sin(angle * 4.5);
      const coreGrad = ctx.createRadialGradient(120, 120, 0, 120, 120, pulseRadius);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.25, '#00f0ff');
      coreGrad.addColorStop(0.75, '#0055ff');
      coreGrad.addColorStop(1, 'rgba(0, 85, 255, 0)');
      
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(120, 120, pulseRadius, 0, Math.PI * 2);
      ctx.fill();
      
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered]);
  
  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-[240px] h-[240px] bg-[#02030a]/80 border border-cyan-500/25 rounded-full flex items-center justify-center shadow-[0_0_35px_rgba(0,240,255,0.18)] cursor-pointer select-none group"
    >
      <canvas ref={canvasRef} width={240} height={240} className="w-[240px] h-[240px]" />
      <div className="absolute text-[8px] font-mono text-cyan-400 group-hover:text-white transition-colors uppercase tracking-widest text-center mt-3">
        HYPERDRIVE ENGINE CORE<br/>
        <span className="text-[7px] text-cyan-400/50 group-hover:text-cyan-300 font-bold block mt-1">
          {isHovered ? 'CORE_ACTIVE_SPEED: Warp 8' : 'REACTOR_STATUS: Stable'}
        </span>
      </div>
    </div>
  );
}

// Comms Center Transceiver Frequency
function CommsTransceiver() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let ticks = 0;
    
    const render = () => {
      ctx.clearRect(0, 0, 400, 50);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.2;
      
      ctx.beginPath();
      ticks += 0.12;
      
      for (let x = 0; x < 400; x += 3) {
        const angle = (x / 18) + ticks;
        const noise = (Math.random() - 0.5) * 6;
        const y = 25 + 12 * Math.sin(angle) + noise;
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    
    return () => cancelAnimationFrame(animationFrameId);
  }, []);
  
  return (
    <div className="w-full bg-[#030409] border border-cyan-500/15 rounded-xl p-3 flex flex-col gap-2 font-mono">
      <div className="flex justify-between items-center text-[8px] text-cyan-500/50 uppercase tracking-widest">
        <span>Signal Frequency Tracker</span>
        <span className="text-cyan-400 animate-pulse font-bold">LINK_CONNECTED</span>
      </div>
      <canvas ref={canvasRef} width={400} height={50} className="w-full h-[50px] opacity-75" />
    </div>
  );
}

export default function DynamicTheme({ data, onBack }) {
  const style = data.style || {
    colors: ['#a855f7', '#00e5ff'],
    font: 'Outfit',
    glassmorphism: true,
    bgType: 'aurora',
    designSystem: 'reactbits',
    themeMode: 'dark'
  };

  const designSystem = style.designSystem || 'reactbits';
  const themeMode = style.themeMode || 'dark';
  
  // Decoupled component styles with fallback to global designSystem
  const navStyle = style.navbar || designSystem;
  const cardStyle = style.card || designSystem;
  const graphicsStyle = style.graphics || designSystem;
  const animationsStyle = style.animations || designSystem;
  const tokens = style.tokens || {};
  const sectionsList = data.sections || ["hero", "about", "skills", "experience", "projects", "certifications", "contact"];

  // BUG 8 FIX: Normalize key names — handleBrainCompile uses 'skills'/'experience', verifyAndEnhanceData uses 'skl'/'exp'
  if (!data.skl && data.skills) data.skl = data.skills;
  if (!data.exp && data.experience) {
    data.exp = data.experience.map(e => ({
      ...e,
      year: e.year || e.period || '',
      title: e.title || (e.role && e.company ? `${e.role} @ ${e.company}` : e.role || ''),
      desc: e.desc || ''
    }));
  }

  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [isReactorHovered, setReactorHovered] = useState(false);

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollOpacity(Math.min(y / 150, 1));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamically load Fonts from Google Fonts if specified
  useEffect(() => {
    if (!style.font) return;
    const fontId = `google-font-${style.font.toLowerCase().replace(/\s+/g, '-')}`;
    if (document.getElementById(fontId)) return;

    const link = document.createElement('link');
    link.id = fontId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${style.font.replace(/\s+/g, '+')}:wght@300;400;600;800&display=swap`;
    document.head.appendChild(link);
  }, [style.font]);

  // Map font styles
  const fontClass = style.font === 'Space Grotesk' 
    ? 'font-space' 
    : style.font === 'Inter' 
    ? 'font-sans' 
    : style.font === 'Playfair Display' 
    ? 'font-serif' 
    : 'font-outfit';

  // CSS Styling variables based on dynamic settings
  const primaryColor = style.colors?.[0] || '#a855f7';
  const secondaryColor = style.colors?.[1] || '#00e5ff';
  
  // Theme coloring presets
  let bgColor = '#070814';
  let textColor = '#f8fafc';
  let borderColor = 'rgba(255, 255, 255, 0.05)';
  let selectionClass = 'selection:bg-purple-600/30 selection:text-purple-400';
  
  // Default values
  let navClass = 'relative z-30 flex justify-between items-center px-6 md:px-[8%] py-6 border-b border-white/5 bg-[#070814]/20 backdrop-blur-sm sticky top-0';
  let navLinkClass = 'hover:text-white text-gray-400 transition-colors';
  let labelClass = 'text-gray-500';
  let descTextClass = 'text-gray-400';
  let titleTextClass = 'text-white';
  let inputClass = 'bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-gray-600 focus:outline-none w-full';

  // Apply visual style presets
  if (designSystem === 'twenty_one_dev') {
    bgColor = '#030303';
    textColor = primaryColor;
    borderColor = `${primaryColor}20`;
    selectionClass = `selection:bg-[${primaryColor}]/20 selection:text-[${primaryColor}]`;
    inputClass = `bg-black/60 border border-[#00ff66]/20 rounded-lg px-4 py-3.5 text-xs text-[#00ff66] placeholder-[#00ff66]/20 focus:outline-none focus:border-[#00ff66]/50 w-full`;
  } else if (designSystem === 'recent_design') {
    if (themeMode === 'light') {
      bgColor = '#fcfbfa';
      textColor = '#1c1917';
      borderColor = 'rgba(28, 25, 23, 0.08)';
      selectionClass = 'selection:bg-stone-200 selection:text-stone-800';
      labelClass = 'text-stone-500';
      descTextClass = 'text-stone-600';
      titleTextClass = 'text-stone-900';
      inputClass = 'bg-white border border-stone-200 rounded-none px-4 py-3.5 text-xs text-stone-950 placeholder-stone-400 focus:outline-none focus:border-stone-800 w-full';
    } else {
      bgColor = '#0b0a09';
      textColor = '#f3efe6';
      borderColor = 'rgba(243, 239, 230, 0.08)';
      selectionClass = 'selection:bg-stone-850 selection:text-stone-200';
      labelClass = 'text-stone-500';
      descTextClass = 'text-stone-300';
      titleTextClass = 'text-stone-100';
      inputClass = 'bg-[#12100e] border border-stone-800 rounded-none px-4 py-3.5 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-stone-400 w-full';
    }
  } else if (designSystem === 'cofolios') {
    if (themeMode === 'light') {
      bgColor = '#f8fafc';
      textColor = '#0f172a';
      borderColor = 'rgba(15, 23, 42, 0.08)';
      selectionClass = 'selection:bg-blue-100 selection:text-blue-900';
      labelClass = 'text-slate-500';
      descTextClass = 'text-slate-600';
      titleTextClass = 'text-slate-900';
      inputClass = 'bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-full';
    } else {
      bgColor = '#0f172a';
      textColor = '#f8fafc';
      borderColor = 'rgba(248, 250, 252, 0.08)';
      selectionClass = 'selection:bg-blue-600/30 selection:text-blue-400';
      labelClass = 'text-slate-400';
      descTextClass = 'text-slate-400';
      titleTextClass = 'text-white';
      inputClass = 'bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 w-full';
    }
  } else if (designSystem === 'spaceship') {
    bgColor = '#04050e';
    textColor = '#e2e8f0';
    borderColor = 'rgba(0, 240, 255, 0.15)';
    selectionClass = 'selection:bg-cyan-500/25 selection:text-cyan-400';
    labelClass = 'text-cyan-500/60 font-mono text-[9px]';
    descTextClass = 'text-slate-400 font-sans text-xs leading-relaxed';
    titleTextClass = 'text-white font-mono uppercase font-bold';
    inputClass = 'bg-black/60 border border-cyan-500/20 rounded-lg px-4 py-3.5 text-xs text-cyan-300 placeholder-cyan-500/20 focus:outline-none focus:border-cyan-400 w-full font-mono';
  } else if (designSystem === 'synthwave') {
    bgColor = '#120136';
    textColor = '#00f0ff';
    borderColor = 'rgba(255, 0, 127, 0.2)';
    selectionClass = 'selection:bg-pink-500/25 selection:text-pink-400';
    labelClass = 'text-[#ff007f]/85 font-sans uppercase font-bold text-[9px]';
    descTextClass = 'text-slate-300 text-xs';
    titleTextClass = 'text-white font-extrabold tracking-wide uppercase';
    inputClass = 'bg-[#120136] border border-[#ff007f]/30 rounded-xl px-4 py-3.5 text-xs text-[#00f0ff] focus:border-[#00f0ff] w-full';
  } else if (designSystem === 'cyberpunk') {
    bgColor = '#0a0a0c';
    textColor = '#ffe600';
    borderColor = '#ffe600';
    selectionClass = 'selection:bg-yellow-500/20 selection:text-yellow-400';
    labelClass = 'text-[#ffe600]/60 font-mono text-[9px]';
    descTextClass = 'text-gray-300 font-mono text-xs';
    titleTextClass = 'text-white font-black uppercase tracking-widest';
    inputClass = 'bg-[#0a0a0c] border-2 border-[#ffe600] rounded-none px-4 py-3.5 text-xs text-[#ffe600] focus:border-[#ff0055] w-full font-mono';
  } else if (designSystem === 'forest_luxury') {
    bgColor = '#022c22';
    textColor = '#f5f5f4';
    borderColor = 'rgba(212, 175, 55, 0.2)';
    selectionClass = 'selection:bg-emerald-800/30 selection:text-emerald-300';
    labelClass = 'text-stone-400 text-[10px] uppercase font-serif';
    descTextClass = 'text-stone-300 font-serif leading-relaxed';
    titleTextClass = 'text-[#d4af37] font-serif uppercase tracking-wider';
    inputClass = 'bg-stone-900 border border-[#d4af37]/30 rounded-none px-4 py-3.5 text-xs text-stone-200 focus:border-[#d4af37] w-full';
  }

  // Override colors & styles if custom tokens exist
  if (tokens["--bg-primary"]) bgColor = tokens["--bg-primary"];
  if (tokens["--text-primary"]) textColor = tokens["--text-primary"];
  if (tokens["--border-primary"]) borderColor = tokens["--border-primary"];

  // Component level navClass & navLinkClass mappings
  if (navStyle === 'twenty_one_dev' || navStyle === 'terminal') {
    navClass = `relative z-30 flex justify-between items-center px-6 md:px-[8%] py-6 border-b border-[${primaryColor}]/10 bg-[#030303]/40 backdrop-blur-sm sticky top-0 font-mono`;
    navLinkClass = 'hover:text-white text-gray-500 transition-colors';
  } else if (navStyle === 'recent_design' || navStyle === 'editorial') {
    navClass = themeMode === 'light'
      ? 'relative z-30 flex justify-between items-center px-6 md:px-[8%] py-6 border-b border-stone-200/50 bg-[#fcfbfa]/40 backdrop-blur-sm sticky top-0 font-serif'
      : 'relative z-30 flex justify-between items-center px-6 md:px-[8%] py-6 border-b border-stone-800 bg-[#0b0a09]/40 backdrop-blur-sm sticky top-0 font-serif';
    navLinkClass = themeMode === 'light' ? 'hover:text-stone-950 text-stone-500 transition-colors' : 'hover:text-white text-stone-400 transition-colors';
  } else if (navStyle === 'cofolios' || navStyle === 'minimalist') {
    navClass = themeMode === 'light'
      ? 'relative z-30 flex justify-between items-center px-6 md:px-[8%] py-6 border-b border-slate-200 bg-white/40 backdrop-blur-sm sticky top-0 font-sans'
      : 'relative z-30 flex justify-between items-center px-6 md:px-[8%] py-6 border-b border-slate-800 bg-[#0f172a]/40 backdrop-blur-sm sticky top-0 font-sans';
    navLinkClass = themeMode === 'light' ? 'hover:text-blue-600 text-slate-500 transition-colors' : 'hover:text-white text-slate-400 transition-colors';
  } else if (navStyle === 'spaceship') {
    navClass = 'relative z-30 flex justify-between items-center px-6 md:px-[8%] py-6 border-b border-cyan-500/10 bg-[#04050e]/60 backdrop-blur-md sticky top-0 font-mono';
    navLinkClass = 'hover:text-cyan-400 text-slate-400 transition-colors font-mono tracking-widest uppercase';
  } else if (navStyle === 'synthwave') {
    navClass = 'relative z-30 flex justify-between items-center px-6 md:px-[8%] py-6 border-b border-[#ff007f]/20 bg-[#120136]/50 backdrop-blur-md sticky top-0 font-sans';
    navLinkClass = 'hover:text-[#ff007f] text-slate-400 transition-colors tracking-wide';
  } else if (navStyle === 'cyberpunk') {
    navClass = 'relative z-30 flex justify-between items-center px-6 md:px-[8%] py-6 border-b-2 border-[#ffe600] bg-[#0a0a0c] sticky top-0 font-mono';
    navLinkClass = 'hover:text-[#ff0055] text-[#ffe600] transition-colors uppercase font-bold';
  } else if (navStyle === 'forest_luxury') {
    navClass = 'relative z-30 flex justify-between items-center px-6 md:px-[8%] py-6 border-b border-[#d4af37]/20 bg-[#022c22]/60 backdrop-blur-md sticky top-0 font-serif';
    navLinkClass = 'hover:text-[#d4af37] text-stone-300 transition-colors';
  }

  // Component level card rendering glassClass mapping
  let glassClass = style.glassmorphism 
    ? 'backdrop-blur-xl bg-white/[0.03] border border-white/10 shadow-[0_8px_32px_0_rgba(255,255,255,0.02)] rounded-3xl' 
    : 'bg-[#0f112a] border border-white/5 rounded-3xl';

  if (cardStyle === 'spaceship') {
    glassClass = 'bg-black/75 border border-cyan-500/25 shadow-[0_0_20px_rgba(0,240,255,0.06)] rounded-lg font-mono';
  } else if (cardStyle === 'twenty_one_dev' || cardStyle === 'terminal') {
    glassClass = 'bg-[#04050e] border border-[#00ff66]/20 shadow-[0_0_15px_rgba(0,255,102,0.05)] rounded-lg font-mono';
  } else if (cardStyle === 'recent_design' || cardStyle === 'editorial') {
    glassClass = themeMode === 'light'
      ? 'bg-stone-100/50 border border-stone-200/80 rounded-none'
      : 'bg-[#0a0b16] border border-white/5 rounded-none';
  } else if (cardStyle === 'cofolios' || cardStyle === 'minimalist') {
    glassClass = themeMode === 'light'
      ? 'bg-white border border-slate-200/80 shadow-sm hover:border-slate-300 rounded-2xl'
      : 'bg-white/[0.01] border border-white/10 shadow-sm hover:border-white/20 rounded-2xl';
  } else if (cardStyle === 'synthwave') {
    glassClass = 'bg-[#120136]/85 border border-[#ff007f]/30 shadow-[0_0_20px_rgba(255,0,127,0.15)] rounded-xl';
  } else if (cardStyle === 'cyberpunk') {
    glassClass = 'bg-[#0a0a0c]/95 border-2 border-r-[6px] border-b-[6px] border-[#ffe600] rounded-sm font-mono';
  } else if (cardStyle === 'forest_luxury') {
    glassClass = 'bg-[#022c22]/80 border border-[#d4af37]/20 shadow-[0_4px_30px_rgba(0,0,0,0.4)] rounded-none';
  }

  const projectsList = data.projects || [
    {
      title: "Quantum Analytics",
      desc: "Real-time WebGL data visualization platform monitoring cloud architecture telemetry logs dynamically.",
      tech: ["React", "WebGL", "Three.js"],
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Nebula Commerce",
      desc: "A premium glassmorphic headless storefront with 3D product preview orbitals and frictionless checkouts.",
      tech: ["Next.js", "GraphQL", "Tailwind CSS"],
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Pulse Systems AI",
      desc: "Autonomous cluster reliability framework tracking infrastructure anomalies with modular alert triggers.",
      tech: ["Python", "Docker", "Kubernetes"],
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const certificationsList = data.certifications || [];

  // Dynamic menu filtration
  const navLinks = sectionsList.filter(s => s !== 'hero' && s !== 'contact');

  // Custom visual section headers
  const renderSectionHeader = (subtitle, sectionKey, defaultText) => {
    const titleText = data.sectionNames?.[sectionKey] || defaultText;
    if (graphicsStyle === 'spaceship') {
      return (
        <div className="mb-12 font-mono text-left relative">
          <div className="text-[9px] text-cyan-400/60 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>{subtitle} // ROOM_{sectionKey.toUpperCase()}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mt-1 border-b border-cyan-500/20 pb-2.5 flex justify-between items-center">
            <span>{titleText}</span>
            <span className="text-[8px] text-cyan-400/35 font-bold font-mono">SYS_ONLINE</span>
          </h2>
        </div>
      );
    }
    if (cardStyle === 'twenty_one_dev' || cardStyle === 'terminal') {
      return (
        <div className="mb-12 font-mono text-left">
          <div className="text-[11px] opacity-50">{'/*'} {subtitle} {'*/'}</div>
          <div className="text-xl md:text-2xl font-bold uppercase tracking-tight mt-1" style={{ color: primaryColor }}>
            {'>'} {titleText}_
          </div>
          <div className="text-[10px] opacity-20 mt-1">=============================================</div>
        </div>
      );
    }
    if (cardStyle === 'recent_design' || cardStyle === 'editorial') {
      return (
        <div className="mb-16 text-left font-serif">
          <span className="text-xs uppercase tracking-widest text-gray-500 italic block mb-2">{subtitle}</span>
          <h2 className="text-4xl md:text-5xl font-light tracking-wide border-b pb-4" style={{ borderColor: borderColor, color: titleTextClass }}>
            {titleText}
          </h2>
        </div>
      );
    }
    if (cardStyle === 'cofolios' || cardStyle === 'minimalist') {
      return (
        <div className="mb-10 text-left border-l-4 pl-4" style={{ borderColor: primaryColor }}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">{subtitle}</span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: titleTextClass }}>
            {titleText}
          </h2>
        </div>
      );
    }
    return (
      <div className="mb-12">
        <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>{subtitle}</span>
        <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight mt-2" style={{ color: titleTextClass }}>{titleText}</h2>
      </div>
    );
  };

  // Nav Logo configuration
  let navLogo = (
    <div className="flex items-center gap-3">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
      >
        <i className="fa-solid fa-cube text-xs text-white"></i>
      </div>
      <span className="font-extrabold text-md tracking-wider uppercase" style={{ color: titleTextClass }}>
        {data.n.split(' ')[0]}.<span style={{ color: secondaryColor }}>dev</span>
      </span>
    </div>
  );

  if (navStyle === 'twenty_one_dev' || navStyle === 'terminal') {
    navLogo = (
      <div className="flex items-center gap-2 font-mono text-xs">
        <span className="opacity-60" style={{ color: primaryColor }}>guest@</span>
        <span className="font-bold text-white">{data.n.toLowerCase().replace(/[^a-z0-9]+/g, '-')}:~$</span>
      </div>
    );
  } else if (navStyle === 'recent_design' || navStyle === 'editorial' || navStyle === 'forest_luxury') {
    navLogo = (
      <div className="flex items-center gap-2 font-serif">
        <span className="text-lg tracking-widest uppercase font-light" style={{ color: titleTextClass }}>
          {data.n.split(' ').map(n => n[0]).join('. ')}.
        </span>
      </div>
    );
  } else if (navStyle === 'cofolios' || navStyle === 'minimalist') {
    navLogo = (
      <div className="flex items-center gap-2 font-sans">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
        <span className="font-bold text-sm tracking-tight" style={{ color: titleTextClass }}>{data.n}</span>
      </div>
    );
  } else if (navStyle === 'spaceship') {
    navLogo = (
      <div className="flex items-center gap-2.5 font-mono">
        <div className="w-7 h-7 rounded bg-[#0b1626] border border-cyan-500/30 flex items-center justify-center text-cyan-400 animate-pulse">
          <i className="fa-solid fa-satellite text-xs"></i>
        </div>
        <div className="text-left leading-none">
          <span className="font-black text-[11px] tracking-widest text-white uppercase block mb-0.5">
            {data.n.toUpperCase()}
          </span>
          <span className="text-[7px] text-cyan-400/50 uppercase tracking-widest font-extrabold font-mono">
            {data.t}
          </span>
        </div>
      </div>
    );
  }

  // Hero Heading gradient text setup
  const headingTextClass = themeMode === 'light'
    ? 'bg-gradient-to-b from-black via-stone-800 to-stone-500 bg-clip-text text-transparent'
    : 'bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent';

  return (
    <div 
      className={`${fontClass} min-h-screen overflow-x-hidden relative ${selectionClass}`}
      style={{
        fontFamily: style.font ? `'${style.font}', sans-serif` : undefined,
        backgroundColor: bgColor,
        color: textColor
      }}
    >
      {/* BACKGROUND SELECTION */}
      {style.bgType === 'spaceship_space' && (
        <SpaceshipSpaceBackground />
      )}

      {style.bgType === 'aurora' && (
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none w-full h-full">
          <Aurora colorStops={[primaryColor, secondaryColor, themeMode === 'light' ? '#ffffff' : '#000000']} blend={0.6} amplitude={1.2} speed={0.3} />
        </div>
      )}

      {style.bgType === 'particles' && (
        <CanvasParticles colors={[primaryColor, secondaryColor]} />
      )}

      {style.bgType === 'fluid' && (
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none opacity-45">
          <Ferrofluid
            colors={[primaryColor, secondaryColor, bgColor]}
            backgroundColor={bgColor}
            speed={0.06}
            scale={1.2}
            turbulence={1.0}
            fluidity={0.2}
            rimWidth={0.2}
            sharpness={2.5}
            shimmer={1.0}
            glow={2.0}
            flowDirection="down"
            opacity={0.7}
            mouseInteraction={true}
            mouseStrength={1.0}
            mouseRadius={0.3}
          />
        </div>
      )}

      {style.bgType === 'grid' && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-10" 
          style={{
            backgroundImage: `linear-gradient(to right, ${themeMode === 'light' ? '#000' : '#808080'} 1px, transparent 1px), linear-gradient(to bottom, ${themeMode === 'light' ? '#000' : '#808080'} 1px, transparent 1px)`,
            backgroundSize: '14px 24px'
          }}
        />
      )}

      {style.bgType === 'retro_wave' && (
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#120136]">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(255, 0, 127, 0.3) 100%), linear-gradient(to right, rgba(255, 0, 127, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 0, 127, 0.15) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 40px 40px, 40px 40px',
            transform: 'perspective(500px) rotateX(60deg) translateY(-30%)',
            transformOrigin: 'top center',
            height: '150%'
          }} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-t from-[#ff007f] to-transparent opacity-20 blur-3xl" />
        </div>
      )}

      {/* Floating Back to Editor button */}
      {isPreviewMode && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-5 py-3 bg-[#0d0e22]/90 hover:bg-[#070814] border border-white/10 hover:border-purple-500/50 rounded-full text-xs text-white uppercase tracking-wider font-extrabold shadow-2xl backdrop-blur-md transition-all active:scale-95"
          >
            <i className="fa-solid fa-arrow-left text-purple-400"></i>
            Edit Details
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className={navClass}>
        {navLogo}
        
        <div className="hidden md:flex gap-8 text-xs font-semibold uppercase tracking-widest">
          {navLinks.map((link) => (
            <a key={link} href={`#${link}`} className={navLinkClass}>
              {data.sectionNames?.[link] || link}
            </a>
          ))}
          {sectionsList.includes('contact') && (
            <a href="#contact" className={navLinkClass}>
              {data.sectionNames?.["contact"] || "Contact"}
            </a>
          )}
        </div>

        <a
          href="#contact"
          className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border`}
          style={{
            borderColor: `${primaryColor}30`,
            boxShadow: `0 0 10px ${primaryColor}10`,
            color: textColor
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = primaryColor;
            e.currentTarget.style.boxShadow = `0 0 20px ${primaryColor}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${primaryColor}30`;
            e.currentTarget.style.boxShadow = `0 0 10px ${primaryColor}10`;
          }}
        >
          Hire Me
        </a>
      </nav>

      {/* Render sections dynamically */}
      {sectionsList.map((section, idx) => {
        if (section === 'hero') {
          if (graphicsStyle === 'spaceship') {
            return (
              <main key={`hero-${idx}`} className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-28 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center min-h-[85vh]">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6 text-left relative p-8 border border-cyan-500/20 bg-black/75 rounded-2xl font-mono shadow-[0_0_30px_rgba(0,240,255,0.08)] animate-pulse-subtle"
                >
                  {/* Decorative Cockpit corner brackets */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                  
                  <div className="flex justify-between items-center border-b border-cyan-500/10 pb-3 mb-4">
                    <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">COCKPIT_MAIN_CONSOLE</span>
                    <BlinkingLights count={4} />
                  </div>

                  <div className="space-y-2">
                    <span className="text-[8px] text-cyan-500/50 uppercase tracking-widest block font-bold leading-none">PRIMARY_NODE_IDENT</span>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-none">
                      {data.n}
                    </h1>
                  </div>

                  <div className="space-y-2 border-l-2 border-cyan-500/30 pl-4 py-1">
                    <span className="text-[8px] text-cyan-500/50 uppercase tracking-widest block font-bold leading-none">ASSIGNED_RANK_ROLE</span>
                    <p className="text-cyan-300 font-bold text-sm tracking-wider uppercase">{data.t}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[8px] text-cyan-500/50 uppercase tracking-widest block font-bold leading-none">MISSION_OBJECTIVES_BIO</span>
                    <p className="text-slate-350 text-xs leading-relaxed max-w-xl font-normal font-sans">
                      {data.bio}
                    </p>
                  </div>

                  {/* Flight Telemetry Logs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#030409]/60 border border-cyan-500/10 rounded-lg p-3 text-[8px] tracking-wider text-cyan-400/80">
                    <div>
                      <span className="text-cyan-500/40 block">WARP_FACTOR</span>
                      <span className="font-bold">Warp 6.4 (Active)</span>
                    </div>
                    <div>
                      <span className="text-cyan-500/40 block">COORD_SECTOR</span>
                      <span className="font-bold">Delta-09 Sector</span>
                    </div>
                    <div>
                      <span className="text-cyan-500/40 block">SHIELDS_POWER</span>
                      <span className="font-bold text-green-400">100% (Normal)</span>
                    </div>
                    <div>
                      <span className="text-cyan-500/40 block">ORBIT_ALTITUDE</span>
                      <span className="font-bold">248,192 KM</span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <a
                      href="#projects"
                      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider rounded border border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] active:scale-95"
                    >
                      access_research_lab.cmd
                    </a>
                    <a
                      href="#contact"
                      className="px-6 py-3 border border-cyan-500/30 hover:border-cyan-400 bg-white/5 text-cyan-400 font-bold text-xs uppercase tracking-wider rounded transition-all active:scale-95"
                    >
                      comms_link.sh
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="flex justify-center items-center"
                >
                  <div className="flex flex-col gap-6 items-center">
                    <SpaceshipRadar />
                    {/* Simulated vector compass */}
                    <div className="w-[200px] bg-[#020308] border border-cyan-500/10 rounded p-2.5 font-mono text-[8px] text-cyan-400/50 text-left space-y-1">
                      <div className="flex justify-between">
                        <span>PITCH: +12.4°</span>
                        <span>YAW: -4.8°</span>
                      </div>
                      <div className="w-full bg-cyan-950 h-1 rounded overflow-hidden">
                        <div className="w-2/3 bg-cyan-400 h-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </main>
            );
          }

          return (
            <main key={`hero-${idx}`} className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-28 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center min-h-[85vh]">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="space-y-6 text-left"
              >
                <div 
                  className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase w-fit"
                  style={{ 
                    backgroundColor: `${primaryColor}15`, 
                    color: secondaryColor,
                    border: `1px solid ${primaryColor}30` 
                  }}
                >
                  {data.t}
                </div>
                
                <h1 className={`text-5xl md:text-7xl font-extrabold tracking-tighter leading-none uppercase ${headingTextClass}`}>
                  {data.n}
                </h1>

                <p className={`${descTextClass} text-base md:text-lg leading-relaxed max-w-xl font-light`}>
                  {data.bio}
                </p>

                <div className="flex gap-4 pt-4">
                  {designSystem === 'twenty_one_dev' ? (
                    <a
                      href="#projects"
                      className="px-6 py-3 border text-xs font-mono font-bold uppercase tracking-wider transition-all"
                      style={{
                        borderColor: primaryColor,
                        color: primaryColor,
                        boxShadow: `0 0 10px ${primaryColor}15`
                      }}
                    >
                      cat projects.log
                    </a>
                  ) : designSystem === 'recent_design' ? (
                    <a
                      href="#projects"
                      className="px-8 py-3.5 text-xs font-serif tracking-widest border uppercase hover:bg-stone-900 hover:text-white transition-all duration-300 rounded-none"
                      style={{
                        borderColor: themeMode === 'light' ? '#1c1917' : '#f3efe6',
                        color: textColor
                      }}
                    >
                      View Portfolio
                    </a>
                  ) : (
                    <a
                      href="#projects"
                      className="px-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-full shadow-lg transition-all active:scale-95 text-black hover:opacity-90"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                        boxShadow: `0 10px 25px ${primaryColor}25`
                      }}
                    >
                      Explore Projects
                    </a>
                  )}

                  <a
                    href="#contact"
                    className={`px-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-none md:rounded-full border transition-all active:scale-95 bg-white/5 backdrop-blur`}
                    style={{
                      borderColor: borderColor,
                      color: textColor
                    }}
                  >
                    Contact Me
                  </a>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="flex justify-center items-center"
              >
                {designSystem === 'twenty_one_dev' ? (
                  <TerminalConsole 
                    name={data.n} 
                    title={data.t} 
                    bio={data.bio} 
                    primaryColor={primaryColor} 
                    secondaryColor={secondaryColor} 
                  />
                ) : (
                  <div className="relative group p-8 rounded-full">
                    <div 
                      className="absolute inset-0 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"
                      style={{ background: `radial-gradient(circle, ${primaryColor}, ${secondaryColor})` }}
                    />
                    <Canvas3DObject colors={[secondaryColor, primaryColor]} designSystem={designSystem} />
                  </div>
                )}
              </motion.div>
            </main>
          );
        }

        if (section === 'about') {
          return (
            <section key={`about-${idx}`} id="about" className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t" style={{ borderColor: borderColor }}>
              <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>About Me</span>
                  <h2 className={`text-3xl md:text-4xl font-extrabold uppercase tracking-tight mt-2 ${fontClass === 'font-serif' ? 'font-serif font-light' : ''}`} style={{ color: titleTextClass }}>Philosophy</h2>
                </div>
                <div className={`${descTextClass} space-y-6 text-sm md:text-base leading-relaxed font-light`}>
                  <p>
                    {data.bio || 'A passionate professional dedicated to delivering high-quality work and meaningful outcomes.'}
                  </p>
                </div>
              </div>
            </section>
          );
        }

        if (section === 'skills') {
          if (graphicsStyle === 'spaceship') {
            return (
              <section key={`skills-${idx}`} id="skills" className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t font-mono" style={{ borderColor: borderColor }}>
                {renderSectionHeader("Capabilities", "skills", "Technical Stack")}
                
                <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 items-center">
                  <div className="flex flex-col items-center gap-4">
                    <SpaceshipReactor isHovered={isReactorHovered} setHovered={setReactorHovered} />
                    <div className="text-[9px] font-mono text-cyan-400/50 uppercase tracking-widest animate-pulse font-bold">
                      HOVER REACTOR TO CHARGE CORE
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {data.skl.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ 
                          y: -3, 
                          borderColor: '#00f0ff',
                          boxShadow: '0 8px 20px rgba(0,240,255,0.12)'
                        }}
                        className={`p-5 rounded border border-cyan-500/20 bg-[#020309]/80 flex flex-col justify-center items-center text-center gap-2.5 font-mono`}
                      >
                        <div 
                          className="w-8 h-8 rounded bg-[#0b1626] border border-cyan-500/25 flex items-center justify-center"
                        >
                          <i className={`fa-solid fa-microchip text-xs text-cyan-400`} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-wider text-white">{skill}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          return (
            <section key={`skills-${idx}`} id="skills" className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t" style={{ borderColor: borderColor }}>
              {renderSectionHeader("Capabilities", "skills", "Technical Stack")}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {data.skl.map((skill, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ 
                      y: -4, 
                      borderColor: secondaryColor,
                      boxShadow: `0 8px 25px ${secondaryColor}10`
                    }}
                    className={`p-6 rounded-2xl transition-all duration-300 ${glassClass} flex flex-col justify-center items-center text-center gap-3`}
                  >
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${secondaryColor}10` }}
                    >
                      <i className={`fa-solid fa-code text-sm`} style={{ color: secondaryColor }} />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: titleTextClass }}>{skill}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        }

        if (section === 'experience') {
          if (cardStyle === 'spaceship') {
            return (
              <section key={`experience-${idx}`} id="experience" className="relative z-10 max-w-4xl mx-auto px-6 py-24 border-t font-mono" style={{ borderColor: borderColor }}>
                <div className="mb-16 text-left relative p-6 border border-cyan-500/20 bg-black/60 rounded-xl">
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
                  <span className="text-[9px] text-cyan-550 uppercase tracking-widest block font-bold leading-none mb-1">ARCHIVE_HEADER</span>
                  <h2 className="text-xl md:text-2xl font-black uppercase text-white tracking-widest">{data.sectionNames?.["experience"] || "Mission Logs"}</h2>
                </div>

                <div className="relative border-l border-cyan-500/20 pl-8 ml-4 space-y-12">
                  {data.exp.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="relative border border-cyan-500/10 hover:border-cyan-500/30 bg-black/40 rounded-xl p-5"
                    >
                      <div 
                        className="absolute -left-[41px] top-5 w-3.5 h-3.5 rounded-full border-4 transition-all"
                        style={{ 
                          backgroundColor: '#00f0ff',
                          boxShadow: '0 0 10px #00f0ff',
                          borderColor: bgColor
                        }}
                      />
                      
                      <div 
                        className="text-[9px] font-bold uppercase tracking-widest mb-1 text-cyan-400"
                      >
                        LOG_ENTRY // YEAR_{(item.year || item.period || '').toUpperCase().replace(/\s+/g, '')}
                      </div>
                      <h4 className="text-md font-bold mb-2 text-white uppercase">{item.title}</h4>
                      <p className="text-slate-350 text-xs leading-relaxed font-sans">{item.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          }

          return (
            <section key={`experience-${idx}`} id="experience" className="relative z-10 max-w-4xl mx-auto px-6 py-24 border-t" style={{ borderColor: borderColor }}>
              <div className="mb-16 text-center">
                <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: primaryColor }}>{data.sectionNames?.["experience"] || "Journey"}</span>
                <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight mt-2" style={{ color: titleTextClass }}>{data.sectionNames?.["experience"] || "Timeline Milestones"}</h2>
              </div>

              <div className="relative border-l border-white/10 pl-8 ml-4 space-y-12" style={{ borderColor: borderColor }}>
                {data.exp.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                    <div 
                      className="absolute -left-[38px] top-1.5 w-4 h-4 rounded-full border-4 transition-all"
                      style={{ 
                        backgroundColor: index === 0 ? secondaryColor : primaryColor,
                        boxShadow: `0 0 10px ${index === 0 ? secondaryColor : primaryColor}`,
                        borderColor: bgColor
                      }}
                    />
                    
                    <div 
                      className="text-[10px] font-extrabold uppercase tracking-widest mb-1.5"
                      style={{ color: index === 0 ? secondaryColor : primaryColor }}
                    >
                      {item.year || item.period}
                    </div>
                    <h4 className="text-lg font-extrabold mb-2" style={{ color: titleTextClass }}>{item.title}</h4>
                    <p className={`${descTextClass} text-xs leading-relaxed font-light`}>{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          );
        }

        if (section === 'projects') {
          return (
            <section key={`projects-${idx}`} id="projects" className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t font-mono" style={{ borderColor: borderColor }}>
              {renderSectionHeader("Selected Work", "projects", "Interactive Projects")}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {projectsList.map((proj, projIdx) => (
                  <TiltCard 
                    key={projIdx}
                    className={`overflow-hidden group ${glassClass}`}
                  >
                    {cardStyle === 'spaceship' ? (
                      <div className="p-6 font-mono text-left space-y-4 relative bg-[#020308]/90 border border-cyan-500/25 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.05)] hover:border-cyan-400 min-h-[220px] flex flex-col justify-between">
                        {/* Brackets */}
                        <div className="absolute top-2 right-3 text-[8px] text-cyan-400/40">
                          [ANALYSIS_ON]
                        </div>
                        <div className="space-y-3">
                          <div className="text-[9px] text-cyan-500/60 uppercase">{'// LAB_ITEM_'}0{projIdx + 1}</div>
                          <h4 className="text-base font-bold uppercase tracking-wider text-white border-b border-cyan-500/10 pb-2">{proj.title}</h4>
                          <p className="text-[11px] leading-relaxed text-slate-350 font-sans">{proj.desc}</p>
                        </div>
                        <div className="flex gap-1.5 flex-wrap pt-2 border-t border-cyan-500/10">
                          {proj.tech && proj.tech.map((t, i) => (
                            <span 
                              key={i} 
                              className="text-[8px] font-bold px-2 py-0.5 border border-cyan-500/20 text-cyan-400 rounded bg-cyan-950/20"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        {proj.link && (
                          <a
                            href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-[9px] font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square text-[8px]" />
                            View Project
                          </a>
                        )}
                      </div>
                    ) : designSystem === 'twenty_one_dev' ? (
                      <div className="p-6 font-mono text-left space-y-4">
                        <div className="text-[10px] opacity-40">{'[FILE]'} {proj.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.log</div>
                        <h4 className="text-base font-bold uppercase tracking-wider text-white">{proj.title}</h4>
                        <p className="text-xs leading-relaxed" style={{ color: primaryColor }}>{proj.desc}</p>
                        <div className="flex gap-2 flex-wrap pt-2">
                          {proj.tech && proj.tech.map((t, i) => (
                            <span 
                              key={i} 
                              className="text-[9px] font-bold px-2 py-0.5 border"
                              style={{ 
                                borderColor: `${primaryColor}50`, 
                                color: primaryColor 
                              }}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                        {proj.link && (
                          <a
                            href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-[9px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
                            style={{ color: primaryColor }}
                          >
                            <i className="fa-solid fa-arrow-up-right-from-square text-[8px]" />
                            View Project
                          </a>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="h-44 overflow-hidden relative">
                          <img
                            src={proj.img || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"}
                            alt={proj.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </div>
                        <div className="p-6 space-y-4">
                          <h4 className="text-md font-bold uppercase tracking-wider" style={{ color: titleTextClass }}>{proj.title}</h4>
                          <p className={`${descTextClass} text-xs leading-relaxed font-light`}>{proj.desc}</p>
                          <div className="flex gap-2 flex-wrap pt-2">
                            {proj.tech && proj.tech.map((t, i) => (
                              <span 
                                key={i} 
                                className="text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full"
                                style={{ 
                                  backgroundColor: `${secondaryColor}10`, 
                                  color: secondaryColor,
                                  border: `1px solid ${secondaryColor}20`
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                          {proj.link && (
                            <a
                              href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 mt-3 text-[9px] font-extrabold uppercase tracking-wider hover:opacity-80 transition-opacity"
                              style={{ color: secondaryColor }}
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-[8px]" />
                              View Project
                            </a>
                          )}
                        </div>
                      </>
                    )}
                  </TiltCard>
                ))}
              </div>
            </section>
          );
        }

        if (section === 'certifications' && certificationsList && certificationsList.length > 0) {
          return (
            <section key={`certifications-${idx}`} id="certifications" className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t" style={{ borderColor: borderColor }}>
              {renderSectionHeader("Credentials", "certifications", "Certifications")}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificationsList.map((cert, i) => (
                  <div 
                    key={i} 
                    className={`p-6 flex items-center justify-between gap-4 ${glassClass}`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: titleTextClass }}>{cert.title}</h4>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{cert.issuer} · {cert.date}</p>
                    </div>
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                    >
                      <i className="fa-solid fa-award text-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        if (section === 'contact') {
          if (graphicsStyle === 'spaceship') {
            return (
              <section key={`contact-${idx}`} id="contact" className="relative z-10 max-w-xl mx-auto px-6 py-24 border-t font-mono" style={{ borderColor: borderColor }}>
                <div className="text-center mb-12">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">Collaborate // COMMS</span>
                  <h2 className="text-3xl font-black uppercase text-white tracking-widest mt-2">{data.sectionNames?.["contact"] || "Communication Center"}</h2>
                  <p className="text-slate-400 text-xs mt-3 font-light font-sans">
                    Transmit a quantum packet message to review projects or collaborate.
                  </p>
                </div>

                <div className="space-y-6">
                  <CommsTransceiver />

                  {data.contact?.email ? (
                    <div className={`p-8 rounded-xl space-y-6 bg-black/80 border border-cyan-500/25 shadow-[0_0_30px_rgba(0,240,255,0.05)]`}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                            <i className="fa-solid fa-envelope text-cyan-400 text-sm" />
                          </div>
                          <div>
                            <div className="text-[8px] font-bold uppercase tracking-widest text-cyan-500/50">EMAIL_ADDR</div>
                            <a href={`mailto:${data.contact.email}`} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono">{data.contact.email}</a>
                          </div>
                        </div>
                        {data.contact?.github && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                              <i className="fa-brands fa-github text-cyan-400 text-sm" />
                            </div>
                            <div>
                              <div className="text-[8px] font-bold uppercase tracking-widest text-cyan-500/50">GIT_REMOTE</div>
                              <a href={data.contact.github.startsWith('http') ? data.contact.github : `https://github.com/${data.contact.github}`} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono">{data.contact.github}</a>
                            </div>
                          </div>
                        )}
                        {data.contact?.linkedin && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
                              <i className="fa-brands fa-linkedin-in text-cyan-400 text-sm" />
                            </div>
                            <div>
                              <div className="text-[8px] font-bold uppercase tracking-widest text-cyan-500/50">LINK_NETWORK</div>
                              <a href={data.contact.linkedin.startsWith('http') ? data.contact.linkedin : `https://linkedin.com/in/${data.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-mono">{data.contact.linkedin}</a>
                            </div>
                          </div>
                        )}
                      </div>
                      <a
                        href={`mailto:${data.contact.email}`}
                        className="block w-full py-4 text-xs font-bold uppercase tracking-wider rounded border border-cyan-400 bg-cyan-600 hover:bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all active:scale-[0.99] text-center"
                      >
                        Send Email Message
                      </a>
                    </div>
                  ) : (
                    <div className={`p-8 rounded-xl space-y-4 bg-black/80 border border-cyan-500/25 text-center`}>
                      <i className="fa-solid fa-satellite-dish text-3xl text-cyan-400/40" />
                      <p className="text-xs text-cyan-400/60 font-mono">NO_CONTACT_DATA_CONFIGURED</p>
                    </div>
                  )}
                </div>
              </section>
            );
          }

          return (
            <section key={`contact-${idx}`} id="contact" className="relative z-10 max-w-xl mx-auto px-6 py-24 border-t" style={{ borderColor: borderColor }}>
              <div className="text-center mb-12">
                <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: secondaryColor }}>{data.sectionNames?.["contact"] || "Collaborate"}</span>
                <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight mt-2" style={{ color: titleTextClass }}>{data.sectionNames?.["contact"] || "Let's Connect"}</h2>
                <p className={`${descTextClass} text-xs mt-3 font-light`}>
                  Drop me a message to review project scopes, pipeline architectures, or creative briefs.
                </p>
              </div>

              <div className={`p-8 rounded-3xl space-y-6 ${glassClass}`}>
                {data.contact?.email && (
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <i className="fa-solid fa-envelope" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <div className={`text-[9px] font-bold uppercase tracking-widest ${labelClass}`}>Email</div>
                      <a href={`mailto:${data.contact.email}`} className="text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: titleTextClass }}>{data.contact.email}</a>
                    </div>
                  </div>
                )}
                {data.contact?.github && (
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${secondaryColor}15` }}
                    >
                      <i className="fa-brands fa-github" style={{ color: secondaryColor }} />
                    </div>
                    <div>
                      <div className={`text-[9px] font-bold uppercase tracking-widest ${labelClass}`}>GitHub</div>
                      <a href={data.contact.github.startsWith('http') ? data.contact.github : `https://github.com/${data.contact.github}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: titleTextClass }}>{data.contact.github}</a>
                    </div>
                  </div>
                )}
                {data.contact?.linkedin && (
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <i className="fa-brands fa-linkedin-in" style={{ color: primaryColor }} />
                    </div>
                    <div>
                      <div className={`text-[9px] font-bold uppercase tracking-widest ${labelClass}`}>LinkedIn</div>
                      <a href={data.contact.linkedin.startsWith('http') ? data.contact.linkedin : `https://linkedin.com/in/${data.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:opacity-80 transition-opacity" style={{ color: titleTextClass }}>{data.contact.linkedin}</a>
                    </div>
                  </div>
                )}
                {data.contact?.email && (
                  <a
                    href={`mailto:${data.contact.email}`}
                    className="block w-full py-4 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md text-black hover:opacity-90 active:scale-[0.99] text-center"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                      boxShadow: `0 8px 20px ${primaryColor}20`
                    }}
                  >
                    Send Email
                  </a>
                )}
                {!data.contact?.email && !data.contact?.github && !data.contact?.linkedin && (
                  <div className="text-center py-8">
                    <i className={`fa-solid fa-address-card text-3xl mb-3 ${descTextClass}`} />
                    <p className={`text-xs ${descTextClass}`}>No contact information provided.</p>
                  </div>
                )}
              </div>
            </section>
          );
        }
        return null;
      })}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-[8%] text-center text-xs text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-6 max-w-6xl mx-auto" style={{ borderColor: borderColor }}>
        <div>© 2026 {data.n} — Dynamic Website Compiler.</div>
        <div className="flex gap-6 text-sm">
          {data.contact?.github && (
            <a href={data.contact.github.startsWith('http') ? data.contact.github : `https://github.com/${data.contact.github}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><i className="fa-brands fa-github"></i></a>
          )}
          {data.contact?.linkedin && (
            <a href={data.contact.linkedin.startsWith('http') ? data.contact.linkedin : `https://linkedin.com/in/${data.contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors"><i className="fa-brands fa-linkedin-in"></i></a>
          )}
          {data.contact?.email && (
            <a href={`mailto:${data.contact.email}`} className="hover:text-white transition-colors"><i className="fa-solid fa-envelope"></i></a>
          )}
        </div>
      </footer>

      {/* Cofolios floating contact me button */}
      {designSystem === 'cofolios' && (
        <div className="fixed bottom-6 left-6 z-50">
          <a
            href={data.contact?.email ? `mailto:${data.contact.email}` : '#contact'}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-xs text-white uppercase tracking-wider font-extrabold shadow-2xl transition-all active:scale-95 cursor-pointer"
          >
            <i className="fa-solid fa-envelope"></i>
            Contact Me
          </a>
        </div>
      )}

      {/* Scroll blur effect overlay */}
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
    </div>
  );
}
