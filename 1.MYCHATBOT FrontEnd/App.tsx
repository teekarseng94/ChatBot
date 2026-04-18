import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { Pricing } from './components/Pricing';
import { Dashboard } from './src/components/Dashboard';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const location = useLocation();
  const showDashboardBack = location.pathname === '/login' || location.pathname === '/myaccount';

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        showDashboardBack={showDashboardBack}
      />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <main>
                <Hero />
                <Features />
                <Pricing />
              </main>
              <footer className="py-12 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-sm">
                <p>© {new Date().getFullYear()} MyChatBot. All rights reserved.</p>
              </footer>
            </>
          }
        />
        <Route path="/login" element={<Dashboard />} />
        <Route path="/myaccount" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;
