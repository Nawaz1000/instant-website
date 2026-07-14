# 🚀 instant-websites — Build Your Portfolio in Seconds

> A powerful, AI-assisted portfolio builder that transforms a resume or plain-text bio into a stunning, deployable personal portfolio website — with multiple 3D and dynamic themes.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Portfolio Themes](#portfolio-themes)
- [How It Works](#how-it-works)
- [Deployment](#deployment)
- [Sharing Portfolios](#sharing-portfolios)
- [Contributing](#contributing)

---

## Overview

**instant-websites** is a React-based web application that lets users create a professional portfolio in seconds. Simply paste your resume text, upload a PDF, or provide a LinkedIn/GitHub URL — the app intelligently extracts your name, skills, experience, projects, and contact info, then renders it using one of several stunning visual themes.

Portfolios can be:
- **Previewed instantly** in the editor
- **Shared via a URL slug** (e.g., \yourdomain.com/yourname\) powered by Firebase Firestore
- **Encoded as a URL parameter** (\?space=...\) for instant sharing without a database
- **Deployed to the web** via Firebase Hosting or Docker + Nginx

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Smart Info Extraction** | Parses resumes, PDFs, and plain text to auto-populate portfolio data |
| 🎨 **Multiple Themes** | 3 built-in 3D themes + custom HTML upload support |
| 🌐 **Shareable Slugs** | Firebase-backed persistent portfolio URLs (e.g., \/yourname\) |
| 🔗 **URL-Encoded Sharing** | Encode full portfolio data into a \?space=\ query param — no backend needed |
| 📱 **Responsive Design** | Fully responsive layouts across all themes |
| ⚡ **Live Preview** | Instant in-editor preview of the compiled portfolio |
| 🐳 **Docker Ready** | Multi-stage Docker build with Nginx for self-hosting |
| 🔥 **Firebase Hosting** | One-command deploy to Firebase CDN |
| 🎭 **Dynamic Visual Effects** | Aurora backgrounds, Ferrofluid animations, particle starfields, 3D tilt cards |
| 📄 **PDF Parsing** | In-browser PDF.js integration to parse uploaded resumes |

---

## 🛠 Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | UI framework |
| **Vite** | 5.3 | Build tool and dev server |
| **Tailwind CSS** | 3.4 | Utility-first styling |
| **Framer Motion** | 11.2 | Animations and transitions |
| **GSAP** | 3.15 | Advanced animations |
| **OGL** | 1.0 | WebGL / 3D rendering |
| **canvas-confetti** | 1.9 | Celebration effects |
| **mathjs** | 15.2 | Math utilities |

### Backend / Infrastructure

| Technology | Purpose |
|---|---|
| **Firebase Firestore** | Persistent portfolio storage by slug |
| **Firebase Hosting** | Static site hosting and CDN |
| **Docker + Nginx** | Self-hosted containerized deployment |

### External Libraries (CDN)

- **PDF.js** — In-browser PDF text extraction
- **Font Awesome 6** — Icon library
- **Google Fonts** — Cinzel, Fira Code, Inter, Outfit, Playfair Display, Space Grotesk, Plus Jakarta Sans

---

## 📁 Project Structure

\website-builder/
├── public/
│   ├── themes/
│   │   ├── theme1/             # 3D Tech Portfolio theme (WebGL)
│   │   ├── theme2/             # 3D Game Room theme (WASD movement)
│   │   ├── theme3/             # Sleek Modern theme (parallax scrolling)
│   │   ├── theme1_preview.png
│   │   ├── theme2_preview.png
│   │   ├── theme3_preview.png
│   │   └── custom_preview.png
│   ├── assets/
│   ├── fonts/
│   ├── models/
│   ├── desktop_pc/
│   ├── planet/
│   └── textures/
│
├── src/
│   ├── App.jsx                  # Root — routing, Firebase loading, theme routing
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Global styles
│   ├── firebase.js              # Firebase initialization (reads from env vars)
│   ├── components/
│   │   ├── Dashboard.jsx        # Main editor UI
│   │   ├── DynamicTheme.jsx     # Dynamic portfolio renderer with 3D effects
│   │   ├── Aurora.jsx/.css      # Aurora gradient background effect
│   │   ├── CardSwap.jsx/.css    # Animated card swap component
│   │   ├── Ferrofluid.jsx/.css  # Ferrofluid blob animation
│   │   ├── GradualBlur.jsx/.css # Gradual blur overlay effect
│   │   └── Grainient.jsx/.css   # Grainy gradient background
│   ├── templates/
│   │   └── themes.js            # HTML template generators for dynamic themes
│   └── utils/
│       ├── infoExtractor.js     # Core resume/text parsing engine
│       └── helpers.js           # Skill icon mapper, profession image mapper
│
├── index.html                   # HTML entry point (loads PDF.js, Fonts, Icons)
├── vite.config.js               # Vite configuration (port 3000)
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── firebase.json                # Firebase Hosting config (SPA rewrites)
├── Dockerfile                   # Multi-stage Docker build (Node -> Nginx)
├── docker-compose.yml           # Docker Compose (exposes port 8080)
└── package.json
---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- A **Firebase project** (optional — only needed for slug-based sharing)

### Local Development

\ash
# 1. Clone the repository
git clone <your-repo-url>
cd website-builder

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your Firebase credentials

# 4. Start the development server
npm run dev
The app will be available at **http://localhost:3000**

### Available Scripts

| Script | Description |
|---|---|
| pm run dev\ | Start the development server |
| pm run build\ | Build for production |
| pm run preview\ | Preview production build locally |
| pm run lint\ | Run ESLint |

---

## 🔑 Environment Variables

Create a \.env\ file in the project root:

\env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
> **Note:** Without Firebase credentials, the app still works in local preview mode. Firebase is only required for persistent slug-based URLs.

### Firebase Firestore Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Cloud Firestore** in Native mode
3. Create a collection named \portfolios4. Configure security rules as needed

---

## 🎨 Portfolio Themes

### Theme 1 — 3D Tech Portfolio
A modern dark developer portfolio with ambient lighting and a **3D desktop PC model** rendered via WebGL. Best suited for software developers and tech professionals.

### Theme 2 — 3D Game Room
An interactive **3D game room** environment with **WASD + Sprint keyboard character movement**. Ideal for creatives who want something truly unique and immersive.

### Theme 3 — Sleek Modern
A high-contrast black and white layout with **fluid parallax scrolling animations**. Clean, minimal, and elegant — suitable for any profession.

### Dynamic Theme (In-App Renderer)
A fully React-rendered theme featuring:
- 🌠 Canvas particle starfield background
- 🎴 Interactive 3D tilt cards (mouse-tracked perspective)
- 🌌 Aurora gradient background animation
- 🌊 Ferrofluid blob animation
- 💫 Framer Motion entrance animations

### Custom HTML Theme
Upload your own \index.html\ file — host a completely custom portfolio with no restrictions. The file is rendered inside a sandboxed \<iframe>\.

---

## ⚙️ How It Works



### URL Routing

| URL Pattern | Behavior |
|---|---|
| \/\ | Opens the editor Dashboard |
| \/yourname\ | Loads portfolio from Firestore by slug |
| \/?space=<base64>\ | Decodes and renders portfolio from URL |
| \/themes/theme1/index.html\ | Serves the static 3D Theme 1 directly |

---

## 📦 Deployment

### Firebase Hosting

\ash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting (if not done yet)
firebase init hosting

# Build the production bundle
npm run build

# Deploy to Firebase
firebase deploy
The \irebase.json\ is pre-configured with SPA rewrites so all routes correctly resolve to \index.html\.

### Docker

**Using Docker Compose (recommended):**

\ash
docker-compose up --build
App available at **http://localhost:8080**

**Manual Docker build:**

\ash
# Build the image
docker build -t instant-websites .

# Run the container
docker run -p 8080:80 instant-websites
**Multi-stage Dockerfile details:**
1. **Stage 1 (Build):** Node 20 Alpine — installs dependencies and runs pm run build2. **Stage 2 (Serve):** Nginx Alpine — serves the production \dist/\ directory on port 80

---

## 🔗 Sharing Portfolios

### Method 1: Slug URL (requires Firebase)
After filling out the Dashboard, click **Publish**. The portfolio is saved to Firestore under the chosen slug. Anyone can then visit \yourdomain.com/yourname\ to view it — no login required.

### Method 2: URL Parameter (no backend required)
When you click **Preview**, the entire portfolio data is encoded as a UTF-8-safe Base64 string appended as \?space=...\. Copy and share this URL — no server or Firebase needed.

---

## 🤝 Contributing

### Adding a New Theme

1. Create a folder: \public/themes/themeX/2. Add your \index.html\ — it receives \window.portfolioData\ containing the user data:
   \js
   // Available in window.portfolioData:
   {
     name, title, bio, skills, projects, experience, contact
   }
   . Add a preview image: \public/themes/themeX_preview.png\ (recommended: 16:10 aspect ratio)
4. Register the theme in \src/components/Dashboard.jsx\ in the themes array

---

## 📄 License

This project is private. All rights reserved.

---

*Built with React, Vite, Firebase, Framer Motion, and Three.js*
