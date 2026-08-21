import type { CSSProperties } from "react";

type IconProps = { className?: string; style?: CSSProperties };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function LayoutDashboardIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

export function ListChecksIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="m3 5 2 2 4-4" />
      <path d="m3 15 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  );
}

export function TagsIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M3 8V4a1 1 0 0 1 1-1h4l9 9-5 5-9-9Z" />
      <circle cx="6.5" cy="6.5" r="1.1" />
      <path d="m13 3 8 8-4.5 4.5" />
    </svg>
  );
}

export function QuoteIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M9 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2H4" />
      <path d="M20 6h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2h-1" />
    </svg>
  );
}

export function UsersIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.9" />
      <path d="M18 14.4A5 5 0 0 1 21 19v1" />
    </svg>
  );
}

export function FileDownIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M12 12v5" />
      <path d="m9.5 14.5 2.5 2.5 2.5-2.5" />
    </svg>
  );
}

export function ChevronDownIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ShieldCheckIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M12 3 5 5.6v5.1c0 4 2.7 6.9 7 8.3 4.3-1.4 7-4.3 7-8.3V5.6L12 3Z" />
      <path d="m9 11.6 2.1 2.1L15 9.8" />
    </svg>
  );
}

export function LockIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function DatabaseIcon({ className, style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13" />
      <path d="M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3" />
    </svg>
  );
}
