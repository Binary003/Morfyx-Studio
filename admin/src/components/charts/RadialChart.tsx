interface RadialChartProps {
    value: number;
}

export function RadialChart({ value }: RadialChartProps) {
    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <svg viewBox="0 0 100 100" className="h-36 w-36">
            <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="none"
            />
            <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="hsl(var(--neon-cyan))"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
            />
            <text x="50" y="54" textAnchor="middle" className="fill-foreground text-[10px] font-semibold">
                {value}%
            </text>
        </svg>
    );
}
