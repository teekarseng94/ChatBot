
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showDashboardBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  toggleDarkMode,
  showDashboardBack = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (showDashboardBack) {
      navigate('/');
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToMyAccount = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    navigate('/myaccount');
  };

  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const element = document.getElementById('pricing');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePlaceholderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={scrollToTop}>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs italic">
                  CHAT
                </div>
                <span className="text-2xl font-black tracking-tighter text-blue-900 dark:text-blue-400 italic uppercase">MYCHATBOT</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" onClick={scrollToTop} className="text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors font-medium">Home</a>
              <a href="#" onClick={handlePlaceholderClick} className="text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors font-medium">Courses</a>
              <a 
                href="#pricing" 
                onClick={scrollToPricing}
                className="relative text-orange-500 font-medium group"
              >
                Pricing
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500 rounded-full"></span>
              </a>
              {showDashboardBack ? (
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); navigate('/'); }}
                className="text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors font-medium"
              >
                Back to site
              </button>
            ) : (
              <button
                type="button"
                onClick={goToMyAccount}
                className="text-slate-600 dark:text-slate-300 hover:text-orange-500 transition-colors font-medium"
              >
                My Account
              </button>
            )}
              
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="md:hidden flex items-center space-x-2">
              <button 
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button 
                className="text-slate-600 dark:text-slate-300 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      ></div>

      {/* Mobile Drawer Content */}
      <div 
        className={`fixed top-0 right-0 z-[70] h-full w-4/5 max-w-sm bg-white dark:bg-slate-900 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header in Drawer */}
          <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xl font-black tracking-tighter text-blue-900 dark:text-blue-400 italic" onClick={scrollToTop}>MYCHATBOT</span>
            <button 
              className="text-slate-400 dark:text-slate-500 p-2" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Links in Drawer */}
          <div className="flex flex-col py-6 px-6 space-y-4">
            <a 
              href="#" 
              onClick={scrollToTop} 
              className="text-lg font-semibold text-slate-800 dark:text-slate-200 hover:text-orange-500 py-2 transition-colors border-b border-slate-50 dark:border-slate-800"
            >
              Home
            </a>
            <a 
              href="#" 
              onClick={handlePlaceholderClick} 
              className="text-lg font-semibold text-slate-800 dark:text-slate-200 hover:text-orange-500 py-2 transition-colors border-b border-slate-50 dark:border-slate-800"
            >
              Courses
            </a>
            <a 
              href="#pricing" 
              onClick={scrollToPricing} 
              className="text-lg font-semibold text-orange-500 py-2 transition-colors border-b border-slate-50 dark:border-slate-800"
            >
              Pricing
            </a>
            {showDashboardBack ? (
            <button
              type="button"
              onClick={() => { setIsMobileMenuOpen(false); navigate('/'); }}
              className="text-lg font-semibold text-slate-800 dark:text-slate-200 hover:text-orange-500 py-2 transition-colors border-b border-slate-50 dark:border-slate-800 w-full text-left"
            >
              Back to site
            </button>
          ) : (
            <button
              type="button"
              onClick={goToMyAccount}
              className="text-lg font-semibold text-slate-800 dark:text-slate-200 hover:text-orange-500 py-2 transition-colors border-b border-slate-50 dark:border-slate-800 w-full text-left"
            >
              My Account
            </button>
          )}
          </div>

          {/* Footer in Drawer */}
          <div className="mt-auto p-6 bg-slate-50 dark:bg-slate-800/50">
            <button 
              onClick={scrollToPricing}
              className="w-full bg-[#FF6B35] text-white py-4 rounded-xl font-bold text-center shadow-lg shadow-orange-100 dark:shadow-none"
            >
              Start Free
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
