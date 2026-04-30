import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import type { DownloadStatus } from '../types';

interface ProgressIndicatorProps {
  status: DownloadStatus;
  progress: number;
  message?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  status,
  progress,
  message,
}) => {
  if (status === 'idle') return null;

  const configs = {
    fetching: {
      icon: <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />,
      label: 'Fetching media info…',
      barColor: 'bg-violet-500',
      bgColor: 'bg-violet-50 dark:bg-violet-900/20',
      borderColor: 'border-violet-200 dark:border-violet-800',
      indeterminate: true,
    },
    ready: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      label: 'Ready to download!',
      barColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      indeterminate: false,
    },
    downloading: {
      icon: <Download className="w-5 h-5 text-blue-500 animate-bounce" />,
      label: 'Downloading…',
      barColor: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      indeterminate: progress === 0,
    },
    done: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      label: '✅ Download complete!',
      barColor: 'bg-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      indeterminate: false,
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
      label: 'Error occurred',
      barColor: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      indeterminate: false,
    },
  };

  const cfg = configs[status as keyof typeof configs];
  if (!cfg) return null;

  const pct = Math.max(0, Math.min(100, progress));

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-300 ${cfg.bgColor} ${cfg.borderColor}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {cfg.label}
          </p>
          {message && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {message}
            </p>
          )}

          {/* Progress bar */}
          {(status === 'fetching' || status === 'downloading') && (
            <div className="mt-2.5 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              {cfg.indeterminate ? (
                <div
                  className={`h-full ${cfg.barColor} rounded-full animate-[indeterminate_1.5s_ease-in-out_infinite]`}
                  style={{ width: '40%' }}
                />
              ) : (
                <div
                  className={`h-full ${cfg.barColor} rounded-full transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                />
              )}
            </div>
          )}

          {(status === 'done' || (status === 'ready')) && (
            <div className="mt-2.5 h-1.5 bg-emerald-200 dark:bg-emerald-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-full transition-all duration-500" />
            </div>
          )}

          {status === 'downloading' && pct > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {pct}% downloaded
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
