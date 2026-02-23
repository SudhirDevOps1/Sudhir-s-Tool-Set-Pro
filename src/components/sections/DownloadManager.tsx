import { useState } from 'react';
import { Download, Settings, Play, Shield, Tag } from 'lucide-react';
import { Section } from '../Section';
import { Card } from '../Card';
import { Button } from '../Button';

interface Props {
  visible: boolean;
  showToast: (msg: string) => void;
}

export function DownloadManager({ visible, showToast }: Props) {
  const [maxSpeed, setMaxSpeed] = useState('');
  const [_throttleSleep, setThrottleSleep] = useState('');
  const [_fragments, setFragments] = useState('');
  const [extras, setExtras] = useState<string[]>([]);

  const buildFlags = () => {
    const parts: string[] = [];
    if (maxSpeed) parts.push(`--rate-limit ${maxSpeed}`);
    if (_throttleSleep) parts.push(`--throttling-sleep-interval ${_throttleSleep}`);
    if (_fragments) parts.push(`--concurrent-fragments ${_fragments}`);
    extras.forEach((e) => parts.push(e));
    return parts.join(' ');
  };

  const addExtra = (flag: string, label: string) => {
    if (!extras.includes(flag)) {
      setExtras((prev) => [...prev, flag]);
      showToast(`${label} added!`);
    }
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

  const flags = buildFlags();

  return (
    <Section id="manager" visible={visible}>
      <h2
        className="flex items-center gap-3 text-3xl font-bold pb-2.5"
        style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Download className="w-7 h-7" /> Download Manager
      </h2>

      <Card>
        <h4 className="m-0 font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
          <Settings className="w-5 h-5" /> Advanced Options
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Max Download Speed
            </label>
            <select value={maxSpeed} onChange={(e) => setMaxSpeed(e.target.value)} style={selectStyle}>
              <option value="">Unlimited</option>
              <option value="100K">100 KB/s</option>
              <option value="500K">500 KB/s</option>
              <option value="1M">1 MB/s</option>
              <option value="2M">2 MB/s</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Throttling Sleep (seconds)
            </label>
            <input
              type="number"
              placeholder="0"
              min={0}
              onChange={(e) => setThrottleSleep(e.target.value)}
              style={selectStyle}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Concurrent Fragments
            </label>
            <input
              type="number"
              placeholder="1"
              min={1}
              max={20}
              onChange={(e) => setFragments(e.target.value)}
              style={selectStyle}
            />
          </div>
        </div>

        <div className="flex gap-2.5 flex-wrap mt-5">
          <Button onClick={() => addExtra('--continue', 'Resume option')}>
            <Play className="w-4 h-4" /> Resume Failed Downloads
          </Button>
          <Button onClick={() => addExtra('--ignore-errors', 'Ignore errors option')}>
            <Shield className="w-4 h-4" /> Ignore Errors
          </Button>
          <Button onClick={() => addExtra('--add-metadata --embed-thumbnail --embed-subs', 'Metadata options')}>
            <Tag className="w-4 h-4" /> Add Metadata
          </Button>
        </div>

        {flags && (
          <div
            className="mt-5 rounded-xl overflow-hidden"
            style={{ background: 'var(--code-bg)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div
              className="px-4 py-2.5 text-xs"
              style={{ background: '#1f2937', color: 'var(--text-dim)' }}
            >
              Generated Flags
            </div>
            <pre
              className="m-0 p-4 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm"
              style={{ color: '#10b981' }}
            >
              {flags}
            </pre>
          </div>
        )}
      </Card>
    </Section>
  );
}
