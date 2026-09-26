import type { TempPoint } from "../domain/types";

/** 温度曲线（纯 SVG，无外部依赖） */
export function TempCurve({ points, frozen }: { points: TempPoint[]; frozen: boolean }) {
  if (points.length === 0) {
    return <p className="muted">暂无温度记录</p>;
  }
  const W = 560;
  const H = 180;
  const PAD = 34;
  const temps = points.map((p) => p.celsius);
  const lo = Math.min(...temps);
  const hi = Math.max(...temps);
  const span = hi - lo || 1;
  const x = (i: number) =>
    points.length === 1 ? W / 2 : PAD + (i * (W - PAD * 2)) / (points.length - 1);
  const y = (t: number) => H - PAD - ((t - lo) * (H - PAD * 2)) / span - 0;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.celsius)}`).join(" ");

  return (
    <figure className="temp-figure">
      <svg viewBox={`0 0 ${W} ${H}`} className="temp-chart" role="img" aria-label="环境温度曲线">
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#d9e2ef" />
        <line x1={PAD} y1={10} x2={PAD} y2={H - PAD} stroke="#d9e2ef" />
        <text x={4} y={y(hi) + 4} fontSize="11" fill="#64748b">
          {hi.toFixed(1)}℃
        </text>
        <text x={4} y={y(lo) + 4} fontSize="11" fill="#64748b">
          {lo.toFixed(1)}℃
        </text>
        <path d={path} fill="none" stroke="#a16207" strokeWidth="2.5" />
        {points.map((p, i) => (
          <g key={`${p.at}-${i}`}>
            <circle cx={x(i)} cy={y(p.celsius)} r="3.5" fill="#365314" />
            <text x={x(i)} y={H - PAD + 14} fontSize="9" fill="#64748b" textAnchor="middle">
              {p.at.slice(5)}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="muted">
        环境温度曲线 · {points.length} 个读数
        {frozen ? " · 已随封存冻结" : ""}
      </figcaption>
    </figure>
  );
}
