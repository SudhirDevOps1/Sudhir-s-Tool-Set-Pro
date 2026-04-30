import { useState, useCallback, useRef } from 'react';
import type {
  DownloaderState,
  MediaInfo,
  VideoQuality,
  MediaFormat,
  DownloadMode,
  DownloadRecord,
  AudioFormat,
} from '../types';
import { fetchDownloadInfo, downloadFile } from '../utils/apiFallback';
import { addDownloadRecord, getAllDownloadRecords, deleteDownloadRecord, clearAllDownloadRecords } from '../utils/indexedDB';
import { isValidUrl } from '../utils/extractVideoId';
import { useLocalStorage } from './useLocalStorage';

// ─── useDownloader ─────────────────────────────────────────────────────────────

export function useDownloader() {
  const [state, setState] = useState<DownloaderState>({
    status: 'idle',
    progress: 0,
    error: null,
    mediaInfo: null,
  });
  const [progressMsg, setProgressMsg] = useState('');
  const [history, setHistory] = useLocalStorage<DownloadRecord[]>('dl-history', []);

  const abortRef = useRef<AbortController | null>(null);

  // ── Load history from IndexedDB on mount ─────────────────────────────────────
  const refreshHistory = useCallback(async () => {
    try {
      const records = await getAllDownloadRecords();
      setHistory(records);
    } catch {
      // IndexedDB might not be available
    }
  }, [setHistory]);

  // ── Fetch media info ──────────────────────────────────────────────────────────

  const fetchInfo = useCallback(
    async (
      url: string,
      quality: VideoQuality = '1080',
      format: MediaFormat = 'mp4',
      mode: DownloadMode = 'auto'
    ) => {
      const trimmedUrl = url.trim();

      if (!isValidUrl(trimmedUrl)) {
        setState((s) => ({
          ...s,
          status: 'error',
          error: '⚠️ Please enter a valid URL (starting with http:// or https://)',
        }));
        return;
      }

      setState({ status: 'fetching', progress: 0, error: null, mediaInfo: null });
      setProgressMsg('Initialising…');

      abortRef.current = new AbortController();

      try {
        let downloadMode: DownloadMode = mode;
        let audioFormat: AudioFormat = 'mp3';

        // Determine download mode from format
        if (['mp3', 'ogg', 'wav', 'opus', 'best'].includes(format)) {
          downloadMode = 'audio';
          audioFormat = format as AudioFormat;
        }

        const info: MediaInfo = await fetchDownloadInfo(trimmedUrl, {
          quality,
          audioFormat,
          downloadMode,
          onProgress: setProgressMsg,
        });

        setState({ status: 'ready', progress: 100, error: null, mediaInfo: info });
        setProgressMsg('');
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        setState({ status: 'error', progress: 0, error: msg, mediaInfo: null });
        setProgressMsg('');
      }
    },
    []
  );

  // ── Trigger download ─────────────────────────────────────────────────────────

  const triggerDownload = useCallback(
    async (
      info: MediaInfo,
      format: MediaFormat,
      quality: VideoQuality,
      originalUrl: string
    ) => {
      setState((s) => ({ ...s, status: 'downloading', progress: 0 }));

      try {
        await downloadFile(info.url, info.filename, (pct) => {
          setState((s) => ({ ...s, progress: pct }));
        });

        // Save to history
        const record: DownloadRecord = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          url: originalUrl,
          mediaInfo: info,
          downloadedAt: Date.now(),
          format,
          quality,
        };

        try {
          await addDownloadRecord(record);
          await refreshHistory();
        } catch {
          // Fallback: store in localStorage only
          setHistory((prev) => [record, ...prev].slice(0, 50));
        }

        setState((s) => ({ ...s, status: 'done', progress: 100 }));
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Download failed';
        setState((s) => ({ ...s, status: 'error', error: msg }));
      }
    },
    [refreshHistory, setHistory]
  );

  // ── Reset ─────────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ status: 'idle', progress: 0, error: null, mediaInfo: null });
    setProgressMsg('');
  }, []);

  // ── Delete history record ─────────────────────────────────────────────────────

  const deleteRecord = useCallback(
    async (id: string) => {
      try {
        await deleteDownloadRecord(id);
        await refreshHistory();
      } catch {
        setHistory((prev) => prev.filter((r) => r.id !== id));
      }
    },
    [refreshHistory, setHistory]
  );

  // ── Clear all history ─────────────────────────────────────────────────────────

  const clearHistory = useCallback(async () => {
    try {
      await clearAllDownloadRecords();
      setHistory([]);
    } catch {
      setHistory([]);
    }
  }, [setHistory]);

  return {
    state,
    progressMsg,
    history,
    fetchInfo,
    triggerDownload,
    reset,
    deleteRecord,
    clearHistory,
    refreshHistory,
  };
}
