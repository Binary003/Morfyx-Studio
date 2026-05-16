import type { HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-muted text-mutedForeground",
    success: "bg-emerald-500/20 text-emerald-200",
    warning: "bg-amber-500/20 text-amber-200",
    danger: "bg-rose-500/20 text-rose-200",
    info: "bg-cyan-500/20 text-cyan-200",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
