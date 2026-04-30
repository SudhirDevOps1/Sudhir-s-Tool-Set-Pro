import React, { useState, useRef } from 'react';
import {
  Link,
  Download,
  X,
  Play,
  Pause,
  Volume2,
  Clock,
  User,
  Server,
  ExternalLink,
  AlertTriangle,
  Image,
} from 'lucide-react';
import type { MediaFormat, VideoQuality, DownloadMode, MediaInfo } from '../types';
import { platformConfig, formatDuration, isValidUrl } from '../utils/extractVideoId';
import { detectPlatform } from '../utils/extractVideoId';
import { FormatSelector } from './FormatSelector';
import { ProgressIndicator } from './ProgressIndicator';
import type { DownloadStatus } from '../types';

// ─── Props ────────────────────────────────────────────────────────────────────

interface DownloadFormProps {
  onFetch: (url: string, quality: VideoQuality, format: MediaFormat, mode: DownloadMode) => void;
  onDownload: (info: MediaInfo, format: MediaFormat, quality: VideoQuality, url: string) => void;
  onReset: () => void;
  status: DownloadStatus;
  progress: number;
  progressMsg: string;
  error: string | null;
  mediaInfo: MediaInfo | null;
}

// ─── Platform Badge ───────────────────────────────────────────────────────────

const PlatformBadge: React.FC<{ url: string }> = ({ url }) => {
  if (!isValidUrl(url)) return null;
  const platform = detectPlatform(url);
  const cfg = platformConfig[platform];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cfg.color} ${cfg.bg}`}
    >
      {cfg.label}
    </span>
  );
};

// ─── Media Preview Card ───────────────────────────────────────────────────────

const MediaPreviewCard: React.FC<{
  info: MediaInfo;
  onDownload: () => void;
  status: DownloadStatus;
}> = ({ info, onDownload, status }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cfg = platformConfig[info.platform];

  const togglePlay = () => {
    if (info.type === 'video' || info.type === 'gif') {
      if (!videoRef.current) return;
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    } else {
      if (!audioRef.current) return;
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 overflow-hidden shadow-sm">
      {/* Thumbnail / video preview */}
      {info.type === 'video' || info.type === 'gif' ? (
        <div className="relative aspect-video bg-gray-900 group">
          {info.thumbnail && !imgError ? (
            <img
              src={info.thumbnail}
              alt={info.title || 'Thumbnail'}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <Image className="w-12 h-12 text-gray-600" />
            </div>
          )}
          {/* Video overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              {playing ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </button>
          </div>
          {/* Hidden video for preview */}
          <video
            ref={videoRef}
            src={info.url}
            className="hidden"
            onEnded={() => setPlaying(false)}
            crossOrigin="anonymous"
          />
          {/* Platform badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm bg-black/40 text-white`}
            >
              {cfg.label}
            </span>
          </div>
          {/* Duration */}
          {info.duration && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm">
              <Clock className="w-3 h-3 text-white" />
              <span className="text-xs text-white font-medium">
                {formatDuration(info.duration)}
              </span>
            </div>
          )}
        </div>
      ) : (
        // Audio preview
        <div className="relative h-32 bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <button
            onClick={togglePlay}
            className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {playing ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </button>
          <audio
            ref={audioRef}
            src={info.url}
            className="hidden"
            onEnded={() => setPlaying(false)}
          />
        </div>
      )}

      {/* Info */}
      <div className="p-4 space-y-3">
        {info.title && (
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
            {info.title}
          </h3>
        )}

        <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
          {info.author && (
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {info.author}
            </span>
          )}
          {info.quality && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
              {info.quality}
            </span>
          )}
          {info.providerUsed && (
            <span className="flex items-center gap-1">
              <Server className="w-3.5 h-3.5" />
              <span className="truncate max-w-[160px]">{info.providerUsed.replace('https://', '')}</span>
            </span>
          )}
        </div>

        {/* Picker (multiple items) */}
        {info.type === 'picker' && info.picker && info.picker.length > 1 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {info.picker.length} items found
            </p>
            <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
              {info.picker.slice(0, 9).map((item, i) => (
                <a
                  key={i}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-violet-500 transition-all"
                >
                  {item.thumb ? (
                    <img src={item.thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Image className="w-5 h-5" />
                    </div>
                  )}
                  <div className="absolute top-1 right-1 w-4 h-4 bg-black/50 rounded-full flex items-center justify-center">
                    <ExternalLink className="w-2.5 h-2.5 text-white" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Download CTA */}
        <button
          onClick={onDownload}
          disabled={status === 'downloading'}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Download className="w-4.5 h-4.5" />
          {status === 'downloading' ? 'Downloading…' : 'Download Now'}
        </button>

        {/* Direct link fallback */}
        <a
          href={info.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open direct link (if download fails)
        </a>
      </div>
    </div>
  );
};

// ─── Main Download Form ───────────────────────────────────────────────────────

export const DownloadForm: React.FC<DownloadFormProps> = ({
  onFetch,
  onDownload,
  onReset,
  status,
  progress,
  progressMsg,
  error,
  mediaInfo,
}) => {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<MediaFormat>('mp4');
  const [quality, setQuality] = useState<VideoQuality>('1080');
  const [mode, setMode] = useState<DownloadMode>('auto');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLoading = status === 'fetching' || status === 'downloading';
  const canSubmit = url.trim().length > 0 && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    onFetch(url.trim(), quality, format, mode);
  };

  const handleClear = () => {
    setUrl('');
    onReset();
    inputRef.current?.focus();
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setUrl(text.trim());
        onReset();
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  return (
    <div className="space-y-5">
      {/* Legal Warning */}
      <div className="flex items-start gap-3 p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <AlertTriangle className="w-4.5 h-4.5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
          <strong>⚠️ Important:</strong> Only download content you have permission to download.
          Respect copyright laws. This tool is for personal use only.
        </p>
      </div>

      {/* URL Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Link className="w-4.5 h-4.5 text-gray-400" />
            {url && isValidUrl(url) && <PlatformBadge url={url} />}
          </div>
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); if (status !== 'idle') onReset(); }}
            placeholder="Paste video URL here (YouTube, TikTok, Instagram, Twitter…)"
            className={`w-full pl-10 pr-24 py-3.5 text-sm rounded-xl border transition-all duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent ${
              url && isValidUrl(url)
                ? 'pl-32 border-violet-300 dark:border-violet-700'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          />
          {url ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePaste}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-all"
            >
              Paste
            </button>
          )}
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {showAdvanced ? 'Hide' : 'Show'} format & quality options
        </button>

        {showAdvanced && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl">
            <FormatSelector
              format={format}
              quality={quality}
              mode={mode}
              onFormatChange={setFormat}
              onQualityChange={setQuality}
              onModeChange={setMode}
            />
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:-translate-y-0.5 active:translate-y-0"
        >
          {isLoading ? (
            <>
              <svg className="w-4.5 h-4.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {status === 'fetching' ? 'Fetching…' : 'Downloading…'}
            </>
          ) : (
            <>
              <Download className="w-4.5 h-4.5" />
              Get Download Link
            </>
          )}
        </button>
      </form>

      {/* Progress indicator */}
      {status !== 'idle' && status !== 'ready' && status !== 'done' && (
        <ProgressIndicator status={status} progress={progress} message={progressMsg} />
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">⚠️</div>
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400 text-sm mb-1">
                Download Failed
              </p>
              <p className="text-xs text-red-600 dark:text-red-400/80 whitespace-pre-line leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Media Preview */}
      {mediaInfo && (status === 'ready' || status === 'downloading' || status === 'done') && (
        <MediaPreviewCard
          info={mediaInfo}
          onDownload={() =>
            onDownload(mediaInfo, format, quality, url)
          }
          status={status}
        />
      )}

      {/* Download progress */}
      {status === 'downloading' && (
        <ProgressIndicator status={status} progress={progress} message={progressMsg} />
      )}
    </div>
  );
};
