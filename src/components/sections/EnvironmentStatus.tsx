import { Terminal, Copy, Download } from 'lucide-react';
import { Section } from '../Section';
import { Card } from '../Card';
import { Button } from '../Button';

interface Props {
  visible: boolean;
  onCopy: (text: string) => void;
}

export function EnvironmentStatus({ visible, onCopy }: Props) {
  const setupScript = `# Step 1: Install FFmpeg (WinGet)
winget install ffmpeg

# Step 2: Install yt-dlp
winget install yt-dlp

# Step 3: Test Installation
yt-dlp --version && ffmpeg -version`;

  return (
    <Section id="ready" visible={visible}>
      <h2
        className="flex items-center gap-3 text-3xl font-bold pb-2.5"
        style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Terminal className="w-7 h-7" /> Environment Status
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <div className="flex items-center gap-2.5 mb-2.5">
            <span
              className="w-2 h-2 rounded-full inline-block mr-1"
              style={{ background: 'var(--success)', boxShadow: '0 0 5px var(--success)' }}
            />
            <h4 className="m-0 font-bold">yt-dlp Core</h4>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            Recommended for Windows/Linux/Mac
          </span>
          <div className="flex gap-2.5 mt-4 flex-wrap">
            <Button variant="ghost" onClick={() => onCopy('yt-dlp --version')}>Check Version</Button>
            <Button variant="ghost" onClick={() => onCopy('yt-dlp -U')}>Update Tool</Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2.5 mb-2.5">
            <span
              className="w-2 h-2 rounded-full inline-block mr-1"
              style={{ background: 'var(--success)', boxShadow: '0 0 5px var(--success)' }}
            />
            <h4 className="m-0 font-bold">FFmpeg Engine</h4>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            Required for merging Video+Audio
          </span>
          <div className="flex gap-2.5 mt-4 flex-wrap">
            <Button variant="ghost" onClick={() => onCopy('ffmpeg -version')}>Check Engine</Button>
          </div>
        </Card>

        <Card>
          <h4 className="m-0 font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <Download className="w-5 h-5" /> Full Setup
          </h4>
          <span className="text-xs block mt-1" style={{ color: 'var(--text-dim)' }}>
            Install all tools in one click
          </span>
          <Button
            variant="success"
            className="w-full mt-4 justify-center"
            onClick={() => onCopy(setupScript)}
          >
            <Copy className="w-4 h-4" /> Copy Setup Script
          </Button>
        </Card>
      </div>
    </Section>
  );
}
