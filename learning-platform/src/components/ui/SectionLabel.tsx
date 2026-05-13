import { tw } from '@/lib/dm';

interface SectionLabelProps {
  children: React.ReactNode;
  dm: boolean;
  className?: string;
  as?: 'h2' | 'h3' | 'h4' | 'div';
}

/**
 * Standard section header — "text-xs font-bold uppercase tracking-wider" with dark-mode muted color.
 * Replaces the 30+ inline copies of this pattern.
 *
 * @example
 * <SectionLabel dm={dm}>Authentication</SectionLabel>
 * <SectionLabel dm={dm} as="h2" className="mb-4">Overview</SectionLabel>
 */
export function SectionLabel({ children, dm, className = '', as: Tag = 'h3' }: SectionLabelProps) {
  return (
    <Tag className={`text-xs font-bold uppercase tracking-wider ${tw(dm, 'muted')} ${className}`}>
      {children}
    </Tag>
  );
}
