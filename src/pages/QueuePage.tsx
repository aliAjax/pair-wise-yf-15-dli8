import { useState } from "react";
import type { CaseFile, Sample } from "../domain/types";
import { DEV_STAGES, SPECIES, filterQueue } from "../domain/rules";

interface Props {
  cases: CaseFile[];
  samples: Sample[];
  onSelect: (id: string) => void;
}

/** 鉴定队列页：鉴定员按虫种与发育阶段筛选 */
export function QueuePage({ cases, samples, onSelect }: Props) {
  const [species, setSpecies] = useState("");
  const [devStage, setDevStage] = useState("");
  const list = filterQueue(samples, species, devStage);

  return (
    <section className="panel">
      <div className="heading">
        <div>
          <p>鉴定队列</p>
          <h2>待鉴定样本（{list.length}）</h2>
        </div>
      </div>

      <div className="filter-row">
        <label>
          <span>虫种</span>
          <select value={species} onChange={(e) => setSpecies(e.target.value)}>
            <option value="">全部虫种</option>
            {SPECIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span>发育阶段</span>
          <select value={devStage} onChange={(e) => setDevStage(e.target.value)}>
            <option value="">全部阶段</option>
            {DEV_STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {(species || devStage) && (
          <button
            onClick={() => {
              setSpecies("");
              setDevStage("");
            }}
          >
            清除筛选
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <p className="muted">没有符合条件的在队样本。</p>
      ) : (
        <table className="queue-table">
          <thead>
            <tr>
              <th>样本编号</th>
              <th>案件</th>
              <th>容器条码</th>
              <th>网格</th>
              <th>虫种</th>
              <th>发育阶段</th>
              <th>温度</th>
              <th>类型</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.caseId}</td>
                <td>{s.barcode}</td>
                <td>{s.grid}</td>
                <td>{s.species}</td>
                <td>{s.devStage}</td>
                <td>{s.temperature.toFixed(1)}℃</td>
                <td>{s.copyOf ? <span className="badge badge-copy">复检副本</span> : "原始"}</td>
                <td>
                  <button onClick={() => onSelect(s.id)}>详情</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="muted">仅展示已进入鉴定队列的样本；待核对样本须先在核对台归回案件。</p>
    </section>
  );
}
