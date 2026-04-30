import React, { useState, useEffect } from 'react';
import { Download, Moon, Sun, Wifi, Menu, X } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onInstallPWA?: () => void;
  showInstall?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeToggle,
  onInstallPWA,
  showInstall,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg shadow-black/5'
          : 'bg-white dark:bg-gray-900'
      } border-b border-gray-200 dark:border-gray-800`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/40 transition-all duration-300 group-hover:scale-105">
                <Download className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="text-lg font-extrabold bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent leading-none">
                SocialDL
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 leading-none font-medium tracking-widest uppercase">
                Downloader
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="#downloader"
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
            >
              Downloader
            </a>
            <a
              href="#history"
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
            >
              History
            </a>
            <a
              href="#supported"
              className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
            >
              Supported Sites
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Online indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
              <Wifi className="w-3.5 h-3.5 text-green-500" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">Free</span>
            </div>

            {/* PWA Install */}
            {showInstall && (
              <button
                onClick={onInstallPWA}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={onThemeToggle}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4.5 h-4.5" />
              ) : (
                <Moon className="w-4.5 h-4.5" />
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-3 space-y-1">
            {['#downloader', '#history', '#supported'].map((href) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all capitalize"
              >
                {href.replace('#', '')}
              </a>
            ))}
            {showInstall && (
              <button
                onClick={() => { onInstallPWA?.(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
