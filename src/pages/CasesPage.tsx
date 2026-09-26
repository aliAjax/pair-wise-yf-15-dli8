// 页面层：案件总览。按案件聚合展示样本与状态。
import { CaseInfo, STATUS_LABEL, Sample } from "../domain";

interface Props {
  cases: CaseInfo[];
  samples: Sample[];
  onOpen: (id: string) => void;
}

export default function CasesPage({ cases, samples, onOpen }: Props) {
  return (
    <div className="case-grid">
      {cases.map((c) => {
        const list = samples.filter((s) => s.caseId === c.id);
        return (
          <section key={c.id} className="panel case-card">
            <div className="heading">
              <div>
                <p>{c.code}</p>
                <h2>{c.name}</h2>
              </div>
              <span className="count">{list.length} 份</span>
            </div>
            {list.length === 0 ? (
              <p className="empty">暂无样本。</p>
            ) : (
              <div className="records">
                {list.map((s) => (
                  <article key={s.id}>
                    <b>{s.barcode}</b>
                    <div>
                      <h3>
                        {s.species} · {s.stage}
                        {s.isCopy && <span className="tag">复检副本</span>}
                      </h3>
                      <p>
                        {s.grid} · {s.temperature}℃ · {s.exposure}
                      </p>
                    </div>
                    <span className={`badge ${s.status}`}>{STATUS_LABEL[s.status]}</span>
                    <button onClick={() => onOpen(s.id)}>详情</button>
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
