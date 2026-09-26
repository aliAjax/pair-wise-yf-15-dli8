// 页面层：鉴定队列。按虫种与发育阶段筛选，待核对样本不进入本队列。
import { useMemo, useState } from "react";
import { CaseInfo, STAGES, STATUS_LABEL, Sample } from "../domain";

interface Props {
  cases: CaseInfo[];
  samples: Sample[];
  onOpen: (id: string) => void;
}

export default function IdentifyPage({ cases, samples, onOpen }: Props) {
  const [species, setSpecies] = useState("");
  const [stage, setStage] = useState("");

  const caseCode = (id: string) => cases.find((c) => c.id === id)?.code ?? "—";
  const speciesOptions = useMemo(
    () => Array.from(new Set(samples.map((s) => s.species))),
    [samples]
  );

  const rows = samples.filter(
    (s) =>
      s.status !== "held" &&
      (!species || s.species === species) &&
      (!stage || s.stage === stage)
  );

  return (
    <section className="panel">
      <div className="heading">
        <div>
          <p>鉴定队列</p>
          <h2>按虫种与发育阶段筛选</h2>
        </div>
        <div className="filters">
          <select value={species} onChange={(e) => setSpecies(e.target.value)}>
            <option value="">全部虫种</option>
            {speciesOptions.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">全部发育阶段</option>
            {STAGES.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="empty">没有符合条件的样本。</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>容器条码</th>
              <th>案件</th>
              <th>虫种</th>
              <th>发育阶段</th>
              <th>暴露阶段</th>
              <th>状态</th>
              <th>类型</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id}>
                <td>{s.barcode}</td>
                <td>{caseCode(s.caseId)}</td>
                <td>{s.species}</td>
                <td>{s.stage}</td>
                <td>{s.exposure}</td>
                <td>
                  <span className={`badge ${s.status}`}>{STATUS_LABEL[s.status]}</span>
                </td>
                <td>{s.isCopy ? "复检副本" : "原始样本"}</td>
                <td>
                  <button onClick={() => onOpen(s.id)}>详情</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
