import { cn } from "../../utils/cn";

interface ProgressProps {
    value: number;
    className?: string;
}

export function Progress({ value, className }: ProgressProps) {
    return (
        <div className={`h-2 w-full rounded-full bg-muted ${className || ""}`}>
            <div
                className={cn("h-2 rounded-full bg-accent")}
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
}
