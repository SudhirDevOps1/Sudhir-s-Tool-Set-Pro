import { useState } from 'react';
import { Hammer, AlertCircle, Zap, HelpCircle, ChevronDown } from 'lucide-react';
import { Section } from '../Section';
import { Card } from '../Card';
import { CodeBlock } from '../CodeBlock';

interface Props {
  visible: boolean;
}

export function Troubleshooting({ visible }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Section id="troubleshoot" visible={visible}>
      <h2
        className="flex items-center gap-3 text-3xl font-bold pb-2.5"
        style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Hammer className="w-7 h-7" /> Troubleshooting & Fixes
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <h4 className="m-0 font-bold flex items-center gap-2" style={{ color: 'var(--warn)' }}>
            <AlertCircle className="w-5 h-5" /> No Audio/Merging?
          </h4>
          <span className="text-xs mt-1 block" style={{ color: 'var(--text-dim)' }}>
            FFmpeg path is not set in Windows environment.
          </span>
          <CodeBlock compact>{'set PATH=E:\\ffmpeg\\bin;%PATH%'}</CodeBlock>
        </Card>

        <Card>
          <h4 className="m-0 font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <Zap className="w-5 h-5" /> Fragmented Streams
          </h4>
          <span className="text-xs mt-1 block" style={{ color: 'var(--text-dim)' }}>
            Fix slow speed or random connection drops.
          </span>
          <CodeBlock compact>{'-N 8 --concurrent-fragments 5'}</CodeBlock>
        </Card>

        <Card>
          <h4 className="m-0 font-bold flex items-center gap-2" style={{ color: 'var(--success)' }}>
            <HelpCircle className="w-5 h-5" /> Geo-Blocked?
          </h4>
          <span className="text-xs mt-1 block" style={{ color: 'var(--text-dim)' }}>
            Bypass regional restrictions easily.
          </span>
          <CodeBlock compact>{'--geo-bypass --proxy IP:PORT'}</CodeBlock>
        </Card>
      </div>

      {/* Expandable Pro Tips */}
      <Card
        className="!cursor-pointer mt-4"
        style={{ background: 'rgba(255,255,255,0.02)' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className="font-bold flex items-center gap-2.5"
          style={{ color: 'var(--accent)' }}
        >
          <ChevronDown
            className="w-5 h-5 transition-transform duration-200"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
          View Professional Pro Tips (Advanced)
        </div>
        {expanded && (
          <div className="mt-5 text-sm" style={{ color: 'var(--text-dim)' }}>
            <ul className="space-y-2 pl-5">
              <li>
                <strong>Metadata:</strong> Use <code>--add-metadata --embed-thumbnail</code> for a
                professional library look.
              </li>
              <li>
                <strong>Cookies:</strong> Use <code>--cookies-from-browser chrome</code> if a video
                requires login.
              </li>
              <li>
                <strong>Quality:</strong> For the absolute highest quality (AV1), ensure FFmpeg 5.0+
                is installed.
              </li>
            </ul>
          </div>
        )}
      </Card>
    </Section>
  );
}
