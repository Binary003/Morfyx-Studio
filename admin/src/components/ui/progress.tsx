import { cn } from "../../utils/cn";

interface ProgressProps {
    value: number;
}

export function Progress({ value }: ProgressProps) {
    return (
        <div className="h-2 w-full rounded-full bg-muted">
            <div
                className={cn("h-2 rounded-full bg-accent")}
                style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
            />
        </div>
    );
}
