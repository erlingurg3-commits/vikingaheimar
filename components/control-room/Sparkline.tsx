type SparklineProps = {
  values: number[];
  stroke?: string;
  fill?: string;
  height?: number;
};

export default function Sparkline({ values, stroke = "#7F8A93", fill = "transparent", height = 56 }: SparklineProps) {
  if (values.length === 0) {
    return <div className="h-14 rounded-md bg-[#0e1d31]" />;
  }

  const width = 260;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-14 w-full" role="img" aria-label="Trend line">
      <polyline fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={points} />
      <polyline
        fill={fill}
        stroke="none"
        points={`${points} ${width},${height} 0,${height}`}
        opacity={fill === "transparent" ? 0 : 0.12}
      />
    </svg>
  );
}
