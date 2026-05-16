import { cn } from "../../utils/cn";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <div className="text-xs uppercase tracking-[0.3em] text-mutedForeground">Admin</div>
                <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
                {subtitle && <p className="text-sm text-mutedForeground mt-1">{subtitle}</p>}
            </div>
            {action && <div className={cn("flex items-center gap-2")}>{action}</div>}
        </div>
    );
}
