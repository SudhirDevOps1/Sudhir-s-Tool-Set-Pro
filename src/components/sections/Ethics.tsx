import { Heart } from 'lucide-react';
import { Section } from '../Section';
import { Card } from '../Card';

interface Props {
  visible: boolean;
}

export function Ethics({ visible }: Props) {
  return (
    <Section id="best" visible={visible}>
      <h2
        className="flex items-center gap-3 text-3xl font-bold pb-2.5"
        style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Heart className="w-7 h-7" /> Educational & Ethical Use
      </h2>

      <Card
        style={{
          borderLeft: '4px solid var(--accent)',
          background: 'linear-gradient(to right, rgba(56,189,248,0.05), transparent)',
        }}
      >
        <p className="text-[0.95rem] m-0">
          This tool is built to simplify <strong>Personal Archival</strong> and{' '}
          <strong>Educational Research</strong>. Sudhir encourages users to support creators by
          watching content on official platforms and purchasing media where available. Always respect{' '}
          <strong>Copyright Laws</strong> and Platform <strong>Terms of Service</strong>.
        </p>
      </Card>
    </Section>
  );
}
