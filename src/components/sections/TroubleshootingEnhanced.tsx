import { Bug, WifiOff, Lock, Layers, List } from 'lucide-react';
import { Section } from '../Section';
import { Card } from '../Card';
import { CodeBlock } from '../CodeBlock';

interface Props {
  visible: boolean;
}

export function TroubleshootingEnhanced({ visible }: Props) {
  return (
    <Section id="troubleshoot-enhanced" visible={visible}>
      <h2
        className="flex items-center gap-3 text-3xl font-bold pb-2.5"
        style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Bug className="w-7 h-7" /> Troubleshooting & Solutions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <Card>
          <h4 className="m-0 font-bold flex items-center gap-2" style={{ color: 'var(--warn)' }}>
            <WifiOff className="w-5 h-5" /> Network Errors
          </h4>
          <span className="text-xs mt-1 block" style={{ color: 'var(--text-dim)' }}>
            Fix connection issues during downloads.
          </span>
          <CodeBlock compact>{'--retries 10 --fragment-retries 50 --socket-timeout 30'}</CodeBlock>
        </Card>

        <Card>
          <h4 className="m-0 font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <Lock className="w-5 h-5" /> Age-Restricted Content
          </h4>
          <span className="text-xs mt-1 block" style={{ color: 'var(--text-dim)' }}>
            Access age-gated videos using cookies.
          </span>
          <CodeBlock compact>{'--cookies-from-browser chrome --user-agent "Mozilla/5.0"'}</CodeBlock>
        </Card>

        <Card>
          <h4 className="m-0 font-bold flex items-center gap-2" style={{ color: 'var(--success)' }}>
            <Layers className="w-5 h-5" /> Extract Specific Formats
          </h4>
          <span className="text-xs mt-1 block" style={{ color: 'var(--text-dim)' }}>
            Download specific video/audio streams.
          </span>
          <CodeBlock compact>{'-f "bv[height<=1080][ext=mp4]+ba[ext=m4a]/b[ext=mp4]"'}</CodeBlock>
        </Card>
      </div>

      <Card className="mt-5">
        <h4 className="m-0 font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
          <List className="w-5 h-5" /> Common Solutions
        </h4>
        <ul className="pl-5 mt-4 space-y-2">
          <li>Update yt-dlp: <code>yt-dlp -U</code></li>
          <li>Clear cache: <code>yt-dlp --rm-cache-dir</code></li>
          <li>Force IPv4: <code>--ipv4</code></li>
          <li>Ignore errors: <code>--ignore-errors</code></li>
          <li>Custom headers: <code>{'--add-header "Referer: https://www.youtube.com"'}</code></li>
        </ul>
      </Card>
    </Section>
  );
}
