import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'dark' | 'brand' | 'amber' | 'emerald' | 'neutral' | 'red' | 'blue';
  className?: string;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<NonNullable<BadgeProps['variant']>, string> = {
  dark: 'bg-[#181818] text-white border border-zinc-800',
  brand: 'bg-[#181818] text-[#FF8407] border border-zinc-800',
  amber: 'bg-amber-100 text-amber-800 border border-amber-300',
  emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  neutral: 'bg-[#F2F1EC] text-[#181818] border border-[#E4E2DA]',
  red: 'bg-red-50 text-red-700 border border-red-200',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200',
};

/**
 * Shared flexible Badge component that never clips or truncates text.
 * Automatically wraps up to 2 lines if needed instead of overflowing its container.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  icon,
}) => {
  return (
    <span
      className={`ui-badge inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold leading-snug min-w-0 max-w-full break-words whitespace-normal ${VARIANT_STYLES[variant]} ${className}`}
    >
      {icon && <span className="shrink-0 flex items-center">{icon}</span>}
      <span className="min-w-0 break-words">{children}</span>
    </span>
  );
};

export interface FilterPillProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  dotColor?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  className?: string;
}

/**
 * Shared FilterPill button that wraps cleanly inside flex-wrap filter bars
 * and never cuts off text at container borders.
 */
export const FilterPill: React.FC<FilterPillProps> = ({
  active,
  onClick,
  children,
  dotColor,
  activeClassName = 'bg-[#181818] text-white border-[#181818]',
  inactiveClassName = 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50',
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ui-pill px-2.5 py-1.5 rounded-lg font-bold text-[11px] leading-snug transition-colors cursor-pointer border inline-flex items-center gap-1.5 min-w-0 max-w-full whitespace-normal text-left ${
        active ? activeClassName : inactiveClassName
      } ${className}`}
    >
      {dotColor && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span className="min-w-0 break-words">{children}</span>
    </button>
  );
};

export interface SpecValueProps {
  label?: string;
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  mono?: boolean;
  className?: string;
}

/**
 * Shared Specification Value block that wraps to 2+ lines cleanly
 * without ever cutting off measurements, thicknesses, or dimensions.
 */
export const SpecValue: React.FC<SpecValueProps> = ({
  label,
  primary,
  secondary,
  mono = false,
  className = '',
}) => {
  return (
    <div className={`min-w-0 ${className}`}>
      {label && (
        <span className="text-[10px] uppercase font-bold text-[#9C9A90] block leading-tight mb-0.5">
          {label}
        </span>
      )}
      <span
        className={`font-semibold text-[#181818] block leading-snug break-words whitespace-normal ${
          mono ? 'font-mono' : ''
        }`}
      >
        {primary}
      </span>
      {secondary && (
        <span className="text-[10px] text-[#6B6A63] block leading-snug break-words whitespace-normal mt-0.5">
          {secondary}
        </span>
      )}
    </div>
  );
};
