import type { CaseFile, Sample } from "../domain/types";
import { STATUS_CLASS, STATUS_LABEL } from "../domain/rules";

interface Props {
  cases: CaseFile[];
  samples: Sample[];
  onSelect: (id: string) => void;
}

/** 案件关联页：按案件查看全部样本（含待核对与已封存） */
export function CasesPage({ cases, samples, onSelect }: Props) {
  return (
    <section className="panel">
      <div className="heading">
        <div>
          <p>案件关联</p>
          <h2>案件与样本（{cases.length} 案）</h2>
        </div>
      </div>
      <div className="case-grid">
        {cases.map((c) => {
          const list = samples.filter((s) => s.caseId === c.id);
          return (
            <article key={c.id} className="case-card">
              <header>
                <h3>{c.id}</h3>
                <p className="muted">
                  {c.title} · {c.scene} · 立案 {c.openedAt}
                </p>
              </header>
              {list.length === 0 ? (
                <p className="muted">本案暂无样本。</p>
              ) : (
                <ul className="case-sample-list">
                  {list.map((s) => (
                    <li key={s.id}>
                      <button className="link" onClick={() => onSelect(s.id)}>
                        {s.id}
                      </button>
                      <span>
                        {s.species} / {s.devStage} · 网格 {s.grid}
                      </span>
                      <span className={`badge ${STATUS_CLASS[s.status]}`}>{STATUS_LABEL[s.status]}</span>
                      {s.copyOf && <span className="badge badge-copy">副本</span>}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
