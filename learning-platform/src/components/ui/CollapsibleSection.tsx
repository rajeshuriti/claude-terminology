import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { tw } from '@/lib/dm';

interface CollapsibleSectionProps {
  title: string;
  dm: boolean;
  children: React.ReactNode;
  /** Whether the section starts open. Default false. */
  defaultOpen?: boolean;
  /** Extra classes applied to the outer container. */
  className?: string;
  /** Extra classes applied to the header button row. */
  headerClassName?: string;
  /** Optional element rendered to the right of the title (e.g. a badge). */
  headerRight?: React.ReactNode;
}

/**
 * Animated accordion section with chevron toggle.
 * Replaces the 41+ inline copies of the open/close + AnimatePresence pattern.
 *
 * @example
 * <CollapsibleSection dm={dm} title="Authentication">
 *   <p className="p-4 text-sm">Content here</p>
 * </CollapsibleSection>
 *
 * // With a badge on the right:
 * <CollapsibleSection dm={dm} title="Rate Limits" headerRight={<Badge dm={dm}>critical</Badge>}>
 *   ...
 * </CollapsibleSection>
 */
export function CollapsibleSection({
  title, dm, children, defaultOpen = false, className = '', headerClassName = '', headerRight,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl border overflow-hidden ${tw(dm, 'border')} ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${tw(dm, 'hover')} ${headerClassName}`}
      >
        <span className={`flex-1 font-semibold text-sm ${tw(dm, 'heading')}`}>{title}</span>
        {headerRight}
        {open
          ? <ChevronUp size={14} className={tw(dm, 'muted')} />
          : <ChevronDown size={14} className={tw(dm, 'muted')} />
        }
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
