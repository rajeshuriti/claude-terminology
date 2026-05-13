// Dark-mode theme utility.
// All class strings below are static literals — Tailwind's purger includes them at build time.
// Usage: className={`rounded-xl border ${tw(dm, 'card', 'border')}`}

const PAIRS = {
  // Backgrounds
  page:      ['bg-slate-50',                      'bg-slate-950'],
  card:      ['bg-white',                          'bg-slate-900'],
  cardAlt:   ['bg-slate-50',                       'bg-slate-800'],
  section:   ['bg-slate-50',                       'bg-slate-800'],
  overlay:   ['bg-white',                          'bg-slate-800'],

  // Borders
  border:    ['border-slate-200',                  'border-slate-700'],
  borderSub: ['border-slate-100',                  'border-slate-800'],

  // Text
  heading:   ['text-slate-900',                    'text-white'],
  body:      ['text-slate-700',                    'text-slate-300'],
  muted:     ['text-slate-500',                    'text-slate-400'],
  label:     ['text-slate-400',                    'text-slate-500'],

  // Interactive
  hover:     ['hover:bg-slate-50',                 'hover:bg-slate-800'],
  hoverCard: ['hover:bg-slate-100',                'hover:bg-slate-700'],

  // Inputs
  input:     ['bg-white border-slate-200 text-slate-900',   'bg-slate-800 border-slate-600 text-slate-300'],

  // Code / monospace
  code:      ['bg-slate-900 text-slate-600',       'bg-slate-900 text-emerald-400'],
} as const;

type DmKey = keyof typeof PAIRS;

/**
 * Returns the correct Tailwind classes for the current dark-mode state.
 * Pass as many token keys as needed — they are joined with a space.
 *
 * @example
 * className={`rounded-xl border ${tw(dm, 'card', 'border')}`}
 * className={tw(dm, 'heading')}
 */
export function tw(dark: boolean, ...keys: DmKey[]): string {
  return keys.map(k => PAIRS[k][dark ? 1 : 0]).join(' ');
}
