interface BarChartProps {
    data: number[];
}

export function BarChart({ data }: BarChartProps) {
    const max = Math.max(...data, 1);

    return (
        <div className="flex h-36 items-end gap-2">
            {data.map((value, index) => (
                <div
                    key={index}
                    className="flex-1 rounded-t-lg bg-neonPurple/60"
                    style={{ height: `${(value / max) * 100}%` }}
                />
            ))}
        </div>
    );
}
