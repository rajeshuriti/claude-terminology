interface BadgeProps {
  children: React.ReactNode;
  /** Hex color — sets text and background tint via inline styles. Overrides dm. */
  color?: string;
  /** Dark mode flag — used when color is not provided. */
  dm?: boolean;
  className?: string;
}

/**
 * Small rounded pill badge — covers the 27+ inline copies of `px-2 py-0.5 rounded-full`.
 *
 * @example
 * // Colored badge (uses inline style — safe from Tailwind purging)
 * <Badge color="#0ea5e9">enterprise</Badge>
 *
 * // Dark-mode-aware neutral badge
 * <Badge dm={dm}>tag</Badge>
 */
export function Badge({ children, color, dm = false, className = '' }: BadgeProps) {
  const style = color ? { background: color + '22', color } : undefined;
  const themeClass = color
    ? ''
    : dm ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600';

  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${themeClass} ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
