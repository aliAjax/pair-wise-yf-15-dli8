import { useCallback, useState } from "react";
import type { IntakeDraft, Sample, TrackerState } from "../domain/types";
import { canReexam, canRelease, canSeal, judgeIntake, validateDraft } from "../domain/rules";
import { loadState, resetState, saveState } from "./storage";

function now(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function nextSampleId(samples: Sample[]): string {
  const max = samples.reduce((m, s) => {
    const n = Number(s.id.replace(/\D/g, ""));
    return Number.isNaN(n) ? m : Math.max(m, n);
  }, 0);
  return `YP-${String(max + 1).padStart(4, "0")}`;
}

export interface IntakeResult {
  ok: boolean;
  errors: string[];
  sample?: Sample;
}

/**
 * 存取层与页面之间的动作门面：
 * 每个动作调用判定层规则，再经存取层落盘。
 */
export function useTracker() {
  const [state, setState] = useState<TrackerState>(loadState);

  const commit = useCallback((next: TrackerState) => {
    saveState(next);
    setState(next);
  }, []);

  /** 入库：判定通过进鉴定队列，否则保留待核对 */
  const intake = useCallback(
    (draft: IntakeDraft): IntakeResult => {
      const errors = validateDraft(draft);
      if (errors.length > 0) return { ok: false, errors };

      const reasons = judgeIntake(draft, state.samples);
      const held = reasons.length > 0;
      const sample: Sample = {
        id: nextSampleId(state.samples),
        caseId: draft.caseId,
        barcode: draft.barcode.trim(),
        grid: draft.grid.trim(),
        temperature: Number(draft.temperature),
        exposureStage: draft.exposureStage,
        species: draft.species,
        devStage: draft.devStage,
        preservation: draft.preservation,
        sampledAt: draft.sampledAt,
        status: held ? "pending" : "active",
        holdReasons: reasons,
        photoNo: null,
        tempCurve: [{ at: now(), celsius: Number(draft.temperature) }],
        sealedAt: null,
        copyOf: null,
        reviews: held
          ? [{ at: now(), actor: "系统", action: "入库拦截", note: reasons.join("；") }]
          : [],
      };
      commit({ ...state, samples: [...state.samples, sample] });
      return { ok: true, errors: [], sample };
    },
    [state, commit]
  );

  /** 核对归回：必须补写现场照片编号 */
  const release = useCallback(
    (sampleId: string, photoNo: string, reviewer: string): boolean => {
      if (!canRelease(photoNo)) return false;
      const samples = state.samples.map((s) =>
        s.id === sampleId && s.status === "pending"
          ? {
              ...s,
              status: "active" as const,
              holdReasons: [],
              photoNo: photoNo.trim(),
              reviews: [
                ...s.reviews,
                {
                  at: now(),
                  actor: reviewer.trim() || "核对员",
                  action: "核对归回" as const,
                  note: `补写现场照片编号 ${photoNo.trim()}，归回案件 ${s.caseId}`,
                },
              ],
            }
          : s
      );
      commit({ ...state, samples });
      return true;
    },
    [state, commit]
  );

  /** 封存：冻结记录与温度曲线 */
  const seal = useCallback(
    (sampleId: string, actor: string): void => {
      const target = state.samples.find((s) => s.id === sampleId);
      if (!target || !canSeal(target)) return;
      const samples = state.samples.map((s) =>
        s.id === sampleId
          ? {
              ...s,
              status: "sealed" as const,
              sealedAt: now(),
              reviews: [
                ...s.reviews,
                {
                  at: now(),
                  actor: actor.trim() || "鉴定员",
                  action: "封存" as const,
                  note: "样本封存，记录与温度曲线冻结",
                },
              ],
            }
          : s
      );
      commit({ ...state, samples });
    },
    [state, commit]
  );

  /** 复检：仅对已封存样本建立副本，原记录与温度曲线不动 */
  const reexam = useCallback(
    (sampleId: string, actor: string): Sample | null => {
      const origin = state.samples.find((s) => s.id === sampleId);
      if (!origin || !canReexam(origin)) return null;
      const copy: Sample = {
        ...origin,
        id: nextSampleId(state.samples),
        barcode: `${origin.barcode}-R${state.samples.filter((s) => s.copyOf === origin.id).length + 1}`,
        status: "active",
        holdReasons: [],
        sealedAt: null,
        copyOf: origin.id,
        tempCurve: origin.tempCurve.map((p) => ({ ...p })),
        reviews: [
          {
            at: now(),
            actor: actor.trim() || "鉴定员",
            action: "复检副本",
            note: `依据封存样本 ${origin.id} 建立复检副本，原记录与温度曲线保持不动`,
          },
        ],
      };
      commit({ ...state, samples: [...state.samples, copy] });
      return copy;
    },
    [state, commit]
  );

  const reset = useCallback(() => {
    setState(resetState());
  }, []);

  return { state, intake, release, seal, reexam, reset };
}
