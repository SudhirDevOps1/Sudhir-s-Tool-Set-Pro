import type { Platform } from '../types';

// ─── Platform Detection ────────────────────────────────────────────────────────

export function detectPlatform(url: string): Platform {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com')
      return 'youtube';
    if (host === 'instagram.com' || host === 'instagr.am') return 'instagram';
    if (host === 'tiktok.com' || host === 'vm.tiktok.com' || host === 'vt.tiktok.com')
      return 'tiktok';
    if (host === 'twitter.com' || host === 'x.com' || host === 't.co') return 'twitter';
    if (host === 'facebook.com' || host === 'fb.com' || host === 'fb.watch')
      return 'facebook';
    if (host === 'reddit.com' || host === 'redd.it' || host === 'v.redd.it')
      return 'reddit';
    if (host === 'vimeo.com') return 'vimeo';
    if (host === 'soundcloud.com') return 'soundcloud';
    if (host === 'twitch.tv' || host === 'clips.twitch.tv') return 'twitch';
    if (host === 'pinterest.com' || host === 'pin.it') return 'pinterest';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

// ─── YouTube Video ID ──────────────────────────────────────────────────────────

export function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    // youtu.be/<id>
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split('?')[0] || null;
    // youtube.com/shorts/<id>
    const shortMatch = u.pathname.match(/\/shorts\/([A-Za-z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];
    // youtube.com/watch?v=<id>
    const v = u.searchParams.get('v');
    if (v && v.length === 11) return v;
    // youtube.com/embed/<id>
    const embedMatch = u.pathname.match(/\/embed\/([A-Za-z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
    // youtube.com/v/<id>
    const vMatch = u.pathname.match(/\/v\/([A-Za-z0-9_-]{11})/);
    if (vMatch) return vMatch[1];
    return null;
  } catch {
    // Try regex fallback
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    return match ? match[1] : null;
  }
}

// ─── Platform Icon / Color ─────────────────────────────────────────────────────

export const platformConfig: Record<
  Platform,
  { label: string; color: string; bg: string }
> = {
  youtube:    { label: 'YouTube',    color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30' },
  instagram:  { label: 'Instagram',  color: 'text-pink-500',   bg: 'bg-pink-100 dark:bg-pink-900/30' },
  tiktok:     { label: 'TikTok',     color: 'text-gray-900 dark:text-white', bg: 'bg-gray-100 dark:bg-gray-800' },
  twitter:    { label: 'X / Twitter',color: 'text-sky-500',    bg: 'bg-sky-100 dark:bg-sky-900/30' },
  facebook:   { label: 'Facebook',   color: 'text-blue-600',   bg: 'bg-blue-100 dark:bg-blue-900/30' },
  reddit:     { label: 'Reddit',     color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  vimeo:      { label: 'Vimeo',      color: 'text-teal-500',   bg: 'bg-teal-100 dark:bg-teal-900/30' },
  soundcloud: { label: 'SoundCloud', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  twitch:     { label: 'Twitch',     color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  pinterest:  { label: 'Pinterest',  color: 'text-red-600',    bg: 'bg-red-100 dark:bg-red-900/30' },
  unknown:    { label: 'Unknown',    color: 'text-gray-500',   bg: 'bg-gray-100 dark:bg-gray-800' },
};

// ─── Format seconds ────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── URL Validation ────────────────────────────────────────────────────────────

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// ─── File size formatter ───────────────────────────────────────────────────────

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
