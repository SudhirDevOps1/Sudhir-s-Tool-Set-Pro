import type {
  MediaInfo,
  CobaltRequest,
  CobaltResponse,
  Platform,
  VideoQuality,
  AudioFormat,
  DownloadMode,
} from '../types';
import { detectPlatform, extractYouTubeId } from './extractVideoId';

// ─── Cobalt Community Instances ────────────────────────────────────────────────
// These are public, community-hosted cobalt instances from instances.cobalt.best
// They require no API key and have CORS enabled.
const COBALT_INSTANCES = [
  'https://cobalt-api.meowing.de',
  'https://cobalt.canine.tools',
  'https://cobalt.api.timelessnesses.me',
  'https://dl.cjnx.de',
  'https://cobalt.datura.network',
];

// ─── CORS Proxies (reserved for future use) ────────────────────────────────────
// const CORS_PROXIES = [
//   'https://corsproxy.io/?url=',
//   'https://api.allorigins.win/raw?url=',
//   'https://cors-anywhere.herokuapp.com/',
// ];

// ─── Invidious Instances (YouTube fallback) ────────────────────────────────────
const INVIDIOUS_INSTANCES = [
  'https://invidious.io',
  'https://vid.puffyan.us',
  'https://yewtu.be',
  'https://inv.riverside.rocks',
];

// ─── Piped Instances (YouTube fallback) ───────────────────────────────────────
const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://piped-api.privacy.com.de',
  'https://pipedapi.in.projectsegfau.lt',
];

// ─── Helper ───────────────────────────────────────────────────────────────────

async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
  timeoutMs = 12000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function tryFetch(
  url: string,
  init?: RequestInit,
  timeoutMs = 12000
): Promise<Response | null> {
  try {
    const res = await fetchWithTimeout(url, init, timeoutMs);
    if (!res.ok) return null;
    return res;
  } catch {
    return null;
  }
}

// ─── Cobalt API ───────────────────────────────────────────────────────────────

async function tryCobaltInstance(
  instance: string,
  req: CobaltRequest
): Promise<MediaInfo | null> {
  try {
    const res = await fetchWithTimeout(
      `${instance}/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(req),
      },
      14000
    );

    if (!res.ok) return null;

    const data: CobaltResponse = await res.json();

    if (data.status === 'error' || !data.status) return null;

    const platform = detectPlatform(req.url);

    if (data.status === 'redirect' || data.status === 'tunnel') {
      return {
        url: data.url!,
        filename: data.filename || generateFilename(req.url, platform),
        platform,
        type: req.downloadMode === 'audio' ? 'audio' : 'video',
        providerUsed: instance,
      };
    }

    if (data.status === 'picker' && data.picker && data.picker.length > 0) {
      // Return the first video item or photo as primary, expose picker
      const first = data.picker.find((p) => p.type === 'video') || data.picker[0];
      return {
        url: first.url,
        filename: data.audioFilename || generateFilename(req.url, platform),
        platform,
        type: 'picker',
        thumbnail: first.thumb,
        picker: data.picker,
        providerUsed: instance,
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function fetchViaCobalt(
  url: string,
  options: {
    quality?: VideoQuality;
    audioFormat?: AudioFormat;
    downloadMode?: DownloadMode;
  } = {}
): Promise<MediaInfo | null> {
  const req: CobaltRequest = {
    url,
    videoQuality: options.quality || '1080',
    audioFormat: options.audioFormat || 'mp3',
    downloadMode: options.downloadMode || 'auto',
    filenameStyle: 'pretty',
    youtubeVideoCodec: 'h264',
  };

  for (const instance of COBALT_INSTANCES) {
    const result = await tryCobaltInstance(instance, req);
    if (result) {
      return result;
    }
  }
  return null;
}

// ─── Invidious API (YouTube only) ─────────────────────────────────────────────

async function fetchViaInvidious(url: string): Promise<MediaInfo | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const apiUrl = `${instance}/api/v1/videos/${videoId}`;
      const res = await tryFetch(apiUrl, undefined, 10000);
      if (!res) continue;

      const data = await res.json();

      if (!data || !data.adaptiveFormats) continue;

      // Find best video format
      const videoFormats: Array<{
        url: string;
        container: string;
        qualityLabel?: string;
        bitrate?: number;
        resolution?: string;
      }> = data.adaptiveFormats || [];

      const mp4Videos = videoFormats.filter(
        (f) => f.container === 'mp4' && f.qualityLabel
      );
      const best = mp4Videos.sort((a, b) => {
        const qa = parseInt((a.qualityLabel || '0').replace('p', ''), 10);
        const qb = parseInt((b.qualityLabel || '0').replace('p', ''), 10);
        return qb - qa;
      })[0];

      if (!best || !best.url) continue;

      const thumbnail =
        data.videoThumbnails?.find(
          (t: { quality: string; url: string }) => t.quality === 'maxresdefault'
        )?.url ||
        data.videoThumbnails?.[0]?.url ||
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

      return {
        url: best.url,
        filename: `${data.title || videoId}.mp4`,
        title: data.title,
        author: data.author,
        thumbnail,
        duration: data.lengthSeconds,
        platform: 'youtube',
        type: 'video',
        quality: best.qualityLabel,
        providerUsed: instance,
      };
    } catch {
      continue;
    }
  }
  return null;
}

// ─── Piped API (YouTube only) ──────────────────────────────────────────────────

async function fetchViaPiped(url: string): Promise<MediaInfo | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  for (const instance of PIPED_INSTANCES) {
    try {
      const apiUrl = `${instance}/streams/${videoId}`;
      const res = await tryFetch(apiUrl, undefined, 10000);
      if (!res) continue;

      const data = await res.json();
      if (!data || !data.videoStreams) continue;

      const videoStreams: Array<{
        url: string;
        quality: string;
        format: string;
        mimeType?: string;
      }> = data.videoStreams || [];

      const mp4Streams = videoStreams.filter(
        (s) => s.format === 'MPEG_4' || (s.mimeType && s.mimeType.includes('mp4'))
      );
      const best = mp4Streams.sort((a, b) => {
        const qa = parseInt(a.quality.replace('p', ''), 10) || 0;
        const qb = parseInt(b.quality.replace('p', ''), 10) || 0;
        return qb - qa;
      })[0];

      if (!best || !best.url) continue;

      return {
        url: best.url,
        filename: `${data.title || videoId}.mp4`,
        title: data.title,
        author: data.uploader,
        thumbnail:
          data.thumbnailUrl ||
          `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: data.duration,
        platform: 'youtube',
        type: 'video',
        quality: best.quality,
        providerUsed: instance,
      };
    } catch {
      continue;
    }
  }
  return null;
}

// ─── oEmbed metadata enrichment ───────────────────────────────────────────────

async function enrichWithOEmbed(
  info: MediaInfo,
  originalUrl: string
): Promise<MediaInfo> {
  try {
    // YouTube oEmbed (no key needed)
    if (info.platform === 'youtube') {
      const res = await tryFetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(originalUrl)}&format=json`,
        undefined,
        8000
      );
      if (res) {
        const data = await res.json();
        return {
          ...info,
          title: info.title || data.title,
          author: info.author || data.author_name,
          thumbnail:
            info.thumbnail ||
            `https://img.youtube.com/vi/${extractYouTubeId(originalUrl)}/maxresdefault.jpg`,
        };
      }
    }
    // Instagram / TikTok oEmbed
    if (info.platform === 'instagram') {
      const res = await tryFetch(
        `https://api.instagram.com/oembed/?url=${encodeURIComponent(originalUrl)}&format=json`,
        undefined,
        8000
      );
      if (res) {
        const data = await res.json();
        return {
          ...info,
          title: info.title || data.title,
          author: info.author || data.author_name,
          thumbnail: info.thumbnail || data.thumbnail_url,
        };
      }
    }
    if (info.platform === 'twitter') {
      const res = await tryFetch(
        `https://publish.twitter.com/oembed?url=${encodeURIComponent(originalUrl)}&format=json`,
        undefined,
        8000
      );
      if (res) {
        const data = await res.json();
        return {
          ...info,
          title: info.title || data.author_name,
          author: info.author || data.author_name,
        };
      }
    }
  } catch {
    // Ignore enrichment errors
  }
  return info;
}

// ─── Generate fallback filename ─────────────────────────────────────────────────

function generateFilename(url: string, platform: Platform): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\//g, '_').slice(0, 40);
    return `${platform}_${path}_${Date.now()}.mp4`;
  } catch {
    return `download_${Date.now()}.mp4`;
  }
}

// ─── Main Fallback Orchestrator ────────────────────────────────────────────────

export interface FetchOptions {
  quality?: VideoQuality;
  audioFormat?: AudioFormat;
  downloadMode?: DownloadMode;
  onProgress?: (msg: string) => void;
}

export async function fetchDownloadInfo(
  url: string,
  options: FetchOptions = {}
): Promise<MediaInfo> {
  const { onProgress } = options;
  const platform = detectPlatform(url.trim());

  onProgress?.('🔍 Analysing URL…');

  // ── Tier 1: Cobalt community instances ──────────────────────────────────────
  onProgress?.('⚡ Trying Cobalt API (Tier 1)…');
  const cobaltResult = await fetchViaCobalt(url, options);
  if (cobaltResult) {
    const enriched = await enrichWithOEmbed(cobaltResult, url);
    onProgress?.('✅ Success via Cobalt!');
    return enriched;
  }

  // ── Tier 2: Invidious (YouTube only) ───────────────────────────────────────
  if (platform === 'youtube') {
    onProgress?.('🔄 Trying Invidious API (Tier 2)…');
    const invidiousResult = await fetchViaInvidious(url);
    if (invidiousResult) {
      const enriched = await enrichWithOEmbed(invidiousResult, url);
      onProgress?.('✅ Success via Invidious!');
      return enriched;
    }

    // ── Tier 3: Piped (YouTube only) ─────────────────────────────────────────
    onProgress?.('🔄 Trying Piped API (Tier 3)…');
    const pipedResult = await fetchViaPiped(url);
    if (pipedResult) {
      const enriched = await enrichWithOEmbed(pipedResult, url);
      onProgress?.('✅ Success via Piped!');
      return enriched;
    }
  }

  // ── Tier 4: Self-hosted /api/download (Vercel serverless) ──────────────────
  onProgress?.('🔄 Trying serverless fallback (Tier 4)…');
  try {
    const res = await tryFetch(
      `/api/download?url=${encodeURIComponent(url)}&quality=${options.quality || '1080'}&mode=${options.downloadMode || 'auto'}`,
      undefined,
      20000
    );
    if (res) {
      const data = await res.json();
      if (data && data.url) {
        onProgress?.('✅ Success via serverless!');
        return {
          url: data.url,
          filename: data.filename || generateFilename(url, platform),
          title: data.title,
          author: data.author,
          thumbnail: data.thumbnail,
          duration: data.duration,
          platform,
          type: data.type || 'video',
          providerUsed: 'serverless /api/download',
        };
      }
    }
  } catch {
    // Serverless not available
  }

  // ── All tiers failed ────────────────────────────────────────────────────────
  onProgress?.('❌ All providers failed');
  throw new Error(
    `Unable to fetch download info for this URL after trying all available providers.\n\nPossible reasons:\n• The platform may not be supported\n• The content is private or geo-restricted\n• Rate limits were hit — please try again in a few minutes\n• The video URL may be invalid\n\nPlatform detected: ${platform}`
  );
}

// ─── Download file helper ──────────────────────────────────────────────────────

export async function downloadFile(
  url: string,
  filename: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  try {
    // Try fetch with progress first
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const contentLength = res.headers.get('Content-Length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    const reader = res.body?.getReader();
    if (!reader) throw new Error('ReadableStream not supported');

    const chunks: ArrayBuffer[] = [];
    let received = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value.buffer as ArrayBuffer);
      received += value.length;
      if (total > 0 && onProgress) {
        onProgress(Math.round((received / total) * 100));
      } else if (onProgress) {
        // Indeterminate progress
        onProgress(Math.min(90, received / 100000));
      }
    }

    const blob = new Blob(chunks);
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    onProgress?.(100);
  } catch {
    // Fallback: open in new tab / direct link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    onProgress?.(100);
  }
}
