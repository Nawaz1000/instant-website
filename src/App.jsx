import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import DynamicTheme from './components/DynamicTheme'
import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

// UTF-8 safe Base64 encoding & decoding helper functions
export function utf8ToBase64(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode(parseInt(p1, 16));
  }));
}

export function base64ToUtf8(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

export default function App() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [isEditor, setIsEditor] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Dynamic SEO Updates
  useEffect(() => {
    if (portfolioData && !isEditor) {
      const docTitle = `${portfolioData.n || portfolioData.name || 'Portfolio Owner'} | Portfolio`;
      const docDesc = portfolioData.bio || 'Professional Portfolio';
      
      document.title = docTitle;
      
      const setMeta = (name, content, attr = 'name') => {
        let meta = document.querySelector(`meta[${attr}="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(attr, name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      setMeta('description', docDesc);
      
      // Open Graph Tags
      setMeta('og:title', docTitle, 'property');
      setMeta('og:description', docDesc, 'property');
      setMeta('og:type', 'website', 'property');
      
      // Twitter Card Tags
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:title', docTitle);
      setMeta('twitter:description', docDesc);
      
    } else {
      document.title = 'Website Builder';
    }
  }, [portfolioData, isEditor]);

  useEffect(() => {
    // 1. Try to load from pathname slug (e.g. /faraaz)
    const path = window.location.pathname.replace(/^\/|\/$/g, '');
    const isSpecialPath = path && path !== 'index.html' && !path.startsWith('themes/') && !path.includes('/');

    if (isSpecialPath) {
      setIsLoading(true);
      setError(null);
      
      const docRef = doc(db, 'portfolios', path.toLowerCase());
      getDoc(docRef).then((docSnap) => {
        if (docSnap.exists()) {
          setPortfolioData(docSnap.data());
          setIsEditor(false);
          setIsPreviewMode(false);
        } else {
          setError('404');
        }
        setIsLoading(false);
      }).catch(err => {
        console.error("Firestore loading error:", err);
        setError('fetch-error');
        setIsLoading(false);
      });
      return;
    }

    // 2. Fallback: Try to load from URL parameter query 'space'
    const urlParams = new URLSearchParams(window.location.search);
    const encodedPayload = urlParams.get('space');

    if (encodedPayload && encodedPayload.trim() !== "") {
      try {
        const cleanedPayload = encodedPayload.trim().replace(/\s/g, '');
        const decodedData = JSON.parse(base64ToUtf8(cleanedPayload));
        
        if (decodedData && decodedData.n) {
          setPortfolioData(decodedData);
          setIsEditor(false);
          setIsPreviewMode(true);
        }
      } catch(e) { 
        console.error("Payload decoding or initialization failed:", e);
      }
    }
  }, []);

  const handleBackToDashboard = () => {
    // Clear URL parameters & path smoothly and switch back to editor
    window.history.pushState({}, '', window.location.origin);
    setError(null);
    setIsEditor(true);
  };

  const handlePreview = (data) => {
    setPortfolioData(data);
    setIsEditor(false);
    setIsPreviewMode(true);

    // Set URL parameter fallback locally for ease of use
    const base64String = utf8ToBase64(JSON.stringify(data));
    window.history.pushState({}, '', `?space=${base64String}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070814] flex flex-col justify-center items-center gap-4 text-purple-400 font-bold font-outfit">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest opacity-80">Fetching portfolio data...</p>
      </div>
    );
  }

  if (error === '404') {
    return (
      <div className="min-h-screen bg-[#070814] text-[#f8fafc] flex flex-col justify-center items-center px-6 text-center font-outfit">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400 text-3xl mb-8">
          <i className="fa-solid fa-circle-question"></i>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 leading-none bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
          Portfolio Not Found
        </h1>
        <p className="text-gray-450 text-sm md:text-base mb-10 max-w-md font-light leading-relaxed">
          The requested portfolio slug doesn't exist, or the owner has deleted it. Double check the address or create your own!
        </p>
        <button
          onClick={handleBackToDashboard}
          className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-lg shadow-purple-500/20 transition-all active:scale-95"
        >
          Build Your Own Portfolio
        </button>
      </div>
    );
  }

  if (error === 'fetch-error') {
    return (
      <div className="min-h-screen bg-[#070814] text-[#f8fafc] flex flex-col justify-center items-center px-6 text-center font-outfit">
        <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-400 text-3xl mb-8">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 leading-none bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent">
          Connection Error
        </h1>
        <p className="text-gray-450 text-sm md:text-base mb-10 max-w-md font-light leading-relaxed">
          Could not establish connection to the database. Make sure you are online, or verify your Firebase configuration setup.
        </p>
        <button
          onClick={handleBackToDashboard}
          className="px-8 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-full transition-all active:scale-95"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (isEditor) {
    return <Dashboard onCompile={handlePreview} initialData={portfolioData} />;
  }

  if (portfolioData && (portfolioData.th === "theme1" || portfolioData.th === "theme2" || portfolioData.th === "theme3" || portfolioData.th === "theme4" || portfolioData.th === "theme5")) {
    window.portfolioData = portfolioData;
    return (
      <div className="relative w-full h-screen bg-black">
        {isPreviewMode && (
          <button
            onClick={handleBackToDashboard}
            className="absolute top-4 left-4 z-50 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95"
          >
            ← Editor
          </button>
        )}
        <iframe
          src={`/themes/${portfolioData.th}/index.html?t=${Date.now()}`}
          title={portfolioData.n || "3D Portfolio"}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-forms"
        />
      </div>
    );
  }

  if (portfolioData && portfolioData.th === "custom_html") {
    return (
      <div className="relative w-full h-screen bg-black">
        {isPreviewMode && (
          <button
            onClick={handleBackToDashboard}
            className="absolute top-4 left-4 z-50 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg transition-all active:scale-95"
          >
            ← Editor
          </button>
        )}
        <iframe
          srcDoc={portfolioData.customHtml}
          title={portfolioData.n || "Custom Portfolio"}
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-forms"
        />
      </div>
    );
  }

  // Render the dynamic theme directly
  return <DynamicTheme data={portfolioData} onBack={handleBackToDashboard} isPreviewMode={isPreviewMode} />;
}
