import React from 'react';
import { Film, Music, ImageIcon } from 'lucide-react';
import type { MediaFormat, VideoQuality, DownloadMode } from '../types';

// ─── Options ──────────────────────────────────────────────────────────────────

const VIDEO_FORMATS: { value: MediaFormat; label: string }[] = [
  { value: 'mp4',  label: 'MP4'  },
  { value: 'webm', label: 'WebM' },
  { value: 'mkv',  label: 'MKV'  },
  { value: 'gif',  label: 'GIF'  },
];

const AUDIO_FORMATS: { value: MediaFormat; label: string }[] = [
  { value: 'mp3',  label: 'MP3'  },
  { value: 'ogg',  label: 'OGG'  },
  { value: 'opus', label: 'OPUS' },
  { value: 'wav',  label: 'WAV'  },
  { value: 'best', label: 'Best Audio' },
];

const QUALITIES: { value: VideoQuality; label: string }[] = [
  { value: 'max',  label: 'Best (Max)' },
  { value: '1080', label: '1080p FHD'  },
  { value: '720',  label: '720p HD'    },
  { value: '480',  label: '480p'       },
  { value: '360',  label: '360p'       },
  { value: '240',  label: '240p'       },
  { value: '144',  label: '144p'       },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface FormatSelectorProps {
  format: MediaFormat;
  quality: VideoQuality;
  mode: DownloadMode;
  onFormatChange: (f: MediaFormat) => void;
  onQualityChange: (q: VideoQuality) => void;
  onModeChange: (m: DownloadMode) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  format,
  quality,
  mode,
  onFormatChange,
  onQualityChange,
  onModeChange,
}) => {
  const isAudio = ['mp3', 'ogg', 'opus', 'wav', 'best'].includes(format);

  const formatBtnClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
      active
        ? 'bg-violet-600 border-violet-600 text-white shadow-sm shadow-violet-500/30'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400'
    }`;

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {(
          [
            { value: 'auto',  label: 'Auto',  Icon: Film  },
            { value: 'audio', label: 'Audio Only', Icon: Music },
            { value: 'mute',  label: 'Video (Muted)', Icon: ImageIcon },
          ] as { value: DownloadMode; label: string; Icon: React.FC<React.SVGProps<SVGSVGElement>> }[]
        ).map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => {
              onModeChange(value);
              // Auto-switch format
              if (value === 'audio' && !isAudio) onFormatChange('mp3');
              if ((value === 'auto' || value === 'mute') && isAudio) onFormatChange('mp4');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              mode === value
                ? 'bg-white dark:bg-gray-900 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Format selection */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          {isAudio ? '🎵 Audio Format' : '🎬 Video Format'}
        </p>
        <div className="flex flex-wrap gap-2">
          {(mode === 'audio' ? AUDIO_FORMATS : VIDEO_FORMATS).map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onFormatChange(value)}
              className={formatBtnClass(format === value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Quality (only for video) */}
      {!isAudio && (
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            📺 Quality
          </p>
          <div className="relative">
            <select
              value={quality}
              onChange={(e) => onQualityChange(e.target.value as VideoQuality)}
              className="w-full appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer"
            >
              {QUALITIES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
