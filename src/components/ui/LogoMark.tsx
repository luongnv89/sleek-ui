interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Top horizontal bar */}
      <line x1="10" y1="14" x2="38" y2="14" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
      {/* Diagonal slash */}
      <line x1="38" y1="14" x2="20" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
      {/* Bottom horizontal bar */}
      <line x1="20" y1="50" x2="54" y2="50" stroke="currentColor" strokeWidth="4" strokeLinecap="square" />
      {/* AI node at midpoint of diagonal */}
      <circle cx="29" cy="32" r="3.5" fill="#00FF41" />
    </svg>
  );
}
