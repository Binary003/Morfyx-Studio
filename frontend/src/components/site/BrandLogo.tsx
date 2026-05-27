import { Link } from "@tanstack/react-router";
import { useState } from "react";

type BrandLogoProps = {
  className?: string;
  logoClassName?: string;
  textClassName?: string;
  taglineClassName?: string;
  showTagline?: boolean;
};

export function BrandLogo({
  className = "",
  logoClassName = "h-14 w-14 sm:h-20 sm:w-20",
  textClassName = "",
  taglineClassName = "",
  showTagline = true,
}: BrandLogoProps) {
  const [logoImageMissing, setLogoImageMissing] = useState(false);

  return (
    <Link to="/" className={`flex min-w-0 items-center gap-2 group ${className}`.trim()}>
      <div className={`flex shrink-0 items-center justify-center ${logoClassName}`}>
        {logoImageMissing ? (
          <span className="font-display text-3xl leading-none sm:text-4xl">M</span>
        ) : (
          <img
            src="/logo-m.png"
            alt="Morfyx Studio logo"
            className="h-full w-full object-contain"
            onError={() => setLogoImageMissing(true)}
          />
        )}
      </div>
      <div className={`min-w-0 leading-tight ${textClassName}`.trim()}>
        <div className="truncate font-display text-sm font-bold tracking-tight sm:text-lg">
          Morfyx <span className="text-gradient-neon">Studio</span>
        </div>
        {showTagline ? (
          <div
            className={`mt-0.5 truncate text-[8px] font-semibold uppercase tracking-[0.04em] text-foreground/80 sm:text-[11px] sm:tracking-[0.08em] sm:text-foreground/85 sm:whitespace-nowrap ${taglineClassName}`.trim()}
          >
            <span className="sm:hidden">COLLECT · DISPLAY · RELIVE</span>
            <span className="hidden sm:inline">
              COLLECT <span className="mx-1 text-foreground/55">|</span> DISPLAY <span className="mx-1 text-foreground/55">|</span> RELIVE
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  );
}