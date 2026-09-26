// 页面层：入库登记。只负责表单与展示，判定结果由 domain 层返回。
import { FormEvent, useMemo, useState } from "react";
import {
  CaseInfo,
  EXPOSURES,
  IntakeInput,
  PRESERVATIONS,
  SPECIES,
  STAGES,
  STATUS_LABEL,
  Sample,
} from "../domain";

interface Props {
  cases: CaseInfo[];
  samples: Sample[];
  onIntake: (input: IntakeInput) => string[];
}

function defaultSampledAt(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function IntakePage({ cases, samples, onIntake }: Props) {
  const [message, setMessage] = useState<{ kind: "ok" | "held" | "err"; text: string } | null>(null);
  const sampledAtDefault = useMemo(defaultSampledAt, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const temperature = Number(data.get("temperature"));
    const input: IntakeInput = {
      caseId: String(data.get("caseId") ?? ""),
      barcode: String(data.get("barcode") ?? ""),
      grid: String(data.get("grid") ?? ""),
      temperature,
      exposure: String(data.get("exposure") ?? ""),
      species: String(data.get("species") ?? ""),
      stage: String(data.get("stage") ?? ""),
      preservation: String(data.get("preservation") ?? ""),
      sampledAt: String(data.get("sampledAt") ?? "").replace("T", " "),
    };
    if (
      !input.caseId ||
      !input.barcode.trim() ||
      !input.grid.trim() ||
      !input.sampledAt.trim() ||
      !Number.isFinite(temperature)
    ) {
      setMessage({ kind: "err", text: "请完整填写容器条码、采样网格、环境温度与采样时刻" });
      return;
    }
    const reasons = onIntake(input);
    if (reasons.length) {
      setMessage({
        kind: "held",
        text: `判定未通过（${reasons.join("、")}），样本已保留待核对，未进入鉴定队列`,
      });
    } else {
      setMessage({ kind: "ok", text: `样本 ${input.barcode.trim()} 已入库，进入鉴定队列` });
    }
    form.reset();
  };

  const recent = samples.slice(-5).reverse();

  return (
    <div className="page-grid">
      <section className="panel">
        <div className="heading">
          <div>
            <p>入库登记</p>
            <h2>样本录入</h2>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="field-grid">
          <label>
            <span>所属案件</span>
            <select name="caseId" defaultValue={cases[0]?.id}>
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>容器条码</span>
            <input name="barcode" placeholder="如 BC-1005" />
          </label>
          <label>
            <span>采样网格</span>
            <input name="grid" placeholder="如 网格A3" />
          </label>
          <label>
            <span>环境温度（℃）</span>
            <input name="temperature" type="number" step="0.1" placeholder="如 24.5" />
          </label>
          <label>
            <span>暴露阶段</span>
            <select name="exposure" defaultValue={EXPOSURES[0]}>
              {EXPOSURES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>虫种</span>
            <select name="species" defaultValue={SPECIES[0]}>
              {SPECIES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>发育阶段</span>
            <select name="stage" defaultValue={STAGES[0]}>
              {STAGES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>保存方式</span>
            <select name="preservation" defaultValue={PRESERVATIONS[0]}>
              {PRESERVATIONS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label>
            <span>采样时刻</span>
            <input name="sampledAt" type="datetime-local" defaultValue={sampledAtDefault} />
          </label>
          <div className="form-actions">
            <button type="submit" className="primary">
              提交入库
            </button>
          </div>
        </form>
        {message && <p className={`notice ${message.kind}`}>{message.text}</p>}
      </section>

      <section className="panel">
        <div className="heading">
          <div>
            <p>最近入库</p>
            <h2>最新 5 份样本</h2>
          </div>
        </div>
        <div className="records">
          {recent.map((s) => (
            <article key={s.id}>
              <b>{s.barcode}</b>
              <div>
                <h3>
                  {s.species} · {s.stage}
                  {s.isCopy && <span className="tag">复检副本</span>}
                </h3>
                <p>
                  {s.grid} · {s.temperature}℃ · {s.sampledAt}
                </p>
              </div>
              <span className={`badge ${s.status}`}>{STATUS_LABEL[s.status]}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
