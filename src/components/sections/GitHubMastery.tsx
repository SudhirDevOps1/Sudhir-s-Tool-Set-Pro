import { GitBranch } from 'lucide-react';
import { Section } from '../Section';

interface Props {
  visible: boolean;
}

const gitCommands = [
  { cmd: 'git add .', purpose: 'Stage all local changes', tip: 'Use git status first' },
  { cmd: 'git commit -m "msg"', purpose: 'Create local snapshot', tip: 'Keep messages descriptive' },
  { cmd: 'git push origin main', purpose: 'Sync to Cloud (GitHub)', tip: 'Main is standard for new repos' },
  { cmd: 'git pull origin main', purpose: 'Sync from Cloud to Local', tip: 'Always pull before you push' },
];

export function GitHubMastery({ visible }: Props) {
  return (
    <Section id="github" visible={visible}>
      <h2
        className="flex items-center gap-3 text-3xl font-bold pb-2.5"
        style={{ color: 'var(--git-color)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <GitBranch className="w-7 h-7" /> GitHub Mastery
      </h2>

      <div
        className="overflow-x-auto rounded-xl mt-5"
        style={{ border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <table className="w-full" style={{ background: 'var(--card)', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="p-4 text-left" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                Command
              </th>
              <th className="p-4 text-left" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                Purpose
              </th>
              <th className="p-4 text-left" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                Pro Tip
              </th>
            </tr>
          </thead>
          <tbody>
            {gitCommands.map((row) => (
              <tr key={row.cmd}>
                <td className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <code>{row.cmd}</code>
                </td>
                <td className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {row.purpose}
                </td>
                <td className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {row.tip}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}
