import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, History, ChevronDown } from 'lucide-react';
import { Header } from './components/Header';
import { DownloadForm } from './components/DownloadForm';
import { HistoryList } from './components/HistoryList';
import { Footer } from './components/Footer';
import { ToastContainer, useToast } from './components/Toast';
import { useDownloader } from './hooks/useDownloader';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { DownloadRecord, AppSettings } from './types';
import { downloadFile } from './utils/apiFallback';

// ─── BeforeInstallPromptEvent ─────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

const STATS = [
  { value: '10+', label: 'Platforms' },
  { value: '5', label: 'API Providers' },
  { value: '100%', label: 'Free' },
  { value: '0', label: 'API Keys Needed' },
];

// ─── App ──────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  // Settings
  const [settings, setSettings] = useLocalStorage<AppSettings>('app-settings', {
    theme: 'dark',
    defaultFormat: 'mp4',
    defaultQuality: '1080',
    defaultMode: 'auto',
  });

  // Apply dark mode to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const toggleTheme = () => {
    setSettings((s) => ({ ...s, theme: s.theme === 'dark' ? 'light' : 'dark' }));
  };

  // PWA install
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      installPromptRef.current = e as BeforeInstallPromptEvent;
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPromptRef.current) return;
    await installPromptRef.current.prompt();
    const { outcome } = await installPromptRef.current.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
  };

  // Downloader
  const {
    state,
    progressMsg,
    history,
    fetchInfo,
    triggerDownload,
    reset,
    deleteRecord,
    clearHistory,
    refreshHistory,
  } = useDownloader();

  // Toast
  const { toasts, addToast, dismissToast } = useToast();

  // Load history on mount
  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  // Show toast on status changes
  useEffect(() => {
    if (state.status === 'done') {
      addToast('✅ Download started successfully!', 'success');
    } else if (state.status === 'error' && state.error) {
      addToast('❌ ' + state.error.split('\n')[0], 'error', 6000);
    }
  }, [state.status, state.error, addToast]);

  // Active tab
  const [activeTab, setActiveTab] = useState<'downloader' | 'history'>('downloader');

  // Re-download from history
  const handleRedownload = async (record: DownloadRecord) => {
    try {
      addToast('⬇️ Re-downloading…', 'info');
      await downloadFile(record.mediaInfo.url, record.mediaInfo.filename);
      addToast('✅ Re-download started!', 'success');
    } catch {
      addToast('❌ Re-download failed. The link may have expired.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <Header
        theme={settings.theme}
        onThemeToggle={toggleTheme}
        onInstallPWA={handleInstallPWA}
        showInstall={showInstall}
      />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700 dark:from-violet-900 dark:via-indigo-900 dark:to-blue-950">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full" />
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm text-white/90 font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Free · No Sign-up · No Limits
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
              Download Videos{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300">
                Anywhere
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Download videos and audio from YouTube, TikTok, Instagram, Twitter,
              Facebook and 10+ more platforms — completely free, no API keys needed.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto">
              {STATS.map(({ value, label }) => (
                <div
                  key={label}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3"
                >
                  <div className="text-2xl font-extrabold text-white">{value}</div>
                  <div className="text-xs text-white/70 font-medium">{label}</div>
                </div>
              ))}
            </div>

            {/* Scroll cue */}
            <div className="mt-10 flex justify-center">
              <a
                href="#downloader"
                className="flex flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors"
              >
                <span className="text-xs">Start Downloading</span>
                <ChevronDown className="w-5 h-5 animate-bounce" />
              </a>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section
          id="downloader"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Left panel: Downloader ── */}
            <div className="lg:col-span-2">
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl mb-6 shadow-sm">
                <button
                  onClick={() => setActiveTab('downloader')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'downloader'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  ⬇️ Downloader
                </button>
                <button
                  id="history"
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === 'history'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <History className="w-4 h-4" />
                  History
                  {history.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                      {history.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Panel */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm">
                {activeTab === 'downloader' ? (
                  <DownloadForm
                    onFetch={fetchInfo}
                    onDownload={triggerDownload}
                    onReset={reset}
                    status={state.status}
                    progress={state.progress}
                    progressMsg={progressMsg}
                    error={state.error}
                    mediaInfo={state.mediaInfo}
                  />
                ) : (
                  <HistoryList
                    records={history}
                    onRedownload={handleRedownload}
                    onDelete={deleteRecord}
                    onClearAll={clearHistory}
                  />
                )}
              </div>
            </div>

            {/* ── Right panel: Info & Tips ── */}
            <div className="space-y-5">
              {/* How it works */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center text-sm">
                    💡
                  </span>
                  How it works
                </h3>
                <ol className="space-y-3">
                  {[
                    { step: '1', text: 'Paste any video URL into the input field' },
                    { step: '2', text: 'Choose your preferred format and quality' },
                    { step: '3', text: 'Click "Get Download Link" to fetch media info' },
                    { step: '4', text: 'Preview the video, then click "Download Now"' },
                  ].map(({ step, text }) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-bold text-xs flex items-center justify-center">
                        {step}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                        {text}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* API Fallback info */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm">
                    🔄
                  </span>
                  Multi-Tier Fallback
                </h3>
                <div className="space-y-2">
                  {[
                    { tier: '1', name: 'Cobalt API', desc: 'Open-source, community hosted', color: 'text-green-600 dark:text-green-400' },
                    { tier: '2', name: 'Invidious', desc: 'YouTube alternative frontend', color: 'text-blue-600 dark:text-blue-400' },
                    { tier: '3', name: 'Piped API', desc: 'Privacy-first YouTube proxy', color: 'text-violet-600 dark:text-violet-400' },
                    { tier: '4', name: 'Serverless', desc: 'Vercel /api/download (optional)', color: 'text-orange-600 dark:text-orange-400' },
                  ].map(({ tier, name, desc, color }) => (
                    <div key={tier} className="flex items-start gap-2.5">
                      <span className={`text-xs font-bold ${color} mt-0.5`}>T{tier}</span>
                      <div>
                        <p className={`text-sm font-semibold ${color}`}>{name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supported formats */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-sm">
                    🎞️
                  </span>
                  Supported Formats
                </h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {['MP4', 'WebM', 'MKV', 'GIF', 'MP3', 'OGG', 'OPUS', 'WAV'].map((fmt) => (
                    <span
                      key={fmt}
                      className="text-center text-xs font-mono font-bold py-1 px-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
