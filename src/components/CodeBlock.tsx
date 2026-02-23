import type { ReactNode } from 'react';

interface CodeBlockProps {
  title?: string;
  children: ReactNode;
  compact?: boolean;
}

export function CodeBlock({ title, children, compact }: CodeBlockProps) {
  return (
    <div
      className="rounded-xl my-4 overflow-hidden"
      style={{
        background: 'var(--code-bg)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {title && (
        <div
          className="px-4 py-2.5 flex justify-between items-center text-xs"
          style={{ background: '#1f2937', color: 'var(--text-dim)' }}
        >
          <span>{title}</span>
        </div>
      )}
      <pre
        className="m-0 overflow-x-auto whitespace-pre-wrap break-words font-mono"
        style={{
          padding: compact ? '10px' : '20px',
          color: '#10b981',
          fontSize: compact ? '0.8rem' : '0.95rem',
        }}
      >
        {children}
      </pre>
    </div>
  );
}
