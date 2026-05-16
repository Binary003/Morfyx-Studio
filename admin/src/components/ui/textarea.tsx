import type { TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[120px] w-full rounded-xl border border-border bg-card/60 px-3 py-2 text-sm",
        "placeholder:text-mutedForeground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className
      )}
      {...props}
    />
  );
}
