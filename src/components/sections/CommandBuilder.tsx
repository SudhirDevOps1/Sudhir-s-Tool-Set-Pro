import { useState, useEffect, useCallback } from 'react';
import { Cpu, Music, Tv, ListVideo, Copy, Star, History, FolderHeart, AlertTriangle } from 'lucide-react';
import { Section } from '../Section';
import { Card } from '../Card';
import { Button } from '../Button';
import { CodeBlock } from '../CodeBlock';

interface Props {
  visible: boolean;
  onCopy: (text: string) => void;
  showToast: (msg: string, isError?: boolean) => void;
}

interface HistoryItem {
  cmd: string;
  time: string;
}

export function CommandBuilder({ visible, onCopy, showToast }: Props) {
  const [type, setType] = useState('video');
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('best');
  const [speed, setSpeed] = useState('normal');
  const [scope, setScope] = useState('single');
  const [url, setUrl] = useState('');
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('sudhir-favs') || '[]');
  });

  const showWarning = type === 'video' && (format === 'mp3' || format === 'm4a');

  const generateOutput = useCallback(() => {
    const urlVal = url || 'URL_LINK';
    const path = type === 'video' ? 'D:\\Videos\\' : 'D:\\Music\\';
    const filename =
      scope === 'playlist'
        ? '%(playlist_index)s - %(title)s.%(ext)s'
        : '%(title)s.%(ext)s';

    let cmd = 'yt-dlp ';
    if (speed === 'fast') cmd += '-N 8 --concurrent-fragments 5 ';

    if (type === 'audio') {
      cmd += `-f "bestaudio" -x --audio-format ${format} --audio-quality 0 --embed-thumbnail --add-metadata `;
    } else {
      const formatFilter =
        quality === '1080'
          ? '[height<=1080]'
          : quality === '720'
            ? '[height<=720]'
            : '';
      cmd += `-f "bestvideo${formatFilter}+bestaudio/best" --merge-output-format ${format} --embed-thumbnail --add-metadata `;
    }

    cmd += `-o "${path}${filename}" "${urlVal}"`;
    setCommand(cmd);
  }, [type, format, quality, speed, scope, url]);

  useEffect(() => {
    generateOutput();
  }, [generateOutput]);

  const applyPreset = (preset: string) => {
    if (preset === 'yt-music') {
      setType('audio');
      setFormat('mp3');
    } else if (preset === '1080p') {
      setType('video');
      setFormat('mp4');
      setQuality('1080');
    } else if (preset === 'playlist') {
      setScope('playlist');
    }
    showToast('Preset Applied!');
  };

  const copyAndLog = () => {
    onCopy(command);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory((prev) => [{ cmd: command, time }, ...prev].slice(0, 5));
  };

  const saveFavorite = () => {
    if (!favorites.includes(command)) {
      const updated = [...favorites, command];
      setFavorites(updated);
      localStorage.setItem('sudhir-favs', JSON.stringify(updated));
      showToast('Added to Favorites!');
    } else {
      showToast('Already in Favorites');
    }
  };

  const deleteFav = (idx: number) => {
    const updated = favorites.filter((_, i) => i !== idx);
    setFavorites(updated);
    localStorage.setItem('sudhir-favs', JSON.stringify(updated));
    showToast('Deleted from Favorites');
  };

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text)',
    padding: '10px',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
  };

  const inputStyle: React.CSSProperties = {
    ...selectStyle,
  };

  return (
    <Section id="builder" visible={visible}>
      <h2
        className="flex items-center gap-3 text-3xl font-bold pb-2.5"
        style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Cpu className="w-7 h-7" /> Smart Command Generator
      </h2>

      {/* Presets */}
      <div className="flex gap-2.5 mb-4 flex-wrap mt-4">
        <Button variant="ghost" onClick={() => applyPreset('yt-music')}>
          <Music className="w-4 h-4" /> YT Music
        </Button>
        <Button variant="ghost" onClick={() => applyPreset('1080p')}>
          <Tv className="w-4 h-4" /> 1080p Video
        </Button>
        <Button variant="ghost" onClick={() => applyPreset('playlist')}>
          <ListVideo className="w-4 h-4" /> Full Playlist
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm flex justify-between items-center" style={{ color: 'var(--text-dim)' }}>
              Media Type
              <span
                className="text-xs px-1.5 py-0.5 rounded font-mono"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--accent)' }}
              >
                {type === 'video' ? 'D:\\Videos\\' : 'D:\\Music\\'}
              </span>
            </label>
            <select value={type} onChange={(e) => setType(e.target.value)} style={selectStyle}>
              <option value="video">🎬 Video (Best Quality)</option>
              <option value="audio">🎵 Music/Audio Only</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Format <span className="text-xs opacity-60">Smart selection</span>
            </label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} style={selectStyle}>
              <option value="mp4">MP4 (Standard)</option>
              <option value="mkv">MKV (Pro/Lossless)</option>
              <option value="mp3">MP3 (Universal)</option>
              <option value="m4a">M4A (Apple Optimized)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: 'var(--text-dim)' }}>Quality Target</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value)} style={selectStyle}>
              <option value="best">Original Best</option>
              <option value="1080">1080p HD</option>
              <option value="720">720p Balanced</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: 'var(--text-dim)' }}>Download Speed</label>
            <select value={speed} onChange={(e) => setSpeed(e.target.value)} style={selectStyle}>
              <option value="normal">Normal (Stable)</option>
              <option value="fast">Turbo (8 Threads)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: 'var(--text-dim)' }}>Scope</label>
            <select value={scope} onChange={(e) => setScope(e.target.value)} style={selectStyle}>
              <option value="single">Single Item</option>
              <option value="playlist">Full Playlist</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: 'var(--text-dim)' }}>URL Placeholder</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/..."
              style={inputStyle}
            />
          </div>
        </div>

        {showWarning && (
          <div
            className="flex items-center gap-1.5 mt-3 text-sm"
            style={{ color: 'var(--warn)' }}
          >
            <AlertTriangle className="w-4 h-4" />
            Warning: Using MP3 for Video is not recommended. Switch to MP4.
          </div>
        )}

        <CodeBlock title="Auto-Generated Command">{command}</CodeBlock>

        <div className="flex gap-2.5 flex-wrap">
          <Button onClick={copyAndLog}>
            <Copy className="w-4 h-4" /> Copy Command
          </Button>
          <Button variant="success" onClick={saveFavorite}>
            <Star className="w-4 h-4" /> Save to Favs
          </Button>
        </div>
      </Card>

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg flex items-center gap-2" style={{ color: 'var(--text-dim)' }}>
            <History className="w-5 h-5" /> Recent Generation History
          </h3>
          {history.map((item, i) => (
            <div
              key={i}
              className="flex justify-between items-start gap-2.5 p-3 rounded-lg mb-2 text-sm"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                <code style={{ color: 'var(--success)' }}>{item.cmd}</code>
              </div>
              <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-dim)' }}>
                {item.time}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg flex items-center gap-2" style={{ color: 'var(--text-dim)' }}>
            <FolderHeart className="w-5 h-5" /> Saved Commands
          </h3>
          {favorites.map((fav, i) => (
            <Card
              key={i}
              className="!p-4 !mb-2.5"
              style={{ borderLeft: '3px solid var(--accent)' }}
            >
              <code
                className="text-xs block mb-2.5"
                style={{ color: 'var(--success)', wordBreak: 'break-all' }}
              >
                {fav}
              </code>
              <div className="flex gap-2.5 flex-wrap">
                <Button variant="ghost" onClick={() => onCopy(fav)}>Copy</Button>
                <Button
                  variant="ghost"
                  onClick={() => deleteFav(i)}
                  style={{ color: 'var(--error)' }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Section>
  );
}
