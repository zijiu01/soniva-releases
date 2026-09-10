export function SonivaLogo({ animated = false }: { animated?: boolean }) {
  return (
    <span className="soniva-logo-mark relative flex size-6 items-center justify-center" data-animated={animated} aria-label="Soniva">
      <svg className="soniva-logo-static size-6 overflow-visible" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <polyline points="6.24851863 26.000887 14 26 16 16 21 27 24 22 34.8677469 22.0006132" strokeLinejoin="miter" strokeLinecap="butt" />
        <circle cx="20" cy="20" r="15" />
      </svg>
      <svg className="soniva-logo-motion absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 overflow-visible opacity-0" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
        <circle className="soniva-logo-mouth" cx="20" cy="20" r="15" />
        <polyline className="soniva-logo-wave" points="6.24851863 26.000887 14 26 16 16 21 27 24 22 34.8677469 22.0006132" strokeLinejoin="miter" strokeLinecap="butt" />
      </svg>
    </span>
  );
}
