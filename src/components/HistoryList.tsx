import React, { useState } from 'react';
import { Download, Trash2, RefreshCw, Clock, ExternalLink, Trash } from 'lucide-react';
import type { DownloadRecord } from '../types';
import { platformConfig, formatDuration } from '../utils/extractVideoId';

// ─── Props ────────────────────────────────────────────────────────────────────

interface HistoryListProps {
  records: DownloadRecord[];
  onRedownload: (record: DownloadRecord) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

// ─── Time formatter ───────────────────────────────────────────────────────────

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

// ─── History Item ─────────────────────────────────────────────────────────────

const HistoryItem: React.FC<{
  record: DownloadRecord;
  onRedownload: () => void;
  onDelete: () => void;
}> = ({ record, onRedownload, onDelete }) => {
  const { mediaInfo, format, quality, downloadedAt } = record;
  const cfg = platformConfig[mediaInfo.platform];
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition-all duration-200">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
        {mediaInfo.thumbnail && !imgError ? (
          <img
            src={mediaInfo.thumbnail}
            alt=""
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl">
              {mediaInfo.type === 'audio' ? '🎵' : '🎬'}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mb-0.5">
          {mediaInfo.title || 'Untitled Media'}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span className={`font-bold ${cfg.color}`}>{cfg.label}</span>
          <span>·</span>
          <span className="uppercase font-mono font-semibold">{format}</span>
          {!['mp3', 'ogg', 'opus', 'wav', 'best'].includes(format) && (
            <>
              <span>·</span>
              <span>{quality === 'max' ? 'Best' : `${quality}p`}</span>
            </>
          )}
          {mediaInfo.duration && (
            <>
              <span>·</span>
              <span>{formatDuration(mediaInfo.duration)}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          {timeAgo(downloadedAt)}
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onRedownload}
          title="Re-download"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <a
          href={mediaInfo.url}
          target="_blank"
          rel="noopener noreferrer"
          title="Open original URL"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <button
          onClick={onDelete}
          title="Delete"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ─── HistoryList ──────────────────────────────────────────────────────────────

export const HistoryList: React.FC<HistoryListProps> = ({
  records,
  onRedownload,
  onDelete,
  onClearAll,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Download className="w-8 h-8 text-gray-400" />
        </div>
        <p className="font-semibold text-gray-500 dark:text-gray-400 mb-1">
          No downloads yet
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Your download history will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
          {records.length} download{records.length !== 1 ? 's' : ''}
        </p>
        {!confirmClear ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors"
          >
            <Trash className="w-3.5 h-3.5" />
            Clear all
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sure?</span>
            <button
              onClick={() => { onClearAll(); setConfirmClear(false); }}
              className="text-xs text-red-600 font-semibold hover:underline"
            >
              Yes, clear
            </button>
            <button
              onClick={() => setConfirmClear(false)}
              className="text-xs text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {records.map((record) => (
          <HistoryItem
            key={record.id}
            record={record}
            onRedownload={() => onRedownload(record)}
            onDelete={() => onDelete(record.id)}
          />
        ))}
      </div>
    </div>
  );
};
