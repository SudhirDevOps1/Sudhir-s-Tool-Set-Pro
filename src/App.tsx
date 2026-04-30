import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import {
  ShieldCheck, Search, Terminal as TerminalIcon, Cpu, GitBranch,
  Hammer, Download, Heart, Copy, Star, Music, Tv, ListVideo,
  ChevronDown, History, FolderHeart, Zap, AlertCircle,
  WifiOff, Lock, Layers, Settings, Play, Shield, Tag, Keyboard,
  Github, Send, AlertTriangle, Check, Info, X, Menu, ArrowUp,
  MonitorSmartphone, Sparkles, Trash2, FileDown, Clock,
  Globe, ExternalLink, ChevronRight, BarChart3,
  Monitor, Apple, Server, Package, Link, Rocket, Cloud,
  FolderOpen, RefreshCw, CheckCircle, ArrowRight, 
  Wrench, BookOpen, Scale, Eye, HardDrive, Wifi
} from 'lucide-react';

// ===== TYPES =====
type Theme = 'default' | 'cyber' | 'neon' | 'aurora';
type OsType = 'windows' | 'macos' | 'linux';

interface HistoryItem {
  cmd: string;
  time: string;
  id: number;
}

interface BuilderState {
  type: 'video' | 'audio';
  format: string;
  quality: string;
  speed: string;
  scope: 'single' | 'playlist';
  url: string;
}

// ===== CONSTANTS =====
const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: 'default', label: 'Dark', color: '#030712' },
  { id: 'cyber', label: 'Cyber', color: '#0d0221' },
  { id: 'neon', label: 'Neon', color: '#ccff00' },
  { id: 'aurora', label: 'Aurora', color: '#a78bfa' },
];

const NAV_ITEMS = [
  { id: 'hero', label: 'Home', icon: '🏠' },
  { id: 'requirements', label: 'Requirements', icon: '📋' },
  { id: 'downloads', label: 'Downloads', icon: '📥' },
  { id: 'local-setup', label: 'Local Setup', icon: '💻' },
  { id: 'builder', label: 'Command Builder', icon: '🚀' },
  { id: 'github', label: 'Git Workflow', icon: '🔀' },
  { id: 'troubleshoot', label: 'Fixes', icon: '🛠' },
  { id: 'manager', label: 'Manager', icon: '⚙️' },
  { id: 'update', label: 'Updates', icon: '🔄' },
  { id: 'deploy', label: 'Vercel Deploy', icon: '🚀' },
  { id: 'rules', label: 'Rules', icon: '📜' },
];

const GIT_COMMANDS = [
  { cmd: 'git init', purpose: 'Initialize new repository', tip: 'Creates .git folder' },
  { cmd: 'git add .', purpose: 'Stage all changes', tip: 'Use git status first' },
  { cmd: 'git commit -m "msg"', purpose: 'Create local snapshot', tip: 'Keep messages descriptive' },
  { cmd: 'git push origin main', purpose: 'Sync to Cloud', tip: 'Main is standard branch' },
  { cmd: 'git pull origin main', purpose: 'Sync Cloud → Local', tip: 'Always pull before push' },
  { cmd: 'git branch feature-x', purpose: 'Create new branch', tip: 'Isolate features' },
  { cmd: 'git merge feature-x', purpose: 'Merge branch', tip: 'Resolve conflicts' },
  { cmd: 'git log --oneline', purpose: 'View commit history', tip: 'Add --graph for tree' },
];

// ===== HOOKS =====
function useLocalStorage<T>(key: string, initial: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(value)); }, [key, value]);
  return [value, setValue];
}

// ===== UTILITY COMPONENTS =====
function GlassCard({ children, className = '', style, ...props }: {
  children: ReactNode; className?: string; style?: React.CSSProperties;
  [key: string]: unknown;
}) {
  return (
    <div className={`glass-card p-6 ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}

function TerminalBlock({ code, label = 'Terminal', onCopy }: { code: string; label?: string; onCopy?: () => void }) {
  return (
    <div className="terminal my-4">
      <div className="terminal-bar">
        <div className="terminal-dot" style={{ background: '#ff5f57' }} />
        <div className="terminal-dot" style={{ background: '#febc2e' }} />
        <div className="terminal-dot" style={{ background: '#28c840' }} />
        <span className="ml-3 text-xs" style={{ color: 'var(--text-dim)' }}>{label}</span>
        {onCopy && (
          <button onClick={onCopy} className="ml-auto btn-ghost !p-1.5 !text-xs" title="Copy">
            <Copy size={12} />
          </button>
        )}
      </div>
      <div className="terminal-code">{code}</div>
    </div>
  );
}

function SectionTitle({ icon, children, color, subtitle }: { icon: ReactNode; children: ReactNode; color?: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-bold pb-3"
        style={{ color: color || 'var(--accent)', borderBottom: '1px solid var(--border)' }}>
        {icon}
        <span className={!color ? 'gradient-text' : ''}>{children}</span>
      </h2>
      {subtitle && <p className="text-sm mt-2" style={{ color: 'var(--text-dim)' }}>{subtitle}</p>}
    </div>
  );
}

function Badge({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span className="text-xs px-2 py-0.5 rounded-md font-mono"
      style={{ background: color ? `${color}20` : 'rgba(255,255,255,0.05)', color: color || 'var(--accent)' }}>
      {children}
    </span>
  );
}

function StepItem({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <div className="step-item">
      <div className="step-number">{number}</div>
      <h4 className="font-bold text-base mb-2" style={{ color: 'var(--text)' }}>{title}</h4>
      <div className="text-sm" style={{ color: 'var(--text-dim)' }}>{children}</div>
    </div>
  );
}

// ===== TOAST =====
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) {
  const [exiting, setExiting] = useState(false);
  const iconMap = { success: <Check size={18} />, error: <AlertCircle size={18} />, info: <Info size={18} /> };
  const colorMap = { success: 'var(--success)', error: 'var(--error)', info: 'var(--accent)' };

  useEffect(() => {
    const timer = setTimeout(() => { setExiting(true); setTimeout(onClose, 300); }, 2200);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[1000] flex items-center gap-3 px-5 py-3 rounded-2xl max-w-md shadow-2xl ${exiting ? 'toast-exit' : 'toast-enter'}`}
      style={{ background: 'var(--card-solid)', border: `1px solid ${colorMap[type]}`, color: 'var(--text)' }}>
      <span style={{ color: colorMap[type] }}>{iconMap[type]}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={() => { setExiting(true); setTimeout(onClose, 300); }}
        className="ml-2 p-1 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-dim)' }}>
        <X size={14} />
      </button>
    </div>
  );
}

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const h = () => { const s = window.scrollY; const d = document.documentElement.scrollHeight - window.innerHeight; setProgress(d > 0 ? (s / d) * 100 : 0); };
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const h = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  if (!visible) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 left-6 z-50 p-3 rounded-2xl shadow-xl transition-all hover:scale-110"
      style={{ background: 'var(--card-solid)', border: '1px solid var(--border)', color: 'var(--accent)' }}>
      <ArrowUp size={20} />
    </button>
  );
}

function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { label: 'Search Documentation', key: 'Ctrl + K' },
    { label: 'Generate & Copy Command', key: 'Ctrl + Enter' },
    { label: 'Cycle Theme', key: 'Alt + T' },
    { label: 'Close Modals', key: 'Esc' },
    { label: 'Show Shortcuts', key: '?' },
  ];
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="glass-card p-8 w-full max-w-lg" onClick={e => e.stopPropagation()} style={{ animation: 'slide-up 0.3s ease-out' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold flex items-center gap-3" style={{ color: 'var(--accent)' }}>
            <Keyboard size={24} /> Keyboard Shortcuts
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-dim)' }}><X size={20} /></button>
        </div>
        <div className="space-y-1">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-white/5"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-sm" style={{ color: 'var(--text-dim)' }}>{s.label}</span>
              <span className="kbd">{s.key}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="btn-primary w-full justify-center mt-6">Got it!</button>
      </div>
    </div>
  );
}

// ===== HEADER =====
function Header({ theme, setTheme, searchQuery, setSearchQuery, onShortcuts }: {
  theme: Theme; setTheme: (t: Theme) => void; searchQuery: string; setSearchQuery: (q: string) => void; onShortcuts: () => void;
}) {
  const [mobileMenu, setMobileMenu] = useState(false);
  return (
    <header className="sticky top-0 z-50" style={{ background: 'var(--header-bg)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <h1 className="text-lg md:text-xl font-bold flex items-center gap-2 shrink-0 gradient-text">
          <ShieldCheck size={24} />
          <span className="hidden sm:inline">Sudhir's Toolset Pro</span>
          <span className="sm:hidden">Toolset</span>
        </h1>
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="flex items-center gap-2 p-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)' }}>
            {THEMES.map(t => (
              <button key={t.id} className={`theme-dot ${theme === t.id ? 'active' : ''}`}
                style={{ background: t.color }} onClick={() => setTheme(t.id)} title={t.label} />
            ))}
          </div>
          <div className="relative hidden sm:block flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input id="searchBar" type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search... (Ctrl+K)" className="form-input pl-9 pr-3 py-2 text-sm w-full" />
          </div>
          <button onClick={onShortcuts} className="p-2 rounded-lg hover:bg-white/5 hide-mobile" style={{ color: 'var(--text-dim)' }} title="Shortcuts"><Keyboard size={18} /></button>
          <button className="sm:hidden p-2 rounded-lg hover:bg-white/5" style={{ color: 'var(--text-dim)' }} onClick={() => setMobileMenu(!mobileMenu)}><Menu size={20} /></button>
        </div>
      </div>
      {mobileMenu && (
        <div className="sm:hidden px-4 pb-3 space-y-2" style={{ animation: 'slide-up 0.2s ease-out' }}>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search..." className="form-input pl-9 pr-3 py-2 text-sm w-full" />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {NAV_ITEMS.map(item => (
              <a key={item.id} href={`#${item.id}`} className="nav-pill text-xs" onClick={() => setMobileMenu(false)}>
                {item.icon} {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

// ===== HERO SECTION =====
function HeroSection({ visible }: { visible: boolean }) {
  const platform = navigator.userAgent.includes('Win') ? 'Windows' : navigator.userAgent.includes('Mac') ? 'macOS' : 'Linux';
  return (
    <section id="hero" className={`animate-section mb-16 ${visible ? 'visible' : ''}`}>
      <div className="text-center py-12 md:py-20 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]" style={{ background: 'var(--accent)', animation: 'hero-glow 4s infinite' }} />
        </div>
        <div className="relative z-10">
          <div className="hero-badge mb-6 mx-auto w-fit">
            <Sparkles size={14} /> v3.0 — Pro Edition
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 gradient-text leading-tight">
            Media & Git<br />Toolset Pro
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-3" style={{ color: 'var(--text-dim)' }}>
            Complete developer toolkit — yt-dlp command generator, FFmpeg setup,<br className="hidden md:block" />
            Git workflow, local system guide & Vercel deployment
          </p>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            By <strong className="gradient-text">Sudhir</strong> • Detected: <Badge>{platform}</Badge>
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="#local-setup" className="btn-primary"><Download size={18} /> Start Setup Guide</a>
            <a href="#builder" className="btn-ghost"><Cpu size={18} /> Command Builder</a>
            <a href="#downloads" className="btn-ghost"><Package size={18} /> Download Tools</a>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[
          { icon: <Globe size={20} />, label: '1000+ Sites', desc: 'Supported' },
          { icon: <Monitor size={20} />, label: '3 OS', desc: 'Win/Mac/Linux' },
          { icon: <Zap size={20} />, label: '4K HDR', desc: 'Max Quality' },
          { icon: <Shield size={20} />, label: '100% Free', desc: 'Open Source' },
        ].map((s, i) => (
          <GlassCard key={i} className="!p-4 text-center">
            <div className="mx-auto mb-2 p-2 rounded-xl w-fit" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>{s.icon}</div>
            <div className="font-bold text-sm" style={{ color: 'var(--accent)' }}>{s.label}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

// ===== SYSTEM REQUIREMENTS =====
function RequirementsSection({ visible }: { visible: boolean }) {
  return (
    <section id="requirements" className={`animate-section mb-16 ${visible ? 'visible' : ''}`}>
      <SectionTitle icon={<HardDrive size={28} />} subtitle="Minimum system requirements to run all tools smoothly">
        System Requirements
      </SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassCard>
          <h4 className="font-bold text-base flex items-center gap-2 mb-4" style={{ color: 'var(--accent)' }}>
            <Monitor size={18} /> Hardware Requirements
          </h4>
          <div className="space-y-3">
            {[
              { label: 'OS', value: 'Windows 10/11, macOS 10.15+, Ubuntu 20.04+', icon: <MonitorSmartphone size={16} /> },
              { label: 'RAM', value: '4 GB minimum (8 GB recommended)', icon: <HardDrive size={16} /> },
              { label: 'Storage', value: '500 MB for tools + space for downloads', icon: <FolderOpen size={16} /> },
              { label: 'Internet', value: 'Stable broadband connection', icon: <Wifi size={16} /> },
              { label: 'CPU', value: 'Any modern x64 processor', icon: <Cpu size={16} /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span style={{ color: 'var(--accent)' }}>{item.icon}</span>
                <div className="flex-1">
                  <span className="text-xs font-semibold block" style={{ color: 'var(--text-dim)' }}>{item.label}</span>
                  <span className="text-sm">{item.value}</span>
                </div>
                <CheckCircle size={14} style={{ color: 'var(--success)' }} />
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h4 className="font-bold text-base flex items-center gap-2 mb-4" style={{ color: 'var(--accent)' }}>
            <Package size={18} /> Software Requirements
          </h4>
          <div className="space-y-3">
            {[
              { name: 'yt-dlp', version: 'Latest', desc: 'Core download engine', required: true, link: 'https://github.com/yt-dlp/yt-dlp' },
              { name: 'FFmpeg', version: '5.0+', desc: 'Video/Audio merging engine', required: true, link: 'https://ffmpeg.org/download.html' },
              { name: 'Git', version: '2.30+', desc: 'Version control system', required: false, link: 'https://git-scm.com/downloads' },
              { name: 'Node.js', version: '18+', desc: 'For Vercel deployment', required: false, link: 'https://nodejs.org/' },
              { name: 'Python', version: '3.8+', desc: 'yt-dlp dependency (optional)', required: false, link: 'https://www.python.org/downloads/' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{item.name}</span>
                    <Badge>{item.version}</Badge>
                    {item.required && <Badge color="var(--error)">Required</Badge>}
                  </div>
                  <span className="text-xs block mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
                </div>
                <a href={item.link} target="_blank" rel="noreferrer" className="btn-ghost !p-1.5" title="Download">
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard style={{ borderLeft: '4px solid var(--warn)' }}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--warn)' }} />
          <div>
            <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--warn)' }}>Important Notes</h4>
            <ul className="text-sm space-y-1" style={{ color: 'var(--text-dim)' }}>
              <li>• FFmpeg <strong>must be in system PATH</strong> for yt-dlp to merge video+audio</li>
              <li>• Windows users: Use <strong>PowerShell</strong> (not CMD) for best experience</li>
              <li>• macOS users: Install <strong>Homebrew</strong> first if not already installed</li>
              <li>• Linux users: Use your package manager (apt, yum, pacman, etc.)</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

// ===== DOWNLOAD LINKS =====
function DownloadLinksSection({ visible, copyText }: { visible: boolean; copyText: (t: string) => void }) {
  const tools = [
    {
      name: 'yt-dlp',
      desc: 'Primary media download engine. Supports YouTube, Twitter, Instagram & 1000+ sites.',
      icon: <Download size={24} />,
      color: '#38bdf8',
      links: [
        { label: 'GitHub Releases', url: 'https://github.com/yt-dlp/yt-dlp/releases/latest', primary: true },
        { label: 'Windows EXE', url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe', primary: false },
        { label: 'macOS Binary', url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos', primary: false },
        { label: 'Linux Binary', url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp', primary: false },
      ],
      installCmds: { windows: 'winget install yt-dlp', macos: 'brew install yt-dlp', linux: 'sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && sudo chmod a+rx /usr/local/bin/yt-dlp' },
    },
    {
      name: 'FFmpeg',
      desc: 'Multimedia framework for merging video+audio, transcoding, and format conversion.',
      icon: <Cpu size={24} />,
      color: '#10b981',
      links: [
        { label: 'Official Site', url: 'https://ffmpeg.org/download.html', primary: true },
        { label: 'Windows Build (Gyan.dev)', url: 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip', primary: false },
        { label: 'macOS (Homebrew)', url: 'https://formulae.brew.sh/formula/ffmpeg', primary: false },
      ],
      installCmds: { windows: 'winget install ffmpeg', macos: 'brew install ffmpeg', linux: 'sudo apt install ffmpeg' },
    },
    {
      name: 'Git',
      desc: 'Distributed version control system for tracking code changes.',
      icon: <GitBranch size={24} />,
      color: '#f05032',
      links: [
        { label: 'Official Downloads', url: 'https://git-scm.com/downloads', primary: true },
        { label: 'Windows Installer', url: 'https://git-scm.com/download/win', primary: false },
        { label: 'GitHub Desktop', url: 'https://desktop.github.com/', primary: false },
      ],
      installCmds: { windows: 'winget install Git.Git', macos: 'brew install git', linux: 'sudo apt install git' },
    },
    {
      name: 'Node.js',
      desc: 'JavaScript runtime needed for Vercel CLI, npm packages & web development.',
      icon: <Server size={24} />,
      color: '#68a063',
      links: [
        { label: 'Official Downloads', url: 'https://nodejs.org/en/download', primary: true },
        { label: 'LTS Version (Recommended)', url: 'https://nodejs.org/', primary: false },
      ],
      installCmds: { windows: 'winget install OpenJS.NodeJS.LTS', macos: 'brew install node', linux: 'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs' },
    },
    {
      name: 'Python',
      desc: 'Programming language. Required only if installing yt-dlp via pip.',
      icon: <BookOpen size={24} />,
      color: '#3776ab',
      links: [
        { label: 'Official Downloads', url: 'https://www.python.org/downloads/', primary: true },
      ],
      installCmds: { windows: 'winget install Python.Python.3.12', macos: 'brew install python', linux: 'sudo apt install python3 python3-pip' },
    },
  ];

  return (
    <section id="downloads" className={`animate-section mb-16 ${visible ? 'visible' : ''}`}>
      <SectionTitle icon={<Package size={28} />} subtitle="Official download links for all required & optional tools">
        Download Links & Installation
      </SectionTitle>

      <div className="space-y-4">
        {tools.map((tool, i) => (
          <GlassCard key={i}>
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="dl-icon shrink-0" style={{ background: `${tool.color}20`, color: tool.color }}>
                {tool.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-lg">{tool.name}</h4>
                  <Badge color={tool.color}>Official</Badge>
                </div>
                <p className="text-sm mb-3" style={{ color: 'var(--text-dim)' }}>{tool.desc}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {tool.links.map((link, j) => (
                    <a key={j} href={link.url} target="_blank" rel="noreferrer"
                      className={link.primary ? 'btn-primary text-xs' : 'btn-ghost text-xs'}>
                      {link.primary ? <Download size={14} /> : <ExternalLink size={14} />}
                      {link.label}
                    </a>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button className="btn-ghost text-xs" onClick={() => copyText(tool.installCmds.windows)}>
                    <Monitor size={12} /> Windows CMD
                  </button>
                  <button className="btn-ghost text-xs" onClick={() => copyText(tool.installCmds.macos)}>
                    <Apple size={12} /> macOS CMD
                  </button>
                  <button className="btn-ghost text-xs" onClick={() => copyText(tool.installCmds.linux)}>
                    <Server size={12} /> Linux CMD
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

// ===== LOCAL SETUP GUIDE =====
function LocalSetupSection({ visible, copyText, showToast }: { visible: boolean; copyText: (t: string) => void; showToast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  const [activeOs, setActiveOs] = useState<OsType>(() => {
    if (navigator.userAgent.includes('Win')) return 'windows';
    if (navigator.userAgent.includes('Mac')) return 'macos';
    return 'linux';
  });

  const setupGuides: Record<OsType, { steps: { title: string; desc: string; cmd: string }[]; verifyCmd: string; pathCmd: string }> = {
    windows: {
      steps: [
        {
          title: 'Install yt-dlp via WinGet',
          desc: 'Open PowerShell as Administrator and run:',
          cmd: 'winget install yt-dlp',
        },
        {
          title: 'Install FFmpeg via WinGet',
          desc: 'Same PowerShell window:',
          cmd: 'winget install ffmpeg',
        },
        {
          title: 'OR Manual Install (Alternative)',
          desc: 'Download yt-dlp.exe from GitHub, place in C:\\yt-dlp\\ and add to PATH:',
          cmd: `# 1. Download yt-dlp.exe from GitHub Releases
# 2. Create folder: C:\\yt-dlp\\
# 3. Move yt-dlp.exe to C:\\yt-dlp\\
# 4. Add to PATH:
# Settings → System → About → Advanced → Environment Variables
# Edit PATH → Add: C:\\yt-dlp\\

# For FFmpeg:
# 1. Download from gyan.dev/ffmpeg
# 2. Extract to C:\\ffmpeg\\
# 3. Add C:\\ffmpeg\\bin to PATH

# Quick PATH set (temporary, current session only):
set PATH=C:\\yt-dlp;C:\\ffmpeg\\bin;%PATH%`,
        },
        {
          title: 'Install Git (Optional)',
          desc: 'For version control & GitHub:',
          cmd: 'winget install Git.Git',
        },
        {
          title: 'Verify All Installations',
          desc: 'Check everything is working:',
          cmd: `yt-dlp --version
ffmpeg -version
git --version`,
        },
      ],
      verifyCmd: 'yt-dlp --version && ffmpeg -version && git --version',
      pathCmd: 'set PATH=C:\\yt-dlp;C:\\ffmpeg\\bin;%PATH%',
    },
    macos: {
      steps: [
        {
          title: 'Install Homebrew (if not installed)',
          desc: 'Package manager for macOS:',
          cmd: '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
        },
        {
          title: 'Install yt-dlp',
          desc: 'Using Homebrew:',
          cmd: 'brew install yt-dlp',
        },
        {
          title: 'Install FFmpeg',
          desc: 'Using Homebrew:',
          cmd: 'brew install ffmpeg',
        },
        {
          title: 'Install Git (usually pre-installed)',
          desc: 'Just in case:',
          cmd: 'brew install git',
        },
        {
          title: 'Verify Installations',
          desc: 'Check everything:',
          cmd: `yt-dlp --version
ffmpeg -version
git --version`,
        },
      ],
      verifyCmd: 'yt-dlp --version && ffmpeg -version && git --version',
      pathCmd: 'export PATH="/usr/local/bin:$PATH"',
    },
    linux: {
      steps: [
        {
          title: 'Update System Packages',
          desc: 'Always update first:',
          cmd: 'sudo apt update && sudo apt upgrade -y',
        },
        {
          title: 'Install FFmpeg',
          desc: 'Via package manager:',
          cmd: 'sudo apt install ffmpeg -y',
        },
        {
          title: 'Install yt-dlp',
          desc: 'Download latest binary:',
          cmd: `sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp`,
        },
        {
          title: 'OR Install via pip',
          desc: 'Alternative method using Python pip:',
          cmd: `sudo apt install python3 python3-pip -y
pip3 install yt-dlp`,
        },
        {
          title: 'Install Git',
          desc: 'Version control:',
          cmd: 'sudo apt install git -y',
        },
        {
          title: 'Verify All',
          desc: 'Check installations:',
          cmd: `yt-dlp --version
ffmpeg -version
git --version`,
        },
      ],
      verifyCmd: 'yt-dlp --version && ffmpeg -version && git --version',
      pathCmd: 'export PATH="$HOME/.local/bin:$PATH"',
    },
  };

  const guide = setupGuides[activeOs];

  const copyAllSteps = () => {
    const allCmds = guide.steps.map(s => `# ${s.title}\n${s.cmd}`).join('\n\n');
    copyText(allCmds);
    showToast('All commands copied!');
  };

  return (
    <section id="local-setup" className={`animate-section mb-16 ${visible ? 'visible' : ''}`}>
      <SectionTitle icon={<TerminalIcon size={28} />} subtitle="Step-by-step guide to set up everything on your local machine">
        Local System Setup Guide
      </SectionTitle>

      {/* OS Tabs */}
      <div className="flex gap-0 mb-0 overflow-x-auto">
        {([
          { id: 'windows' as OsType, label: 'Windows', icon: <Monitor size={16} /> },
          { id: 'macos' as OsType, label: 'macOS', icon: <Apple size={16} /> },
          { id: 'linux' as OsType, label: 'Linux', icon: <Server size={16} /> },
        ]).map(os => (
          <button key={os.id} className={`os-tab flex items-center gap-2 ${activeOs === os.id ? 'active' : ''}`}
            onClick={() => setActiveOs(os.id)}>
            {os.icon} {os.label}
          </button>
        ))}
      </div>

      <GlassCard className="!rounded-tl-none" style={{ borderTop: '2px solid var(--accent)' }}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            {activeOs === 'windows' ? <Monitor size={20} /> : activeOs === 'macos' ? <Apple size={20} /> : <Server size={20} />}
            {activeOs === 'windows' ? 'Windows' : activeOs === 'macos' ? 'macOS' : 'Linux/Ubuntu'} Setup
          </h3>
          <button className="btn-primary text-sm" onClick={copyAllSteps}>
            <Copy size={14} /> Copy All Commands
          </button>
        </div>

        {/* Steps */}
        <div className="mb-6">
          {guide.steps.map((step, i) => (
            <StepItem key={i} number={i + 1} title={step.title}>
              <p className="mb-2">{step.desc}</p>
              <TerminalBlock code={step.cmd} label={`Step ${i + 1}`} onCopy={() => copyText(step.cmd)} />
            </StepItem>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
          <button className="btn-success text-sm" onClick={() => copyText(guide.verifyCmd)}>
            <CheckCircle size={14} /> Copy Verify Command
          </button>
          <button className="btn-warn text-sm" onClick={() => copyText(guide.pathCmd)}>
            <Link size={14} /> Copy PATH Fix
          </button>
        </div>
      </GlassCard>

      {/* Common Folder Structure */}
      <GlassCard className="mt-4">
        <h4 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--accent)' }}>
          <FolderOpen size={18} /> Recommended Folder Structure
        </h4>
        <TerminalBlock label="Folder Structure" code={activeOs === 'windows' ?
`📁 D:\\
├── 📁 Videos\\          ← Downloaded videos go here
├── 📁 Music\\           ← Downloaded audio go here
├── 📁 yt-dlp\\          ← yt-dlp.exe location
│   └── yt-dlp.exe
├── 📁 ffmpeg\\          ← FFmpeg location
│   └── 📁 bin\\
│       ├── ffmpeg.exe
│       ├── ffplay.exe
│       └── ffprobe.exe
└── 📁 Projects\\        ← Git projects folder` :
`📁 ~/
├── 📁 Videos/           ← Downloaded videos
├── 📁 Music/            ← Downloaded audio
├── 📁 Projects/         ← Git projects
└── 📁 .local/bin/       ← User binaries (yt-dlp)`
        } />
      </GlassCard>
    </section>
  );
}

// ===== COMMAND BUILDER =====
function CommandBuilder({ copyText, showToast, visible }: {
  copyText: (t: string) => void; showToast: (m: string, t?: 'success' | 'error' | 'info') => void; visible: boolean;
}) {
  const [state, setState] = useState<BuilderState>({ type: 'video', format: 'mp4', quality: 'best', speed: 'normal', scope: 'single', url: '' });
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('sudhir-history', []);
  const [favorites, setFavorites] = useLocalStorage<string[]>('sudhir-favs', []);
  const [showFavs, setShowFavs] = useState(false);
  const [extraFlags, setExtraFlags] = useState('');
  const idCounter = useRef(0);
  const update = (patch: Partial<BuilderState>) => setState(prev => ({ ...prev, ...patch }));

  const generateCommand = useCallback(() => {
    const { type, format, quality, speed, scope, url } = state;
    const urlStr = url.trim() || 'URL_LINK';
    const path = type === 'video' ? 'D:\\\\Videos\\\\' : 'D:\\\\Music\\\\';
    const filename = scope === 'playlist' ? '%(playlist_index)s - %(title)s.%(ext)s' : '%(title)s.%(ext)s';
    let cmd = 'yt-dlp ';
    if (speed === 'fast') cmd += '-N 8 --concurrent-fragments 5 ';
    if (type === 'audio') {
      cmd += `-f "bestaudio" -x --audio-format ${format} --audio-quality 0 --embed-thumbnail --add-metadata `;
    } else {
      const hf = quality === '1080' ? '[height<=1080]' : quality === '720' ? '[height<=720]' : '';
      cmd += `-f "bestvideo${hf}+bestaudio/best" --merge-output-format ${format} --embed-thumbnail --add-metadata `;
    }
    cmd += `-o "${path}${filename}" "${urlStr}"`;
    if (extraFlags.trim()) cmd += ' ' + extraFlags.trim();
    return cmd;
  }, [state, extraFlags]);

  const command = generateCommand();
  const hasWarning = state.type === 'video' && (state.format === 'mp3' || state.format === 'm4a');

  const copyAndLog = () => {
    copyText(command);
    setHistory(prev => {
      const item: HistoryItem = { cmd: command, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), id: ++idCounter.current };
      return [item, ...prev].slice(0, 8);
    });
  };

  const saveFav = () => {
    if (favorites.includes(command)) { showToast('Already in favorites', 'info'); return; }
    setFavorites(prev => [...prev, command]);
    showToast('Saved to favorites!');
  };

  const applyPreset = (preset: string) => {
    switch (preset) {
      case 'yt-music': update({ type: 'audio', format: 'mp3', quality: 'best' }); break;
      case '1080p': update({ type: 'video', format: 'mp4', quality: '1080' }); break;
      case '4k': update({ type: 'video', format: 'mkv', quality: 'best' }); break;
      case 'playlist': update({ scope: 'playlist' }); break;
    }
    showToast('Preset applied!');
  };

  const formatOptions = state.type === 'audio'
    ? [{ v: 'mp3', l: 'MP3 (Universal)' }, { v: 'm4a', l: 'M4A (Apple)' }, { v: 'opus', l: 'Opus (Efficient)' }, { v: 'flac', l: 'FLAC (Lossless)' }]
    : [{ v: 'mp4', l: 'MP4 (Standard)' }, { v: 'mkv', l: 'MKV (Pro)' }, { v: 'webm', l: 'WebM (Web)' }];

  return (
    <section id="builder" className={`animate-section mb-16 ${visible ? 'visible' : ''}`}>
      <SectionTitle icon={<Cpu size={28} />} subtitle="Generate yt-dlp commands with smart presets and validation">
        Smart Command Generator
      </SectionTitle>

      <div className="flex flex-wrap gap-2 mb-5">
        <button className="btn-ghost text-sm" onClick={() => applyPreset('yt-music')}><Music size={16} /> YT Music</button>
        <button className="btn-ghost text-sm" onClick={() => applyPreset('1080p')}><Tv size={16} /> 1080p Video</button>
        <button className="btn-ghost text-sm" onClick={() => applyPreset('4k')}><Sparkles size={16} /> Best Quality</button>
        <button className="btn-ghost text-sm" onClick={() => applyPreset('playlist')}><ListVideo size={16} /> Full Playlist</button>
      </div>

      <GlassCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center justify-between" style={{ color: 'var(--text-dim)' }}>
              Media Type <Badge>{state.type === 'video' ? 'D:\\Videos\\' : 'D:\\Music\\'}</Badge>
            </label>
            <select className="form-select" value={state.type} onChange={e => update({ type: e.target.value as 'video' | 'audio' })}>
              <option value="video">🎬 Video (Best Quality)</option>
              <option value="audio">🎵 Music / Audio Only</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-dim)' }}>Format</label>
            <select className="form-select" value={state.format} onChange={e => update({ format: e.target.value })}>
              {formatOptions.map(f => <option key={f.v} value={f.v}>{f.l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-dim)' }}>Quality</label>
            <select className="form-select" value={state.quality} onChange={e => update({ quality: e.target.value })}>
              <option value="best">🏆 Original Best</option>
              <option value="1080">📺 1080p HD</option>
              <option value="720">⚡ 720p Balanced</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-dim)' }}>Speed</label>
            <select className="form-select" value={state.speed} onChange={e => update({ speed: e.target.value })}>
              <option value="normal">🐢 Normal (Stable)</option>
              <option value="fast">🚀 Turbo (8 Threads)</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-dim)' }}>Scope</label>
            <select className="form-select" value={state.scope} onChange={e => update({ scope: e.target.value as 'single' | 'playlist' })}>
              <option value="single">📄 Single Item</option>
              <option value="playlist">📁 Full Playlist</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-dim)' }}>URL</label>
            <input type="text" className="form-input" placeholder="https://youtube.com/..." value={state.url} onChange={e => update({ url: e.target.value })} />
          </div>
        </div>
        <div className="mb-4">
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Additional Flags (advanced)</label>
          <input type="text" className="form-input text-sm" placeholder="e.g. --rate-limit 1M --retries 10" value={extraFlags} onChange={e => setExtraFlags(e.target.value)} />
        </div>
        {hasWarning && (
          <div className="flex items-center gap-2 text-sm mb-4 p-3 rounded-xl" style={{ color: 'var(--warn)', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <AlertTriangle size={16} /> Using audio format for Video is not recommended.
          </div>
        )}
        <TerminalBlock code={command} label="Auto-Generated Command" onCopy={copyAndLog} />
        <div className="flex flex-wrap gap-3 mt-4">
          <button className="btn-primary" onClick={copyAndLog}><Copy size={16} /> Copy Command</button>
          <button className="btn-success" onClick={saveFav}><Star size={16} /> Save to Favs</button>
          <button className="btn-ghost text-sm" onClick={() => setShowFavs(!showFavs)}><FolderHeart size={16} /> Favorites ({favorites.length})</button>
        </div>
      </GlassCard>

      {showFavs && favorites.length > 0 && (
        <div className="mt-6 space-y-3" style={{ animation: 'slide-up 0.3s ease-out' }}>
          <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: 'var(--text-dim)' }}><FolderHeart size={18} /> Saved Commands</h3>
          {favorites.map((fav, i) => (
            <GlassCard key={i} className="!p-4" style={{ borderLeft: '3px solid var(--accent)' }}>
              <code className="text-xs block mb-3 break-all" style={{ color: 'var(--success)' }}>{fav}</code>
              <div className="flex gap-2">
                <button className="btn-ghost text-xs" onClick={() => copyText(fav)}><Copy size={12} /> Copy</button>
                <button className="btn-ghost text-xs" style={{ color: 'var(--error)' }} onClick={() => { setFavorites(prev => prev.filter((_, idx) => idx !== i)); showToast('Removed'); }}><Trash2 size={12} /> Delete</button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--text-dim)' }}><History size={18} /> Recent</h3>
          <div className="space-y-2">
            {history.map(item => (
              <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)' }} onClick={() => copyText(item.cmd)}>
                <code className="text-xs flex-1 break-all" style={{ color: 'var(--success)' }}>{item.cmd.length > 80 ? item.cmd.slice(0, 80) + '...' : item.cmd}</code>
                <div className="flex items-center gap-2 shrink-0"><Clock size={12} style={{ color: 'var(--text-muted)' }} /><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.time}</span></div>
              </div>
            ))}
          </div>
          <button className="btn-ghost text-xs mt-3" onClick={() => { setHistory([]); showToast('History cleared'); }}><Trash2 size={12} /> Clear History</button>
        </div>
      )}
    </section>
  );
}

// ===== GIT SECTION =====
function GitSection({ visible, copyText }: { visible: boolean; copyText: (t: string) => void }) {
  return (
    <section id="github" className={`animate-section mb-16 ${visible ? 'visible' : ''}`}>
      <SectionTitle icon={<GitBranch size={28} />} color="var(--git-color)" subtitle="Essential Git & GitHub commands for version control mastery">
        GitHub Mastery
      </SectionTitle>

      <GlassCard className="mb-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--git-color)' }}><BarChart3 size={18} /> Git Workflow</h4>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {[
            { label: 'Edit Files', color: 'var(--warn)' },
            { label: 'git add .', color: 'var(--accent)' },
            { label: 'git commit', color: 'var(--success)' },
            { label: 'git push', color: 'var(--git-color)' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg font-mono text-xs font-bold" style={{ background: `${step.color}20`, color: step.color, border: `1px solid ${step.color}40` }}>{step.label}</span>
              {i < 3 && <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />}
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="overflow-x-auto rounded-2xl" style={{ border: '1px solid var(--border)' }}>
        <table className="data-table">
          <thead><tr><th>Command</th><th>Purpose</th><th className="hide-mobile">Pro Tip</th><th style={{ width: '60px' }}></th></tr></thead>
          <tbody>
            {GIT_COMMANDS.map((row, i) => (
              <tr key={i}>
                <td><code>{row.cmd}</code></td>
                <td className="text-sm" style={{ color: 'var(--text-dim)' }}>{row.purpose}</td>
                <td className="text-xs hide-mobile" style={{ color: 'var(--text-muted)' }}>{row.tip}</td>
                <td><button className="btn-ghost p-1.5 !rounded-lg" onClick={() => copyText(row.cmd)} title="Copy"><Copy size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GlassCard className="mt-6">
        <details>
          <summary className="flex items-center gap-2 font-semibold cursor-pointer" style={{ color: 'var(--accent)' }}>
            <ChevronDown size={18} className="chevron-icon" /> Advanced Git Commands
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { cmd: 'git stash', desc: 'Save uncommitted changes temporarily' },
              { cmd: 'git stash pop', desc: 'Restore stashed changes' },
              { cmd: 'git rebase main', desc: 'Rebase current branch on main' },
              { cmd: 'git cherry-pick <hash>', desc: 'Apply specific commit' },
              { cmd: 'git reset --soft HEAD~1', desc: 'Undo last commit (keep changes)' },
              { cmd: 'git diff --staged', desc: 'View staged changes' },
            ].map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-2 p-3 rounded-xl cursor-pointer hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)' }} onClick={() => copyText(item.cmd)}>
                <div>
                  <code className="text-xs" style={{ color: 'var(--git-color)' }}>{item.cmd}</code>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
                <Copy size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--text-muted)' }} />
              </div>
            ))}
          </div>
        </details>
      </GlassCard>
    </section>
  );
}

// ===== TROUBLESHOOTING =====
function TroubleshootingSection({ visible, copyText }: { visible: boolean; copyText: (t: string) => void }) {
  const issues = [
    { icon: <AlertCircle size={20} />, title: 'No Audio / Merge Failed', hint: 'FFmpeg not in PATH', fix: 'set PATH=C:\\ffmpeg\\bin;%PATH%', color: 'var(--warn)' },
    { icon: <Zap size={20} />, title: 'Slow / Fragmented', hint: 'Fix speed & connection drops', fix: '-N 8 --concurrent-fragments 5', color: 'var(--accent)' },
    { icon: <Globe size={20} />, title: 'Geo-Blocked', hint: 'Bypass regional restrictions', fix: '--geo-bypass --proxy socks5://IP:PORT', color: 'var(--success)' },
    { icon: <WifiOff size={20} />, title: 'Network Errors', hint: 'Fix connection timeouts', fix: '--retries 10 --fragment-retries 50 --socket-timeout 30', color: 'var(--warn)' },
    { icon: <Lock size={20} />, title: 'Age-Restricted', hint: 'Use browser cookies', fix: '--cookies-from-browser chrome --user-agent "Mozilla/5.0"', color: 'var(--accent)' },
    { icon: <Layers size={20} />, title: 'Specific Format', hint: 'Extract exact streams', fix: '-f "bv[height<=1080][ext=mp4]+ba[ext=m4a]/b[ext=mp4]"', color: 'var(--success)' },
  ];

  return (
    <section id="troubleshoot" className={`animate-section mb-16 ${visible ? 'visible' : ''}`}>
      <SectionTitle icon={<Hammer size={28} />} subtitle="Common issues and their fixes — click any fix to copy">
        Troubleshooting & Fixes
      </SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {issues.map((issue, i) => (
          <GlassCard key={i}>
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2" style={{ color: issue.color }}>{issue.icon} {issue.title}</h4>
            <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>{issue.hint}</p>
            <div className="terminal !my-0">
              <div className="terminal-code !py-2 !px-3 !text-xs cursor-pointer hover:bg-white/5 transition-colors" onClick={() => copyText(issue.fix)}>{issue.fix}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard>
        <details>
          <summary className="flex items-center gap-2 font-semibold cursor-pointer" style={{ color: 'var(--accent)' }}>
            <ChevronDown size={18} className="chevron-icon" /> Pro Tips & Quick Fixes
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { cmd: 'yt-dlp -U', desc: 'Update yt-dlp to latest version' },
              { cmd: 'yt-dlp --rm-cache-dir', desc: 'Clear download cache' },
              { cmd: '--force-ipv4', desc: 'Force IPv4 connection' },
              { cmd: '--ignore-errors', desc: 'Continue on errors in playlists' },
              { cmd: '--add-metadata --embed-thumbnail', desc: 'Professional media library look' },
              { cmd: '--cookies-from-browser chrome', desc: 'Use browser login cookies' },
              { cmd: '--sleep-interval 3 --max-sleep-interval 6', desc: 'Avoid rate limiting' },
              { cmd: '--write-subs --sub-langs "en,hi"', desc: 'Download subtitles' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/5" style={{ background: 'rgba(255,255,255,0.02)' }} onClick={() => copyText(item.cmd)}>
                <div className="flex-1 min-w-0">
                  <code className="text-xs block truncate" style={{ color: 'var(--success)' }}>{item.cmd}</code>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
                </div>
                <Copy size={12} className="shrink-0" style={{ color: 'var(--text-muted)' }} />
              </div>
            ))}
          </div>
        </details>
      </GlassCard>
    </section>
  );
}

// ===== DOWNLOAD MANAGER =====
function DownloadManager({ visible, copyText }: { visible: boolean; copyText: (t: string) => void }) {
  const [rateLimit, setRateLimit] = useState('');
  const [retries, setRetries] = useState('10');
  const [fragments, setFragments] = useState('1');
  const [extraOptions, setExtraOptions] = useState<string[]>([]);

  const toggleOption = (opt: string) => setExtraOptions(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);

  const buildCmd = () => {
    const parts = ['yt-dlp'];
    if (rateLimit) parts.push(`--rate-limit ${rateLimit}`);
    if (parseInt(retries) > 0) parts.push(`--retries ${retries}`);
    if (parseInt(fragments) > 1) parts.push(`--concurrent-fragments ${fragments}`);
    extraOptions.forEach(opt => parts.push(opt));
    parts.push('URL_LINK');
    return parts.join(' ');
  };

  const opts = [
    { flag: '--continue', icon: <Play size={14} />, label: 'Resume', color: 'var(--accent)' },
    { flag: '--ignore-errors', icon: <Shield size={14} />, label: 'Ignore Errors', color: 'var(--warn)' },
    { flag: '--add-metadata --embed-thumbnail --embed-subs', icon: <Tag size={14} />, label: 'Full Metadata', color: 'var(--success)' },
    { flag: '--write-subs --sub-langs "en"', icon: <FileDown size={14} />, label: 'Subtitles', color: 'var(--accent)' },
    { flag: '--write-thumbnail', icon: <Download size={14} />, label: 'Thumbnails', color: 'var(--git-color)' },
  ];

  return (
    <section id="manager" className={`animate-section mb-16 ${visible ? 'visible' : ''}`}>
      <SectionTitle icon={<Settings size={28} />} subtitle="Fine-tune download behavior with advanced options">Download Manager</SectionTitle>
      <GlassCard>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          <div><label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-dim)' }}>Max Speed</label><select className="form-select" value={rateLimit} onChange={e => setRateLimit(e.target.value)}><option value="">♾️ Unlimited</option><option value="500K">500 KB/s</option><option value="1M">1 MB/s</option><option value="2M">2 MB/s</option><option value="5M">5 MB/s</option></select></div>
          <div><label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-dim)' }}>Retries</label><input type="number" className="form-input" value={retries} min="0" max="100" onChange={e => setRetries(e.target.value)} /></div>
          <div><label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-dim)' }}>Fragments</label><input type="number" className="form-input" value={fragments} min="1" max="20" onChange={e => setFragments(e.target.value)} /></div>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {opts.map(opt => {
            const active = extraOptions.includes(opt.flag);
            return (
              <button key={opt.flag} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all"
                style={{ background: active ? `${opt.color}15` : 'rgba(255,255,255,0.03)', color: active ? opt.color : 'var(--text-dim)', border: `1px solid ${active ? opt.color : 'var(--border)'}` }}
                onClick={() => toggleOption(opt.flag)}>
                {opt.icon} {opt.label} {active && <Check size={12} />}
              </button>
            );
          })}
        </div>
        <TerminalBlock code={buildCmd()} label="Manager Command" onCopy={() => copyText(buildCmd())} />
        <button className="btn-primary mt-3" onClick={() => copyText(buildCmd())}><Copy size={16} /> Copy Command</button>
      </GlassCard>
    </section>
  );
}

// ===== UPDATE GUIDE =====
function UpdateSection({ visible, copyText }: { visible: boolean; copyText: (t: string) => void }) {
  return (
    <section id="update" className={`animate-section mb-16 ${visible ? 'visible' : ''}`}>
      <SectionTitle icon={<RefreshCw size={28} />} subtitle="Keep your tools updated for best performance and new features">
        How to Update Tools
      </SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard>
          <h4 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--accent)' }}>
            <Download size={18} /> Update yt-dlp
          </h4>
          <div className="space-y-3">
            {[
              { label: 'Self-Update (Recommended)', cmd: 'yt-dlp -U', desc: 'Built-in auto updater' },
              { label: 'WinGet (Windows)', cmd: 'winget upgrade yt-dlp', desc: 'Via Windows package manager' },
              { label: 'Homebrew (macOS)', cmd: 'brew upgrade yt-dlp', desc: 'Via Homebrew' },
              { label: 'pip (Python)', cmd: 'pip3 install -U yt-dlp', desc: 'Via Python pip' },
              { label: 'Check Version', cmd: 'yt-dlp --version', desc: 'See current version' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors" style={{ background: 'rgba(255,255,255,0.02)' }} onClick={() => copyText(item.cmd)}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <Copy size={12} style={{ color: 'var(--text-muted)' }} />
                </div>
                <code className="text-xs block mt-1" style={{ color: 'var(--success)' }}>{item.cmd}</code>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard>
          <h4 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--success)' }}>
            <Cpu size={18} /> Update FFmpeg & Others
          </h4>
          <div className="space-y-3">
            {[
              { label: 'FFmpeg (WinGet)', cmd: 'winget upgrade ffmpeg', desc: 'Windows package manager' },
              { label: 'FFmpeg (Homebrew)', cmd: 'brew upgrade ffmpeg', desc: 'macOS Homebrew' },
              { label: 'FFmpeg (Linux)', cmd: 'sudo apt update && sudo apt upgrade ffmpeg', desc: 'APT package manager' },
              { label: 'Git Update', cmd: 'git update-git-for-windows', desc: 'Git self-updater (Windows)' },
              { label: 'Node.js (nvm)', cmd: 'nvm install --lts', desc: 'Node version manager' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors" style={{ background: 'rgba(255,255,255,0.02)' }} onClick={() => copyText(item.cmd)}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{item.label}</span>
                  <Copy size={12} style={{ color: 'var(--text-muted)' }} />
                </div>
                <code className="text-xs block mt-1" style={{ color: 'var(--success)' }}>{item.cmd}</code>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-4" style={{ borderLeft: '4px solid var(--accent)' }}>
        <div className="flex items-start gap-3">
          <Info size={20} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
          <div>
            <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--accent)' }}>Pro Tip: Auto-Update Before Download</h4>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Always run <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--accent)' }}>yt-dlp -U</code> before downloading to ensure you have the latest fixes and site support. YouTube frequently changes their systems, so keeping yt-dlp updated is crucial.
            </p>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

// ===== VERCEL DEPLOYMENT =====
function VercelDeploySection({ visible, copyText, showToast }: { visible: boolean; copyText: (t: string) => void; showToast: (m: string, t?: 'success' | 'error' | 'info') => void }) {
  return (
    <section id="deploy" className={`animate-section mb-16 ${visible ? 'visible' : ''}`}>
      <SectionTitle icon={<Rocket size={28} />} subtitle="Deploy this toolset or any web project on Vercel for free">
        Vercel Deployment Guide
      </SectionTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Method 1: GUI */}
        <GlassCard>
          <h4 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--accent)' }}>
            <Cloud size={18} /> Method 1: Vercel Dashboard (Easy)
          </h4>
          <div>
            <StepItem number={1} title="Push Code to GitHub">
              <p>Create a GitHub repo and push your project:</p>
              <TerminalBlock label="Git Commands" onCopy={() => copyText('git init\ngit add .\ngit commit -m "Initial commit"\ngit branch -M main\ngit remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git\ngit push -u origin main')}
                code={`git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main`} />
            </StepItem>
            <StepItem number={2} title="Connect to Vercel">
              <p>Go to <a href="https://vercel.com" target="_blank" rel="noreferrer" className="font-bold" style={{ color: 'var(--accent)' }}>vercel.com</a> → Sign up with GitHub → Click "New Project"</p>
            </StepItem>
            <StepItem number={3} title="Import Repository">
              <p>Select your GitHub repo → Vercel auto-detects framework → Click "Deploy"</p>
            </StepItem>
            <StepItem number={4} title="Done! 🎉">
              <p>Your site is live at <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--accent)' }}>your-project.vercel.app</code></p>
              <p className="mt-1">Every <code>git push</code> automatically re-deploys!</p>
            </StepItem>
          </div>
        </GlassCard>

        {/* Method 2: CLI */}
        <GlassCard>
          <h4 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--success)' }}>
            <TerminalIcon size={18} /> Method 2: Vercel CLI (Pro)
          </h4>
          <div>
            <StepItem number={1} title="Install Vercel CLI">
              <TerminalBlock label="Install" code="npm install -g vercel" onCopy={() => copyText('npm install -g vercel')} />
            </StepItem>
            <StepItem number={2} title="Login to Vercel">
              <TerminalBlock label="Login" code="vercel login" onCopy={() => copyText('vercel login')} />
            </StepItem>
            <StepItem number={3} title="Deploy from Project Folder">
              <p>Navigate to your project directory and run:</p>
              <TerminalBlock label="Deploy" code={`cd your-project-folder
vercel`} onCopy={() => copyText('vercel')} />
            </StepItem>
            <StepItem number={4} title="Production Deploy">
              <TerminalBlock label="Production" code="vercel --prod" onCopy={() => copyText('vercel --prod')} />
            </StepItem>
          </div>

          <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
            <h5 className="font-semibold text-sm mb-2 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
              <Wrench size={14} /> Useful CLI Commands
            </h5>
            <div className="space-y-1">
              {[
                { cmd: 'vercel ls', desc: 'List deployments' },
                { cmd: 'vercel logs', desc: 'View deploy logs' },
                { cmd: 'vercel env pull', desc: 'Pull env variables' },
                { cmd: 'vercel domains', desc: 'Manage custom domains' },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-white/5" onClick={() => copyText(c.cmd)}>
                  <code className="text-xs" style={{ color: 'var(--success)' }}>{c.cmd}</code>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Quick Deploy Buttons */}
      <GlassCard>
        <h4 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--accent)' }}>
          <ArrowRight size={18} /> Quick Links
        </h4>
        <div className="flex flex-wrap gap-3">
          <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="btn-primary">
            <Rocket size={16} /> New Vercel Project
          </a>
          <a href="https://vercel.com/dashboard" target="_blank" rel="noreferrer" className="btn-ghost">
            <Eye size={16} /> Vercel Dashboard
          </a>
          <a href="https://vercel.com/docs" target="_blank" rel="noreferrer" className="btn-ghost">
            <BookOpen size={16} /> Vercel Docs
          </a>
          <button className="btn-success" onClick={() => {
            copyText(`# Full Vercel Deploy Script
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main

# Then on vercel.com:
# 1. Sign up with GitHub
# 2. Import your repo
# 3. Click Deploy
# OR use CLI:
npm install -g vercel
vercel login
vercel --prod`);
            showToast('Full deploy script copied!');
          }}>
            <Copy size={16} /> Copy Full Script
          </button>
        </div>
      </GlassCard>
    </section>
  );
}

// ===== RULES & ETHICS =====
function RulesSection({ visible }: { visible: boolean }) {
  return (
    <section id="rules" className={`animate-section mb-16 ${visible ? 'visible' : ''}`}>
      <SectionTitle icon={<Scale size={28} />} subtitle="Important guidelines for responsible and legal usage of these tools">
        Rules, Ethics & Legal Usage
      </SectionTitle>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <GlassCard style={{ borderLeft: '4px solid var(--success)' }}>
          <h4 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--success)' }}>
            <CheckCircle size={18} /> ✅ Allowed Usage
          </h4>
          <ul className="space-y-3">
            {[
              { title: 'Personal Archival', desc: 'Backing up your own purchased/free content' },
              { title: 'Educational Research', desc: 'Academic study and learning purposes' },
              { title: 'Open-Source Content', desc: 'Creative Commons, Public Domain content' },
              { title: 'Own Content', desc: 'Downloading your own uploaded videos' },
              { title: 'Fair Use', desc: 'Commentary, criticism, news reporting (varies by country)' },
              { title: 'Offline Access', desc: 'Watching content in areas with limited internet' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.05)' }}>
                <CheckCircle size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                <div>
                  <span className="text-sm font-semibold block">{item.title}</span>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard style={{ borderLeft: '4px solid var(--error)' }}>
          <h4 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--error)' }}>
            <X size={18} /> ❌ Not Allowed
          </h4>
          <ul className="space-y-3">
            {[
              { title: 'Commercial Redistribution', desc: 'Selling or re-uploading copyrighted content' },
              { title: 'DRM Circumvention', desc: 'Bypassing digital rights management protections' },
              { title: 'Mass Piracy', desc: 'Large-scale downloading of copyrighted material' },
              { title: 'Content Theft', desc: 'Claiming others\' content as your own' },
              { title: 'Platform Abuse', desc: 'Overloading servers or violating rate limits' },
              { title: 'Illegal Distribution', desc: 'Sharing copyrighted content without permission' },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)' }}>
                <X size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
                <div>
                  <span className="text-sm font-semibold block">{item.title}</span>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Best Practices */}
      <GlassCard className="mb-4">
        <h4 className="font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--accent)' }}>
          <Heart size={18} /> Best Practices
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: <Heart size={20} />, title: 'Support Creators', desc: 'Watch on official platforms, like, subscribe & share' },
            { icon: <Shield size={20} />, title: 'Respect Copyright', desc: 'Always check content licensing before downloading' },
            { icon: <BookOpen size={20} />, title: 'Read ToS', desc: 'Review platform Terms of Service before using tools' },
            { icon: <Eye size={20} />, title: 'Stay Updated', desc: 'Laws change — keep informed about your local regulations' },
            { icon: <Globe size={20} />, title: 'Local Laws', desc: 'Copyright laws vary by country — know your jurisdiction' },
            { icon: <Scale size={20} />, title: 'Fair Use', desc: 'Understand what constitutes fair use in your region' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
              <div className="p-2 rounded-lg shrink-0" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>{item.icon}</div>
              <div>
                <span className="text-sm font-semibold block">{item.title}</span>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.05), rgba(129,140,248,0.05), transparent)' }}>
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl shrink-0" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}><Shield size={28} /></div>
          <div>
            <h4 className="font-bold text-lg mb-2">Disclaimer</h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              This tool is provided for <strong style={{ color: 'var(--text)' }}>educational purposes only</strong>. The developer (<strong className="gradient-text">Sudhir</strong>) is not responsible for any misuse. Users are solely responsible for ensuring their usage complies with all applicable laws and platform terms. Always respect intellectual property rights and support content creators.
            </p>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

// ===== FOOTER =====
function Footer() {
  return (
    <footer className="py-10 px-4 text-center mt-10" style={{ background: 'var(--card-solid)', borderTop: '1px solid var(--border)' }}>
      <div className="flex justify-center gap-5 mb-5">
        {[
          { href: 'https://github.com/yt-dlp/yt-dlp', icon: <Github size={22} />, title: 'yt-dlp GitHub' },
          { href: 'https://ffmpeg.org/', icon: <Cpu size={22} />, title: 'FFmpeg' },
          { href: 'https://vercel.com', icon: <Rocket size={22} />, title: 'Vercel' },
          { href: '#', icon: <Send size={22} />, title: 'Telegram' },
        ].map((link, i) => (
          <a key={i} href={link.href} target={link.href !== '#' ? '_blank' : undefined} rel="noreferrer"
            className="p-3 rounded-xl transition-all hover:scale-110"
            style={{ color: 'var(--text-dim)', background: 'rgba(255,255,255,0.03)' }} title={link.title}>
            {link.icon}
          </a>
        ))}
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-dim)' }}>
        Handcrafted by <strong className="gradient-text">Sudhir</strong> • © 2025
      </p>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        Pro Media & Git Toolset v3.0 • SEO Optimized • Vercel Ready
      </p>
      <div className="flex justify-center gap-3 mt-4">
        {['yt-dlp', 'FFmpeg', 'Git', 'React', 'Tailwind', 'Vercel'].map(tag => (
          <span key={tag} className="text-xs px-2 py-1 rounded-md" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>
            {tag}
          </span>
        ))}
      </div>
    </footer>
  );
}

// ===== MAIN APP =====
export function App() {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('sudhir-theme') as Theme) || 'default');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('sudhir-theme', theme); }, [theme]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => { setToast({ message, type }); }, []);

  const copyText = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        el.style.position = 'fixed';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      showToast('Copied to clipboard!');
    } catch {
      showToast('Copy failed — select manually.', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'k') { e.preventDefault(); document.getElementById('searchBar')?.focus(); }
      if (e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        const themes: Theme[] = ['default', 'cyber', 'neon', 'aurora'];
        setTheme(prev => { const next = themes[(themes.indexOf(prev) + 1) % themes.length]; showToast(`Theme: ${next.charAt(0).toUpperCase() + next.slice(1)}`, 'info'); return next; });
      }
      if (e.key === 'Escape') setShowShortcuts(false);
      if (e.key === '?' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') setShowShortcuts(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showToast]);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          setVisibleSections(prev => new Set([...prev, id]));
          if (entry.intersectionRatio > 0.2) setActiveSection(id);
        }
      });
    }, { threshold: [0.1, 0.3] });
    const timer = setTimeout(() => {
      document.querySelectorAll('section[id]').forEach(s => observer.observe(s));
    }, 100);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, []);

  const matchesSearch = (sectionId: string) => {
    if (!searchQuery.trim()) return true;
    const section = document.getElementById(sectionId);
    return section?.textContent?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* BG Effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[150px]" style={{ background: 'var(--accent)', top: '5%', left: '10%', animation: 'float-1 20s infinite' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[120px]" style={{ background: 'var(--git-color)', bottom: '10%', right: '10%', animation: 'float-2 25s infinite' }} />
        <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'linear-gradient(var(--text) 1px, transparent 1px), linear-gradient(90deg, var(--text) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <ScrollProgress />
      <Header theme={theme} setTheme={setTheme} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onShortcuts={() => setShowShortcuts(true)} />

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <nav className="flex flex-wrap gap-2 mb-10">
          {NAV_ITEMS.map(item => (
            <a key={item.id} href={`#${item.id}`} className={`nav-pill ${activeSection === item.id ? 'active' : ''}`}>
              {item.icon} <span className="hidden sm:inline">{item.label}</span>
            </a>
          ))}
        </nav>

        <div style={{ display: matchesSearch('hero') ? 'block' : 'none' }}>
          <HeroSection visible={visibleSections.has('hero')} />
        </div>
        <div style={{ display: matchesSearch('requirements') ? 'block' : 'none' }}>
          <RequirementsSection visible={visibleSections.has('requirements')} />
        </div>
        <div style={{ display: matchesSearch('downloads') ? 'block' : 'none' }}>
          <DownloadLinksSection visible={visibleSections.has('downloads')} copyText={copyText} />
        </div>
        <div style={{ display: matchesSearch('local-setup') ? 'block' : 'none' }}>
          <LocalSetupSection visible={visibleSections.has('local-setup')} copyText={copyText} showToast={showToast} />
        </div>
        <div style={{ display: matchesSearch('builder') ? 'block' : 'none' }}>
          <CommandBuilder copyText={copyText} showToast={showToast} visible={visibleSections.has('builder')} />
        </div>
        <div style={{ display: matchesSearch('github') ? 'block' : 'none' }}>
          <GitSection visible={visibleSections.has('github')} copyText={copyText} />
        </div>
        <div style={{ display: matchesSearch('troubleshoot') ? 'block' : 'none' }}>
          <TroubleshootingSection visible={visibleSections.has('troubleshoot')} copyText={copyText} />
        </div>
        <div style={{ display: matchesSearch('manager') ? 'block' : 'none' }}>
          <DownloadManager visible={visibleSections.has('manager')} copyText={copyText} />
        </div>
        <div style={{ display: matchesSearch('update') ? 'block' : 'none' }}>
          <UpdateSection visible={visibleSections.has('update')} copyText={copyText} />
        </div>
        <div style={{ display: matchesSearch('deploy') ? 'block' : 'none' }}>
          <VercelDeploySection visible={visibleSections.has('deploy')} copyText={copyText} showToast={showToast} />
        </div>
        <div style={{ display: matchesSearch('rules') ? 'block' : 'none' }}>
          <RulesSection visible={visibleSections.has('rules')} />
        </div>
      </main>

      <Footer />

      <div className="fixed left-5 bottom-5 z-40 hidden lg:grid gap-1.5 p-3 rounded-2xl text-xs"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', backdropFilter: 'blur(10px)', color: 'var(--text-muted)' }}>
        <div><span className="kbd">Ctrl</span> + <span className="kbd">K</span> Search</div>
        <div><span className="kbd">Alt</span> + <span className="kbd">T</span> Theme</div>
        <div><span className="kbd">?</span> Shortcuts</div>
      </div>

      <BackToTop />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
