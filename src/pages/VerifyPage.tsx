// 页面层：核对台。展示待核对样本，补写现场照片编号后归回案件。
import { useState } from "react";
import { CaseInfo, Sample } from "../domain";

interface Props {
  cases: CaseInfo[];
  samples: Sample[];
  onVerify: (id: string, photoNo: string) => string | null;
}

export default function VerifyPage({ cases, samples, onVerify }: Props) {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const held = samples.filter((s) => s.status === "held");
  const caseOf = (id: string) => cases.find((c) => c.id === id);

  const submit = (id: string) => {
    const error = onVerify(id, photos[id] ?? "");
    setErrors((prev) => ({ ...prev, [id]: error ?? "" }));
    if (!error) {
      setPhotos((prev) => ({ ...prev, [id]: "" }));
    }
  };

  return (
    <section className="panel">
      <div className="heading">
        <div>
          <p>核对台</p>
          <h2>待核对样本（{held.length}）</h2>
        </div>
      </div>
      {held.length === 0 ? (
        <p className="empty">当前没有待核对样本。</p>
      ) : (
        <div className="records">
          {held.map((s) => {
            const c = caseOf(s.caseId);
            return (
              <article key={s.id} className="verify-row">
                <div className="verify-info">
                  <h3>
                    {s.barcode}
                    <span className="badge held">待核对</span>
                  </h3>
                  <p>
                    {c ? `${c.code} · ${c.name}` : "未知案件"} · {s.grid} · {s.species} · {s.stage}
                  </p>
                  <p className="reason">留置原因：{s.holdReasons.join("、")}</p>
                </div>
                <div className="verify-form">
                  <input
                    placeholder="现场照片编号，如 IMG-052-013"
                    value={photos[s.id] ?? ""}
                    onChange={(e) =>
                      setPhotos((prev) => ({ ...prev, [s.id]: e.target.value }))
                    }
                  />
                  <button className="primary" onClick={() => submit(s.id)}>
                    核对归回
                  </button>
                  {errors[s.id] && <p className="notice err">{errors[s.id]}</p>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
