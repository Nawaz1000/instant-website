import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, doc, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// SHA-256 helper for client-side password hashing (prevents leakage in bundle)
const sha256 = async (string) => {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export default function AdminDashboard({ onBack }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('portfolios'); // 'portfolios', 'visitors', 'themes', 'feedback'
  
  const [stats, setStats] = useState({ totalHits: 0, uniqueUsers: 0, totalPortfolios: 0 });
  const [portfolios, setPortfolios] = useState([]);
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [publishedThemes, setPublishedThemes] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  // PBKDF2 / SHA256 Hash of admin password "7V7ZgSaQp3ot9v7"
  const ADMIN_PASSWORD_HASH = "ba5350fbd13e90363b1e415923cd8313097f1088ebed212bdf8cfb17d2d982a8";

  const handleLogin = async (e) => {
    e.preventDefault();
    const enteredHash = await sha256(password);
    if (enteredHash === ADMIN_PASSWORD_HASH) {
      setIsAuthenticated(true);
      setError('');
      sessionStorage.setItem('admin_authed', 'true');
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem('admin_authed') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch site hits & unique users stats
        const statsRef = doc(db, 'siteAnalytics', 'dashboard');
        const statsSnap = await getDoc(statsRef);
        let hits = 0;
        let unique = 0;
        
        if (statsSnap.exists()) {
          hits = statsSnap.data().totalHits || 0;
          unique = statsSnap.data().uniqueUsers || 0;
        }

        // 2. Fetch all portfolios built
        const portfoliosSnap = await getDocs(collection(db, 'portfolios'));
        const portfolioList = portfoliosSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        portfolioList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        // 3. Fetch visitor logs & aggregate by IP
        const logsSnap = await getDocs(collection(db, 'visitor_logs'));
        const rawLogs = logsSnap.docs.map(doc => doc.data());
        const ipMap = {};
        
        rawLogs.forEach(log => {
          const ip = log.ip || 'Unknown';
          if (!ipMap[ip]) {
            ipMap[ip] = {
              ip: ip,
              paths: new Set(),
              hits: 0,
              names: new Set(),
              lastVisit: 0
            };
          }
          ipMap[ip].hits += 1;
          if (log.path) ipMap[ip].paths.add(log.path);
          if (log.name) ipMap[ip].names.add(log.name);
          if (log.timestamp && log.timestamp > ipMap[ip].lastVisit) {
            ipMap[ip].lastVisit = log.timestamp;
          }
        });

        const aggregatedLogs = Object.values(ipMap).map(v => ({
          ip: v.ip,
          paths: Array.from(v.paths).join(', '),
          hits: v.hits,
          names: Array.from(v.names).filter(n => n && n !== 'Builder Visitor').join(', ') || 'Builder Visitor',
          lastVisit: v.lastVisit
        }));
        aggregatedLogs.sort((a, b) => b.lastVisit - a.lastVisit);

        // 4. Fetch dynamic custom themes approved
        const themesSnap = await getDocs(collection(db, 'app_custom_themes'));
        const themesList = themesSnap.docs.map(doc => doc.data());

        // 5. Fetch feedback / comments left by users
        const commentsSnap = await getDocs(collection(db, 'comments'));
        const commentsList = commentsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        commentsList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        setStats({
          totalHits: hits,
          uniqueUsers: unique,
          totalPortfolios: portfolioList.length
        });
        setPortfolios(portfolioList);
        setVisitorLogs(aggregatedLogs);
        setPublishedThemes(themesList);
        setFeedbackList(commentsList);
      } catch (err) {
        console.error("Error fetching admin metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleDelete = async (slug) => {
    if (window.confirm(`Are you sure you want to delete the portfolio "${slug}"? This action is permanent.`)) {
      try {
        await deleteDoc(doc(db, "portfolios", slug));
        setPortfolios(prev => prev.filter(p => p.slug !== slug));
        setStats(prev => ({ ...prev, totalPortfolios: prev.totalPortfolios - 1 }));
      } catch (err) {
        alert("Failed to delete portfolio: " + err.message);
      }
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      alert("Custom HTML code copied to clipboard!");
    });
  };

  const handlePublishTheme = async (portfolio) => {
    const defaultName = `Theme - ${portfolio.n || 'Custom'}`;
    const themeName = prompt("Enter a name for this custom theme to add it to the available templates list:", defaultName);
    if (!themeName) return;

    try {
      const themeId = `custom_theme_${portfolio.slug}`;
      const newTheme = {
        id: themeId,
        name: themeName,
        customHtml: portfolio.customHtml || portfolio.rawCustomHtml || '',
        color: "from-purple-500 to-indigo-650",
        font: "Outfit",
        bgType: "custom_html",
        preview: "/themes/custom_preview.png",
        badge: "Custom"
      };

      await setDoc(doc(db, "app_custom_themes", themeId), newTheme);
      setPublishedThemes(prev => [...prev.filter(t => t.id !== themeId), newTheme]);
      alert("Theme successfully added to the app templates list!");
    } catch (e) {
      alert("Failed to add theme: " + e.message);
    }
  };

  const handleDeleteTheme = async (themeId) => {
    if (window.confirm("Are you sure you want to remove this theme from the templates list?")) {
      try {
        await deleteDoc(doc(db, "app_custom_themes", themeId));
        setPublishedThemes(prev => prev.filter(t => t.id !== themeId));
      } catch (e) {
        alert("Failed to remove theme: " + e.message);
      }
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback message?")) {
      try {
        await deleteDoc(doc(db, "comments", id));
        setFeedbackList(prev => prev.filter(f => f.id !== id));
      } catch (err) {
        alert("Failed to delete feedback: " + err.message);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070814] text-[#f8fafc] flex items-center justify-center px-4 font-outfit">
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none w-full h-full bg-gradient-to-tr from-purple-900 via-transparent to-[#00e5ff]/20" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-md bg-[#0d0914]/90 border border-purple-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden z-10 text-center"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00e5ff] via-purple-500 to-[#00e5ff]" />
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
            <i className="fa-solid fa-lock text-purple-400 text-xl"></i>
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">Admin Dashboard Gate</h1>
          <p className="text-xs text-gray-400 leading-relaxed mb-6">
            Authentication required to view system analytics, site hits, and user portfolios.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-gray-455 uppercase tracking-widest">Admin Password</label>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
                autoFocus
              />
            </div>
            
            {error && (
              <p className="text-[10px] text-red-400 font-bold bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onBack}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 text-xs font-bold transition-all active:scale-95 text-center"
              >
                Back to Site
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-550 hover:to-indigo-550 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/25 transition-all active:scale-95"
              >
                Unlock
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Filter custom-HTML theme portfolios
  const customPortfolios = portfolios.filter(p => p.th === 'custom_html');

  return (
    <div className="min-h-screen bg-[#070814] text-[#f8fafc] font-outfit overflow-x-hidden relative flex flex-col">
      {/* Background Aurora */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none w-full h-full bg-gradient-to-b from-purple-900/30 via-transparent to-transparent" />
      
      {/* Nav */}
      <nav className="relative z-10 border-b border-white/5 bg-[#070814]/80 backdrop-blur-xl px-6 md:px-[8%] py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <i className="fa-solid fa-chart-line text-xs text-white"></i>
          </div>
          <span className="font-extrabold text-base tracking-tight text-white">Admin Control Panel</span>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all active:scale-95"
        >
          ← Exit Admin
        </button>
      </nav>

      {/* Main content container */}
      <main className="relative z-10 flex-1 max-w-[1400px] w-full mx-auto px-6 md:px-12 py-10 space-y-10">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 text-purple-400 text-7xl font-bold">
              <i className="fa-solid fa-eye"></i>
            </div>
            <p className="text-[10px] font-bold text-gray-450 uppercase tracking-widest mb-1">Total Hits / Pageviews</p>
            <h3 className="text-3xl font-extrabold text-white">{loading ? '...' : stats.totalHits.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-500 mt-2 font-medium">All visits registered in compiler database</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 text-[#00e5ff] text-7xl font-bold">
              <i className="fa-solid fa-users"></i>
            </div>
            <p className="text-[10px] font-bold text-gray-450 uppercase tracking-widest mb-1">Unique Visitors</p>
            <h3 className="text-3xl font-extrabold text-[#00e5ff]">{loading ? '...' : stats.uniqueUsers.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-500 mt-2 font-medium">Unique browser fingerprints captured</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-5 text-indigo-400 text-7xl font-bold">
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <p className="text-[10px] font-bold text-gray-455 uppercase tracking-widest mb-1">Portfolios Built</p>
            <h3 className="text-3xl font-extrabold text-indigo-400">{loading ? '...' : stats.totalPortfolios.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-500 mt-2 font-medium">Active hosted portfolios in Firestore</p>
          </motion.div>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-6 border-b border-white/5 pb-2 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('portfolios')}
            className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'portfolios' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Portfolios
            {activeTab === 'portfolios' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'visitors' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Visitor Logs & IPs
            {activeTab === 'visitors' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'themes' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Custom Themes Manager
            {activeTab === 'themes' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`pb-2 px-1 text-xs font-bold uppercase tracking-wider transition-colors relative ${
              activeTab === 'feedback' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            User Feedback & Reviews
            {activeTab === 'feedback' && (
              <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500" />
            )}
          </button>
        </div>

        {/* Active Tab View */}
        <AnimatePresence mode="wait">
          {activeTab === 'portfolios' && (
            <motion.div
              key="portfolios"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-bold text-white">Active Hosted Portfolios</h2>
                  <p className="text-xs text-gray-455 mt-0.5">Explore, visit, or manage user-built websites.</p>
                </div>
                <button 
                  onClick={() => {
                    sessionStorage.removeItem('admin_authed');
                    setIsAuthenticated(false);
                  }}
                  className="text-[10px] uppercase tracking-wider font-bold text-gray-500 hover:text-red-400 transition-colors"
                >
                  Sign Out
                </button>
              </div>

              {loading ? (
                <div className="text-center py-16 text-purple-400 space-y-3">
                  <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
                  <p className="text-xs uppercase tracking-widest opacity-80 font-bold">Loading Portfolios...</p>
                </div>
              ) : portfolios.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-white/[0.002]">
                  <i className="fa-solid fa-folder-open text-4xl text-gray-650 mb-3"></i>
                  <p className="text-sm text-gray-400 font-bold">No portfolios compiled yet</p>
                  <p className="text-xs text-gray-555 mt-1">Compiled sites will appear here in real-time.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] font-extrabold text-gray-455 uppercase tracking-widest">
                        <th className="py-4 px-4">Name / Profession</th>
                        <th className="py-4 px-4">URL Slug</th>
                        <th className="py-4 px-4">Theme</th>
                        <th className="py-4 px-4">Date Created</th>
                        <th className="py-4 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                      {portfolios.map((portfolio) => (
                        <tr key={portfolio.slug || portfolio.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-bold text-white">{portfolio.n || portfolio.name || 'Untitled Owner'}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{portfolio.title || 'Portfolio Owner'}</div>
                          </td>
                          <td className="py-4 px-4 font-mono text-[11px] text-purple-400 font-bold select-all">
                            {portfolio.slug || portfolio.id}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                              portfolio.th === 'custom_html'
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                : 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                            }`}>
                              {portfolio.th || 'theme1'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-400">
                            {portfolio.createdAt 
                              ? new Date(portfolio.createdAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Prior to v2.0'
                            }
                          </td>
                          <td className="py-4 px-4 text-right space-x-3 shrink-0">
                            <a 
                              href={window.location.origin + '/' + (portfolio.slug || portfolio.id)} 
                              target="_blank" 
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white transition-all inline-block active:scale-95"
                            >
                              Visit Site
                            </a>
                            <button
                              onClick={() => handleDelete(portfolio.slug || portfolio.id)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[10px] font-bold text-red-400 transition-all active:scale-95"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'visitors' && (
            <motion.div
              key="visitors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 overflow-hidden flex flex-col"
            >
              <div className="mb-6 pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">Unique Visitor Logs</h2>
                <p className="text-xs text-gray-455 mt-0.5">Explore page hit metrics aggregated by client IP addresses.</p>
              </div>

              {loading ? (
                <div className="text-center py-16 text-purple-400 space-y-3">
                  <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
                  <p className="text-xs uppercase tracking-widest opacity-80 font-bold">Aggregating Log Data...</p>
                </div>
              ) : visitorLogs.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-white/[0.002]">
                  <i className="fa-solid fa-signal text-4xl text-gray-650 mb-3"></i>
                  <p className="text-sm text-gray-400 font-bold">No visitor logs recorded yet</p>
                  <p className="text-xs text-gray-550 mt-1">Visit counts will appear when someone loads your website.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] font-extrabold text-gray-455 uppercase tracking-widest">
                        <th className="py-4 px-4">Visitor IP Address</th>
                        <th className="py-4 px-4">Associated Site / User</th>
                        <th className="py-4 px-4">Visited Path(s)</th>
                        <th className="py-4 px-4">Total Hits</th>
                        <th className="py-4 px-4">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                      {visitorLogs.map((visitor, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-4 px-4 font-mono text-[11px] text-purple-400 font-bold select-all">
                            {visitor.ip}
                          </td>
                          <td className="py-4 px-4 text-white font-bold max-w-[180px] truncate" title={visitor.names}>
                            {visitor.names}
                          </td>
                          <td className="py-4 px-4 text-gray-400 max-w-[200px] truncate" title={visitor.paths}>
                            {visitor.paths}
                          </td>
                          <td className="py-4 px-4 text-[#00e5ff] font-bold">
                            {visitor.hits.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-gray-455">
                            {visitor.lastVisit 
                              ? new Date(visitor.lastVisit).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Unknown'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'themes' && (
            <motion.div
              key="themes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Custom portfolios list */}
              <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 overflow-hidden flex flex-col">
                <div className="mb-6 pb-4 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white">User-Created Custom Themes</h2>
                  <p className="text-xs text-gray-455 mt-0.5">Copy custom HTML code or publish them as dynamic themes in the app list.</p>
                </div>

                {loading ? (
                  <div className="text-center py-16 text-purple-400 space-y-3">
                    <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
                    <p className="text-xs uppercase tracking-widest opacity-80 font-bold">Loading Custom Portfolios...</p>
                  </div>
                ) : customPortfolios.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-white/[0.002]">
                    <i className="fa-solid fa-file-code text-4xl text-gray-650 mb-3"></i>
                    <p className="text-sm text-gray-400 font-bold">No custom HTML portfolios built yet</p>
                    <p className="text-xs text-gray-555 mt-1">Portfolios created using the Custom HTML option will list here.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[9px] font-extrabold text-gray-455 uppercase tracking-widest">
                          <th className="py-4 px-4">Name / Slug</th>
                          <th className="py-4 px-4">Date Created</th>
                          <th className="py-4 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                        {customPortfolios.map((portfolio) => (
                          <tr key={portfolio.slug || portfolio.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 px-4">
                              <div className="font-bold text-white">{portfolio.n || 'Custom Theme'}</div>
                              <div className="text-[10px] text-purple-400 font-mono font-bold mt-0.5">{portfolio.slug || portfolio.id}</div>
                            </td>
                            <td className="py-4 px-4 text-gray-400">
                              {portfolio.createdAt 
                                ? new Date(portfolio.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : 'Prior to v2.0'
                              }
                            </td>
                            <td className="py-4 px-4 text-right space-x-3">
                              <button
                                onClick={() => handleCopyCode(portfolio.customHtml || portfolio.rawCustomHtml || '')}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-white transition-all active:scale-95"
                              >
                                Copy HTML Code
                              </button>
                              <button
                                onClick={() => handlePublishTheme(portfolio)}
                                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[10px] font-bold transition-all active:scale-95 shadow-md shadow-purple-500/10"
                              >
                                Add to Themes List
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Published custom templates */}
              <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 overflow-hidden flex flex-col">
                <div className="mb-6 pb-4 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white">Dynamic Templates in Main App</h2>
                  <p className="text-xs text-gray-455 mt-0.5">Manage themes currently live and selectable in the builder theme list.</p>
                </div>

                {loading ? (
                  <p className="text-center py-6 text-gray-500 text-xs font-bold uppercase tracking-widest"><i className="fa-solid fa-spinner fa-spin mr-2"></i>Loading published list...</p>
                ) : publishedThemes.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500 italic bg-white/[0.002] border border-dashed border-white/5 rounded-2xl">
                    No dynamic themes published yet. Use the "Add to Themes List" button on any custom portfolio above to publish it!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {publishedThemes.map(theme => (
                      <div key={theme.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-bold text-white">{theme.name}</h4>
                          <p className="text-[10px] text-gray-500 font-mono mt-1">{theme.id}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteTheme(theme.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[10px] font-bold text-red-400 transition-all active:scale-95"
                        >
                          Remove Theme
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 overflow-hidden flex flex-col"
            >
              <div className="mb-6 pb-4 border-b border-white/5">
                <h2 className="text-lg font-bold text-white">User Feedback & Reviews</h2>
                <p className="text-xs text-gray-455 mt-0.5">Moderate or view ratings and comments left by portfolio creators.</p>
              </div>

              {loading ? (
                <div className="text-center py-16 text-purple-400 space-y-3">
                  <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
                  <p className="text-xs uppercase tracking-widest opacity-80 font-bold">Loading Feedback...</p>
                </div>
              ) : feedbackList.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-white/5 rounded-2xl bg-white/[0.002]">
                  <i className="fa-solid fa-comment-slash text-4xl text-gray-650 mb-3"></i>
                  <p className="text-sm text-gray-400 font-bold">No feedback submitted yet</p>
                  <p className="text-xs text-gray-550 mt-1">Comments submitted from build modals will display here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {feedbackList.map((f) => (
                    <div key={f.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-bold text-white">{f.name || 'Anonymous User'}</h4>
                            <div className="flex gap-1 text-amber-400 text-xs mt-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <i key={i} className={`fa-solid fa-star ${i < (f.rating || 5) ? 'text-amber-400' : 'text-gray-700'}`}></i>
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {f.timestamp ? new Date(f.timestamp).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed italic">
                          "{f.comment || 'No comment provided.'}"
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDeleteFeedback(f.id)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[10px] font-bold text-red-400 transition-all active:scale-95"
                        >
                          Delete Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
