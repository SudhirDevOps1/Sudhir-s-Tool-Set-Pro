// ─── Core Types ───────────────────────────────────────────────────────────────

export type Platform =
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'twitter'
  | 'facebook'
  | 'reddit'
  | 'vimeo'
  | 'soundcloud'
  | 'twitch'
  | 'pinterest'
  | 'unknown';

export type VideoQuality =
  | 'max'
  | '1080'
  | '720'
  | '480'
  | '360'
  | '240'
  | '144';

export type AudioFormat = 'mp3' | 'ogg' | 'wav' | 'opus' | 'best';
export type VideoFormat = 'mp4' | 'webm' | 'mkv' | 'gif';
export type MediaFormat = VideoFormat | AudioFormat;
export type DownloadMode = 'auto' | 'audio' | 'mute';

// ─── Download Info ─────────────────────────────────────────────────────────────

export interface MediaInfo {
  url: string;
  filename: string;
  title?: string;
  author?: string;
  thumbnail?: string;
  duration?: number; // seconds
  platform: Platform;
  type: 'video' | 'audio' | 'gif' | 'picker';
  quality?: string;
  format?: string;
  fileSize?: number;
  picker?: PickerItem[];
  providerUsed?: string;
}

export interface PickerItem {
  type: 'photo' | 'video' | 'gif';
  url: string;
  thumb?: string;
}

// ─── Download History ──────────────────────────────────────────────────────────

export interface DownloadRecord {
  id: string;
  url: string;
  mediaInfo: MediaInfo;
  downloadedAt: number; // epoch ms
  format: MediaFormat;
  quality: VideoQuality;
}

// ─── Downloader Hook State ─────────────────────────────────────────────────────

export type DownloadStatus =
  | 'idle'
  | 'fetching'
  | 'ready'
  | 'downloading'
  | 'done'
  | 'error';

export interface DownloaderState {
  status: DownloadStatus;
  progress: number; // 0-100
  error: string | null;
  mediaInfo: MediaInfo | null;
}

// ─── API Fallback ──────────────────────────────────────────────────────────────

export interface CobaltRequest {
  url: string;
  videoQuality?: VideoQuality;
  audioFormat?: AudioFormat;
  downloadMode?: DownloadMode;
  filenameStyle?: 'classic' | 'pretty' | 'basic' | 'nerdy';
  youtubeVideoCodec?: 'h264' | 'av1' | 'vp9';
  youtubeVideoContainer?: 'auto' | 'mp4' | 'webm' | 'mkv';
  convertGif?: boolean;
  alwaysProxy?: boolean;
}

export interface CobaltResponse {
  status: 'tunnel' | 'redirect' | 'picker' | 'local-processing' | 'error';
  url?: string;
  filename?: string;
  audio?: string;
  audioFilename?: string;
  picker?: PickerItem[];
  error?: {
    code: string;
    context?: {
      service?: string;
      limit?: number;
    };
  };
}

// ─── Toast ─────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// ─── Settings ──────────────────────────────────────────────────────────────────

export interface AppSettings {
  theme: 'light' | 'dark';
  defaultFormat: MediaFormat;
  defaultQuality: VideoQuality;
  defaultMode: DownloadMode;
}
