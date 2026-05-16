interface LineChartProps {
  data: number[];
}

export function LineChart({ data }: LineChartProps) {
  const max = Math.max(...data, 1);
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" className="h-40 w-full">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={points}
        className="text-neonCyan"
      />
      <polyline
        fill="rgba(180, 255, 255, 0.08)"
        stroke="none"
        points={`${points} 100,100 0,100`}
      />
    </svg>
  );
}
