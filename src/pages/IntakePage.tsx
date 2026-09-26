import { useState } from "react";
import type { CaseFile, IntakeDraft, Sample } from "../domain/types";
import { DEV_STAGES, EXPOSURE_STAGES, PRESERVATIONS, SPECIES } from "../domain/rules";
import type { IntakeResult } from "../store/useTracker";

const EMPTY: IntakeDraft = {
  caseId: "",
  barcode: "",
  grid: "",
  temperature: "",
  exposureStage: "",
  species: "",
  devStage: "",
  preservation: "",
  sampledAt: "",
};

interface Props {
  cases: CaseFile[];
  onIntake: (draft: IntakeDraft) => IntakeResult;
}

/** 入库登记页：录入八项字段，提交后由判定层决定去留 */
export function IntakePage({ cases, onIntake }: Props) {
  const [draft, setDraft] = useState<IntakeDraft>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<Sample | null>(null);

  const set = (key: keyof IntakeDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setDraft((d) => ({ ...d, [key]: e.target.value }));

  const submit = () => {
    const r = onIntake(draft);
    if (!r.ok) {
      setErrors(r.errors);
      setResult(null);
      return;
    }
    setErrors([]);
    setResult(r.sample ?? null);
    setDraft(EMPTY);
  };

  return (
    <section className="panel">
      <div className="heading">
        <div>
          <p>入库登记</p>
          <h2>样本入库</h2>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="alert">
          <strong>请补全以下信息</strong>
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <div className={result.status === "pending" ? "alert" : "notice"}>
          {result.status === "pending" ? (
            <>
              <strong>{result.id} 已保留待核对，未进入鉴定队列</strong>
              <ul>
                {result.holdReasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </>
          ) : (
            <strong>{result.id} 入库成功，已进入鉴定队列</strong>
          )}
        </div>
      )}

      <div className="field-grid">
        <label>
          <span>所属案件</span>
          <select value={draft.caseId} onChange={set("caseId")}>
            <option value="">请选择案件</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} · {c.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>容器条码</span>
          <input value={draft.barcode} onChange={set("barcode")} placeholder="如 CT-8032-A" />
        </label>
        <label>
          <span>采样网格</span>
          <input value={draft.grid} onChange={set("grid")} placeholder="如 W3-A1" />
        </label>
        <label>
          <span>环境温度（℃）</span>
          <input value={draft.temperature} onChange={set("temperature")} placeholder="如 24.6" inputMode="decimal" />
        </label>
        <label>
          <span>暴露阶段</span>
          <select value={draft.exposureStage} onChange={set("exposureStage")}>
            <option value="">请选择</option>
            {EXPOSURE_STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span>虫种</span>
          <select value={draft.species} onChange={set("species")}>
            <option value="">请选择</option>
            {SPECIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span>发育阶段</span>
          <select value={draft.devStage} onChange={set("devStage")}>
            <option value="">请选择</option>
            {DEV_STAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span>保存方式</span>
          <select value={draft.preservation} onChange={set("preservation")}>
            <option value="">请选择</option>
            {PRESERVATIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span>采样时刻</span>
          <input type="datetime-local" value={draft.sampledAt} onChange={set("sampledAt")} />
        </label>
      </div>

      <div className="form-actions">
        <button className="primary" onClick={submit}>
          提交入库
        </button>
        <button
          onClick={() => {
            setDraft(EMPTY);
            setErrors([]);
            setResult(null);
          }}
        >
          清空
        </button>
      </div>
      <p className="muted">
        判定规则：容器条码在库内重复，或采样网格在同一案件内重合时，样本保留待核对，不能进入鉴定队列。
      </p>
    </section>
  );
}
