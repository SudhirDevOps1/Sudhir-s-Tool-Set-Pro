import { useState, useEffect, useCallback } from 'react';
import {
  Github,
  Cpu,
  Send,
  Book,
  Shield,
  Settings,
  Check,
  AlertCircle,
  Keyboard,
} from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { copyToClipboard } from './utils/clipboard';
import { Header } from './components/Header';
import { EnvironmentStatus } from './components/sections/EnvironmentStatus';
import { CommandBuilder } from './components/sections/CommandBuilder';
import { GitHubMastery } from './components/sections/GitHubMastery';
import { Troubleshooting } from './components/sections/Troubleshooting';
import { TroubleshootingEnhanced } from './components/sections/TroubleshootingEnhanced';
import { DownloadManager } from './components/sections/DownloadManager';
import { Ethics } from './components/sections/Ethics';
import { ThumbnailDownloader } from './components/sections/ThumbnailDownloader';

const navItems = [
  { href: '#ready', label: '⚡ System Ready?' },
  { href: '#builder', label: '🚀 Command Builder' },
  { href: '#thumbnail-downloader', label: '🖼️ Thumbnail Downloader' },
  { href: '#github', label: 'Git Workflow' },
  { href: '#troubleshoot', label: '🛠 Troubleshooting' },
  { href: '#troubleshoot-enhanced', label: '🔧 Advanced Solutions' },
  { href: '#manager', label: '📥 Download Manager' },
  { href: '#best', label: 'Ethics' },
];

const sectionIds = ['ready', 'builder', 'thumbnail-downloader', 'github', 'troubleshoot', 'troubleshoot-enhanced', 'manager', 'best'];

export function App() {
  const { theme, setTheme, cycleTheme } = useTheme();
  const { visible: toastVisible, message: toastMessage, isError: toastIsError, showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [downloadCount] = useState(() => parseInt(localStorage.getItem('downloadCount') || '0'));
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Determine which sections are visible based on search
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!searchQuery.trim()) {
      const all: Record<string, boolean> = {};
      sectionIds.forEach((id) => (all[id] = true));
      setSectionVisibility(all);
      return;
    }

    // For search filtering, we check the text content approach
    const query = searchQuery.toLowerCase();
    const vis: Record<string, boolean> = {};

    // Section content mapping for search
    const sectionContent: Record<string, string> = {
      ready: 'environment status yt-dlp core ffmpeg engine full setup install windows linux mac version update',
      builder: 'smart command generator media type video audio format mp4 mkv mp3 m4a quality speed scope playlist url presets yt music 1080p',
      'thumbnail-downloader': 'thumbnail downloader media grabber embed thumbnail write thumbnail metadata video quality output path format mp4 mkv webm extract separate file',
      github: 'github mastery git add commit push pull origin main stage sync cloud local',
      troubleshoot: 'troubleshooting fixes no audio merging ffmpeg path fragmented streams slow speed connection geo-blocked bypass proxy metadata cookies',
      'troubleshoot-enhanced': 'troubleshooting solutions network errors retries socket timeout age-restricted cookies user-agent extract specific formats common solutions update clear cache force ipv4 ignore errors custom headers',
      manager: 'download manager advanced options max download speed throttling sleep concurrent fragments resume failed downloads ignore errors add metadata',
      best: 'educational ethical use personal archival educational research copyright laws terms of service',
    };

    sectionIds.forEach((id) => {
      vis[id] = (sectionContent[id] || '').includes(query);
    });

    setSectionVisibility(vis);
  }, [searchQuery]);

  const handleCopy = useCallback(
    async (text: string) => {
      const success = await copyToClipboard(text);
      if (success) {
        showToast('Copied!');
      } else {
        showToast('Copy failed. Select and copy manually.', true);
      }
    },
    [showToast]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl + K: Search
      if (e.ctrlKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('searchBar')?.focus();
      }
      // Alt + T: Cycle Themes
      if (e.altKey && e.key.toLowerCase() === 't') {
        const next = cycleTheme();
        showToast(`Theme: ${next.toUpperCase()}`);
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
      // ?: Help
      if (e.key === '?' && (e.target as HTMLElement).tagName !== 'INPUT') {
        setShowShortcuts((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cycleTheme, showToast]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Background Glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 10% 20%, var(--accent-glow) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(240,80,50,0.05) 0%, transparent 40%)',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <Header theme={theme} setTheme={setTheme} searchQuery={searchQuery} onSearch={setSearchQuery} />

      {/* Main Content */}
      <div className="max-w-[1000px] mx-auto px-5 py-5 relative z-10">
        {/* Quick Nav */}
        <div className="flex flex-wrap gap-2.5 my-5">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="no-underline text-sm px-3 py-2 rounded-full transition-all duration-200"
              style={{
                color: 'var(--text)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.color = 'var(--accent)';
                e.currentTarget.style.background = 'rgba(56,189,248,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Sections */}
        <EnvironmentStatus visible={sectionVisibility['ready'] ?? true} onCopy={handleCopy} />
        <CommandBuilder visible={sectionVisibility['builder'] ?? true} onCopy={handleCopy} showToast={showToast} />
        <ThumbnailDownloader visible={sectionVisibility['thumbnail-downloader'] ?? true} onCopy={handleCopy} showToast={showToast} />
        <GitHubMastery visible={sectionVisibility['github'] ?? true} />
        <Troubleshooting visible={sectionVisibility['troubleshoot'] ?? true} />
        <Ethics visible={sectionVisibility['best'] ?? true} />
        <TroubleshootingEnhanced visible={sectionVisibility['troubleshoot-enhanced'] ?? true} />
        <DownloadManager visible={sectionVisibility['manager'] ?? true} showToast={showToast} />
      </div>

      {/* HUD Shortcuts (Desktop) */}
      <div
        className="fixed left-5 bottom-5 hidden md:grid gap-2 px-3 py-2.5 rounded-2xl text-xs z-50"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: 'var(--text-dim)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div>
          <kbd className="bg-gray-700 px-1 py-0.5 rounded text-white text-xs font-mono shadow-[0_2px_0_#111]">
            Ctrl
          </kbd>{' '}
          +{' '}
          <kbd className="bg-gray-700 px-1 py-0.5 rounded text-white text-xs font-mono shadow-[0_2px_0_#111]">
            K
          </kbd>{' '}
          Search
        </div>
        <div>
          <kbd className="bg-gray-700 px-1 py-0.5 rounded text-white text-xs font-mono shadow-[0_2px_0_#111]">
            ?
          </kbd>{' '}
          Shortcuts Help
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-5 right-5 flex gap-2.5 items-center flex-wrap z-50">
        <button
          className="px-3 py-2 rounded-lg cursor-pointer font-bold flex items-center gap-2 transition-all duration-200 text-sm"
          style={{
            background: 'rgba(56,189,248,0.1)',
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
          }}
          onClick={() => setShowGuideModal(true)}
          title="Show Guide"
        >
          <Book className="w-4 h-4" /> Guide
        </button>
        <button
          className="px-3 py-2 rounded-lg cursor-pointer font-bold flex items-center gap-2 transition-all duration-200 text-sm"
          style={{
            background: 'rgba(56,189,248,0.1)',
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
          }}
          onClick={() => setShowRulesModal(true)}
          title="Usage Rules"
        >
          <Shield className="w-4 h-4" /> Rules
        </button>
        <button
          className="px-3 py-2 rounded-lg cursor-pointer font-bold flex items-center gap-2 transition-all duration-200 text-sm"
          style={{
            background: 'rgba(56,189,248,0.1)',
            color: 'var(--accent)',
            border: '1px solid var(--accent)',
          }}
          onClick={() => showToast('Advanced options ready!')}
          title="Advanced Options"
        >
          <Settings className="w-4 h-4" /> Advanced
        </button>
        <div
          className="px-3 py-2 rounded-lg text-sm font-bold"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--accent)',
          }}
        >
          <span style={{ color: 'var(--accent)' }}>Downloads: </span>
          <span>{downloadCount}</span>
        </div>
      </div>

      {/* In-App Guide Modal */}
      {showGuideModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[1000]"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-[90%] max-w-[560px] rounded-2xl overflow-hidden"
            style={{ background: 'var(--card)', border: '2px solid var(--accent)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(240,80,50,0.1))', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="m-0 text-xl font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                <Book className="w-5 h-5" /> Download Guide
              </h3>
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)' }}
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { num: '1️⃣', text: 'Media Type select karo — Video ya Audio' },
                { num: '2️⃣', text: 'Format choose karo — MP4, MP3, MKV etc.' },
                { num: '3️⃣', text: 'Quality set karo — Best, 1080p, 720p' },
                { num: '4️⃣', text: 'URL paste karo — YouTube ka link' },
                { num: '5️⃣', text: 'Copy Command click karo aur Terminal mein paste karo' },
                { num: '🖼️', text: 'Thumbnail ke liye — Thumbnail Downloader section use karo' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-lg">{item.num}</span>
                  <span className="text-sm" style={{ lineHeight: 1.7 }}>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              <button
                className="w-full py-2.5 rounded-xl cursor-pointer font-bold text-sm"
                style={{ background: 'var(--accent)', color: 'var(--bg)', border: '1px solid var(--accent)' }}
                onClick={() => setShowGuideModal(false)}
              >
                Samajh Gaya! ✅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Rules Modal */}
      {showRulesModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[1000]"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowRulesModal(false)}
        >
          <div
            className="w-[90%] max-w-[560px] rounded-2xl overflow-hidden"
            style={{ background: 'var(--card)', border: '2px solid var(--success)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(56,189,248,0.05))', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 className="m-0 text-xl font-bold flex items-center gap-2" style={{ color: 'var(--success)' }}>
                <Shield className="w-5 h-5" /> Usage Rules
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)' }}
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-3">
              {[
                { icon: '⚖️', text: 'Copyright Laws ka respect karo — pirated content download mat karo' },
                { icon: '📚', text: 'Personal use aur Educational purpose ke liye hi use karo' },
                { icon: '❤️', text: 'Content creators ko support karo — official platforms pe watch karo' },
                { icon: '📜', text: 'Platforms ke Terms of Service check karo pehle' },
                { icon: '🚫', text: 'Downloaded content ko commercially distribute mat karo' },
                { icon: '✅', text: 'Archival aur backup ke liye use karna best practice hai' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm" style={{ lineHeight: 1.7 }}>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              <button
                className="w-full py-2.5 rounded-xl cursor-pointer font-bold text-sm"
                style={{ background: 'var(--success)', color: 'var(--bg)', border: '1px solid var(--success)' }}
                onClick={() => setShowRulesModal(false)}
              >
                Samajh Gaya! ✅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shortcuts Overlay */}
      {showShortcuts && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[1000]"
          style={{
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
          }}
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="w-[90%] max-w-[500px] p-8 rounded-2xl"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--accent)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mt-0 flex items-center gap-2 text-xl">
              <Keyboard className="w-5 h-5" /> Keyboard Shortcuts
            </h3>
            {[
              { label: 'Search Documentation', key: 'Ctrl + K' },
              { label: 'Generate & Copy Cmd', key: 'Ctrl + Enter' },
              { label: 'Toggle Theme', key: 'Alt + T' },
              { label: 'Close Modals', key: 'Esc' },
            ].map((item) => (
              <div
                key={item.key}
                className="flex justify-between py-2.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              >
                <span>{item.label}</span>
                <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-white text-xs font-mono shadow-[0_2px_0_#111]">
                  {item.key}
                </kbd>
              </div>
            ))}
            <button
              className="w-full mt-5 px-4 py-2.5 rounded-lg cursor-pointer font-bold flex items-center justify-center gap-2 transition-all duration-200 text-sm"
              style={{
                background: 'rgba(56,189,248,0.1)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
              }}
              onClick={() => setShowShortcuts(false)}
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        className="fixed bottom-8 right-8 flex items-center gap-2.5 px-6 py-3 rounded-xl z-[1000] max-w-[min(520px,calc(100vw-40px))] transition-all duration-300"
        style={{
          background: 'var(--card)',
          color: 'var(--text)',
          border: `1px solid ${toastIsError ? 'var(--error)' : 'var(--accent)'}`,
          transform: toastVisible ? 'translateY(0)' : 'translateY(100px)',
          opacity: toastVisible ? 1 : 0,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          pointerEvents: toastVisible ? 'auto' : 'none',
        }}
      >
        {toastIsError ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
        {toastMessage}
      </div>

      {/* Footer */}
      <footer
        className="px-5 py-10 text-center mt-10"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.1)',
          background: 'var(--card)',
        }}
      >
        <div className="flex justify-center gap-5 mb-5">
          <a
            href="https://github.com/yt-dlp/yt-dlp"
            target="_blank"
            rel="noreferrer"
            title="Official yt-dlp"
            className="transition-colors duration-300"
            style={{ color: 'var(--text-dim)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://ffmpeg.org/"
            target="_blank"
            rel="noreferrer"
            title="FFmpeg Project"
            className="transition-colors duration-300"
            style={{ color: 'var(--text-dim)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
          >
            <Cpu className="w-5 h-5" />
          </a>
          <a
            href="#"
            title="Sudhir on Telegram"
            className="transition-colors duration-300"
            style={{ color: 'var(--text-dim)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
          >
            <Send className="w-5 h-5" />
          </a>
        </div>
        <p>
          Handcrafted by <strong>Sudhir</strong> • © 2025
        </p>
        <p className="text-xs mt-2.5" style={{ color: 'var(--text-dim)' }}>
          Industrial Grade DevOps Tooling Interface v2.5
        </p>
      </footer>
    </div>
  );
}
