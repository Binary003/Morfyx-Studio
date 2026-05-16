import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface SwitchProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
}

export function Switch({ checked, className, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative h-6 w-11 rounded-full border border-border transition",
        checked ? "bg-accent" : "bg-muted",
        className
      )}
      aria-checked={checked}
      role="switch"
      {...props}
    >
      <span
        className={cn(
          "absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-foreground transition",
          checked ? "left-6" : "left-1"
        )}
      />
    </button>
  );
}
