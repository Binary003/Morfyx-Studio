import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost" | "outline";
    size?: "sm" | "md" | "lg";
}

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary: "bg-primary text-primaryForeground hover:shadow-neon",
    secondary: "bg-muted text-foreground hover:bg-card",
    ghost: "bg-transparent hover:bg-card",
    outline: "border border-border bg-transparent hover:bg-card",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-sm",
};

export function Button({
    className,
    variant = "primary",
    size = "md",
    ...props
}: ButtonProps) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        />
    );
}
