// 页面层：样本详情。展示留存温度曲线、历次核对记录与封存副本，并承接封存/复检操作。
import { CaseInfo, STATUS_LABEL, Sample, TempPoint } from "../domain";

interface Props {
  sample: Sample;
  samples: Sample[];
  cases: CaseInfo[];
  onClose: () => void;
  onOpen: (id: string) => void;
  onSeal: (id: string) => void;
  onReexam: (id: string) => void;
}

function Curve({ curve }: { curve: TempPoint[] }) {
  const w = 360;
  const h = 110;
  const pad = 12;
  const temps = curve.map((p) => p.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const span = max - min || 1;
  const xy = (i: number, temp: number) => ({
    x: pad + (i * (w - 2 * pad)) / (curve.length - 1),
    y: h - pad - ((temp - min) / span) * (h - 2 * pad),
  });
  const points = curve
    .map((p, i) => {
      const { x, y } = xy(i, p.temp);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <div className="curve-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} className="curve" role="img" aria-label="留存温度曲线">
        <polyline points={points} fill="none" stroke="#365314" strokeWidth="2.5" strokeLinejoin="round" />
        {curve.map((p, i) => {
          const { x, y } = xy(i, p.temp);
          return <circle key={p.t} cx={x} cy={y} r="2.6" fill="#a16207" />;
        })}
      </svg>
      <div className="curve-scale">
        <span>{curve[0].t}</span>
        <span>
          {min.toFixed(1)}℃ ~ {max.toFixed(1)}℃
        </span>
        <span>{curve[curve.length - 1].t}</span>
      </div>
    </div>
  );
}

export default function SampleDetail({
  sample,
  samples,
  cases,
  onClose,
  onOpen,
  onSeal,
  onReexam,
}: Props) {
  const caseInfo = cases.find((c) => c.id === sample.caseId);
  const copies = samples.filter((s) => s.parentId === sample.id);
  const parent = sample.parentId ? samples.find((s) => s.id === sample.parentId) : undefined;
  const history = [...sample.history].reverse();

  const fields: [string, string][] = [
    ["所属案件", caseInfo ? `${caseInfo.code} · ${caseInfo.name}` : "—"],
    ["容器条码", sample.barcode],
    ["采样网格", sample.grid],
    ["环境温度", `${sample.temperature}℃`],
    ["暴露阶段", sample.exposure],
    ["虫种", sample.species],
    ["发育阶段", sample.stage],
    ["保存方式", sample.preservation],
    ["采样时刻", sample.sampledAt],
    ["现场照片编号", sample.photoNo ?? "未补写"],
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="heading">
          <div>
            <p>样本详情</p>
            <h2>
              {sample.barcode}
              <span className={`badge ${sample.status}`}>{STATUS_LABEL[sample.status]}</span>
              {sample.isCopy && <span className="tag">复检副本</span>}
            </h2>
          </div>
          <button onClick={onClose}>关闭</button>
        </div>

        {parent && (
          <p className="notice">
            本样本为封存样本 {parent.barcode} 的复检副本，
            <button className="link" onClick={() => onOpen(parent.id)}>
              查看原样本
            </button>
          </p>
        )}

        <div className="detail-grid">
          {fields.map(([k, v]) => (
            <div key={k} className="detail-item">
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </div>

        <h3 className="section-title">留存温度曲线</h3>
        <Curve curve={sample.tempCurve} />

        <h3 className="section-title">历次核对与流转记录</h3>
        <ul className="history">
          {history.map((h, i) => (
            <li key={`${h.time}-${i}`}>
              <span className="time">{h.time}</span>
              <span className="type">{h.type}</span>
              <span className="detail">{h.detail}</span>
            </li>
          ))}
        </ul>

        <h3 className="section-title">封存副本（{copies.length}）</h3>
        {copies.length === 0 ? (
          <p className="empty">暂无复检副本。</p>
        ) : (
          <div className="records">
            {copies.map((c) => (
              <article key={c.id}>
                <b>{c.barcode}</b>
                <div>
                  <h3>{c.createdAt} 建立</h3>
                  <p>{c.history[0]?.detail}</p>
                </div>
                <span className={`badge ${c.status}`}>{STATUS_LABEL[c.status]}</span>
                <button onClick={() => onOpen(c.id)}>详情</button>
              </article>
            ))}
          </div>
        )}

        <div className="modal-actions">
          {sample.status === "in_queue" && (
            <button className="primary" onClick={() => onSeal(sample.id)}>
              封存样本
            </button>
          )}
          {sample.status === "sealed" && (
            <button className="primary" onClick={() => onReexam(sample.id)}>
              发起复检（仅建立副本）
            </button>
          )}
          {sample.status === "held" && (
            <p className="notice held">该样本保留待核对，请先在核对台补写现场照片编号。</p>
          )}
        </div>
      </div>
    </div>
  );
}
