import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function AdminDashboard({ onBack }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState({ totalHits: 0, uniqueUsers: 0, totalPortfolios: 0 });
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default admin password
  const ADMIN_PASSWORD = "admin123";

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      // Save auth state for session convenience
      sessionStorage.setItem('admin_authed', 'true');
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  useEffect(() => {
    // Restore session auth if present
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

        // Sort by createdAt timestamp (newest first)
        portfolioList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setStats({
          totalHits: hits,
          uniqueUsers: unique,
          totalPortfolios: portfolioList.length
        });
        setPortfolios(portfolioList);
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
              <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-widest">Admin Password</label>
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
            <p className="text-[10px] font-bold text-gray-450 uppercase tracking-widest mb-1">Portfolios Built</p>
            <h3 className="text-3xl font-extrabold text-indigo-400">{loading ? '...' : stats.totalPortfolios.toLocaleString()}</h3>
            <p className="text-[10px] text-gray-500 mt-2 font-medium">Active hosted portfolios in Firestore</p>
          </motion.div>
        </div>

        {/* Portfolios Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 overflow-hidden flex flex-col"
        >
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
            <div>
              <h2 className="text-lg font-bold text-white">Active Hosted Portfolios</h2>
              <p className="text-xs text-gray-405 mt-0.5">Explore, visit, or manage user-built websites.</p>
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
              <p className="text-xs text-gray-550 mt-1">Compiled sites will appear here in real-time.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] font-extrabold text-gray-450 uppercase tracking-widest">
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
      </main>
    </div>
  );
}
