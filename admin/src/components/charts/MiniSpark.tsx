interface MiniSparkProps {
  data: number[];
}

export function MiniSpark({ data }: MiniSparkProps) {
  const max = Math.max(...data, 1);
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 30 - (value / max) * 30;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 30" className="h-6 w-16">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={points} className="text-neonPink" />
    </svg>
  );
}
