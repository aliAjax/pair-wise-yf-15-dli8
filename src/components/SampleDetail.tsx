import type { CaseFile, Sample } from "../domain/types";
import { STATUS_CLASS, STATUS_LABEL, canReexam, canSeal } from "../domain/rules";
import { TempCurve } from "./TempCurve";

interface Props {
  sample: Sample;
  cases: CaseFile[];
  samples: Sample[];
  onSeal: (id: string) => void;
  onReexam: (id: string) => void;
  onClose: () => void;
}

/** 单个样本详情卡片：字段、温度曲线、历次核对、封存副本 */
export function SampleDetail({ sample, cases, samples, onSeal, onReexam, onClose }: Props) {
  const caseFile = cases.find((c) => c.id === sample.caseId);
  const copies = samples.filter((s) => s.copyOf === sample.id);
  const origin = sample.copyOf ? samples.find((s) => s.id === sample.copyOf) : undefined;

  const fields: Array<[string, string]> = [
    ["所属案件", `${sample.caseId} · ${caseFile?.title ?? "未知案件"}`],
    ["容器条码", sample.barcode],
    ["采样网格", sample.grid],
    ["环境温度", `${sample.temperature.toFixed(1)} ℃`],
    ["暴露阶段", sample.exposureStage],
    ["虫种", sample.species],
    ["发育阶段", sample.devStage],
    ["保存方式", sample.preservation],
    ["采样时刻", sample.sampledAt.replace("T", " ")],
    ["现场照片编号", sample.photoNo ?? "未补写"],
  ];

  return (
    <div className="drawer-mask" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <header className="drawer-head">
          <div>
            <p className="eyebrow">样本详情</p>
            <h2>
              {sample.id}
              <span className={`badge ${STATUS_CLASS[sample.status]}`}>{STATUS_LABEL[sample.status]}</span>
              {sample.copyOf && <span className="badge badge-copy">复检副本</span>}
            </h2>
          </div>
          <button onClick={onClose} aria-label="关闭详情">
            ✕
          </button>
        </header>

        {sample.holdReasons.length > 0 && (
          <div className="alert">
            <strong>待核对原因</strong>
            <ul>
              {sample.holdReasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        {origin && (
          <p className="muted">
            本样本为封存样本 <b>{origin.id}</b> 的复检副本，原记录与温度曲线未改动。
          </p>
        )}

        <dl className="detail-grid">
          {fields.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <h3>温度曲线</h3>
        <TempCurve points={sample.tempCurve} frozen={sample.status === "sealed"} />

        <h3>历次核对</h3>
        {sample.reviews.length === 0 ? (
          <p className="muted">暂无核对记录</p>
        ) : (
          <ol className="timeline">
            {sample.reviews.map((r, i) => (
              <li key={`${r.at}-${i}`}>
                <b>{r.action}</b>
                <span className="muted">
                  {r.at} · {r.actor}
                </span>
                <p>{r.note}</p>
              </li>
            ))}
          </ol>
        )}

        <h3>封存副本</h3>
        {copies.length === 0 ? (
          <p className="muted">暂无复检副本</p>
        ) : (
          <ul className="copy-list">
            {copies.map((c) => (
              <li key={c.id}>
                <b>{c.id}</b> · 条码 {c.barcode} · {STATUS_LABEL[c.status]}
              </li>
            ))}
          </ul>
        )}

        <footer className="drawer-actions">
          {canSeal(sample) && (
            <button className="primary" onClick={() => onSeal(sample.id)}>
              封存样本
            </button>
          )}
          {canReexam(sample) && (
            <button className="primary" onClick={() => onReexam(sample.id)}>
              发起复检（建立副本）
            </button>
          )}
          {sample.status === "sealed" && (
            <span className="muted">封存于 {sample.sealedAt}</span>
          )}
        </footer>
      </aside>
    </div>
  );
}
