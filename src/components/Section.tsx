import { useEffect, useRef, useState, type ReactNode } from 'react';

interface SectionProps {
  id: string;
  children: ReactNode;
  visible: boolean;
}

export function Section({ id, children, visible }: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIsInView(true);
        });
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!visible) return null;

  return (
    <section
      id={id}
      ref={ref}
      className="mb-16 pt-5 transition-all duration-600"
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(20px)',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {children}
    </section>
  );
}
