import { ShieldCheck } from 'lucide-react';
import type { ThemeName } from '../hooks/useTheme';

interface HeaderProps {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  searchQuery: string;
  onSearch: (q: string) => void;
}

export function Header({ theme, setTheme, searchQuery, onSearch }: HeaderProps) {
  const dots: { name: ThemeName; color: string; label: string }[] = [
    { name: 'default', color: '#030712', label: 'Dark' },
    { name: 'cyber', color: '#0d0221', label: 'Cyber' },
    { name: 'neon', color: '#ccff00', label: 'Neon' },
  ];

  return (
    <header
      className="sticky top-0 z-50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 px-4 md:px-8 py-4"
      style={{
        background: 'var(--header-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <h1
        className="flex items-center gap-2.5 text-xl font-bold m-0"
        style={{
          background: 'linear-gradient(to right, var(--accent), var(--git-color))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        <ShieldCheck className="w-6 h-6" style={{ color: 'var(--accent)' }} />
        Sudhir's Toolset Pro
      </h1>

      <div className="flex items-center gap-5 flex-wrap justify-end">
        <div
          className="flex items-center gap-2.5 px-2 py-1.5 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          aria-label="Theme switcher"
        >
          {dots.map((d) => (
            <button
              key={d.name}
              className="w-3.5 h-3.5 rounded-full cursor-pointer transition-transform duration-150 hover:scale-110"
              style={{
                background: d.color,
                border: theme === d.name
                  ? '2px solid var(--accent)'
                  : '2px solid rgba(255,255,255,0.15)',
                boxShadow: theme === d.name ? '0 0 0 4px rgba(56,189,248,0.12)' : 'none',
              }}
              onClick={() => setTheme(d.name)}
              title={d.label}
              aria-label={`${d.label} theme`}
            />
          ))}
        </div>

        <input
          type="text"
          id="searchBar"
          placeholder="Search (Ctrl+K)"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          aria-label="Search"
          className="min-w-0 w-full md:min-w-[240px] md:w-auto px-3 py-2.5 rounded-xl outline-none transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: 'var(--text)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 0 0 4px rgba(56,189,248,0.12)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
    </header>
  );
}
