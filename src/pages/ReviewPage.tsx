import { useState } from "react";
import type { CaseFile, Sample } from "../domain/types";

interface Props {
  cases: CaseFile[];
  samples: Sample[];
  onRelease: (id: string, photoNo: string, reviewer: string) => boolean;
}

/** 待核对页：核对人员补写现场照片编号后归回案件 */
export function ReviewPage({ cases, samples, onRelease }: Props) {
  const pending = samples.filter((s) => s.status === "pending");
  const [photoNo, setPhotoNo] = useState<Record<string, string>>({});
  const [reviewer, setReviewer] = useState<Record<string, string>>({});
  const [err, setErr] = useState<Record<string, string>>({});

  const submit = (id: string) => {
    const ok = onRelease(id, photoNo[id] ?? "", reviewer[id] ?? "");
    if (!ok) {
      setErr((m) => ({ ...m, [id]: "必须补写现场照片编号才能归回案件" }));
      return;
    }
    setErr((m) => ({ ...m, [id]: "" }));
  };

  return (
    <section className="panel">
      <div className="heading">
        <div>
          <p>核对台</p>
          <h2>待核对样本（{pending.length}）</h2>
        </div>
      </div>
      {pending.length === 0 && <p className="muted">当前没有待核对样本。</p>}
      <div className="records">
        {pending.map((s) => {
          const c = cases.find((x) => x.id === s.caseId);
          return (
            <article key={s.id} className="review-card">
              <div className="review-main">
                <h3>
                  {s.id}
                  <span className="badge badge-pending">待核对</span>
                </h3>
                <p>
                  {s.caseId} · {c?.title} · 条码 {s.barcode} · 网格 {s.grid} · {s.species} / {s.devStage}
                </p>
                <ul className="reason-list">
                  {s.holdReasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <div className="review-form">
                <label>
                  <span>现场照片编号 *</span>
                  <input
                    value={photoNo[s.id] ?? ""}
                    onChange={(e) => setPhotoNo((m) => ({ ...m, [s.id]: e.target.value }))}
                    placeholder="如 IMG-2031"
                  />
                </label>
                <label>
                  <span>核对人员</span>
                  <input
                    value={reviewer[s.id] ?? ""}
                    onChange={(e) => setReviewer((m) => ({ ...m, [s.id]: e.target.value }))}
                    placeholder="姓名"
                  />
                </label>
                <button className="primary" onClick={() => submit(s.id)}>
                  核对归回案件
                </button>
                {err[s.id] && <p className="error-text">{err[s.id]}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
