import type { TrackerState } from "../domain/types";
import { SEED_CASES, SEED_SAMPLES } from "./seed";

const STORAGE_KEY = "fentom-tracker-v1";

/** 仅使用浏览器 localStorage 持久化 */
export function loadState(): TrackerState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as TrackerState;
      if (Array.isArray(parsed.cases) && Array.isArray(parsed.samples)) {
        return parsed;
      }
    }
  } catch {
    // 存储不可用时回退到预置数据
  }
  return seedState();
}

export function saveState(state: TrackerState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 忽略写入失败（如隐私模式）
  }
}

export function seedState(): TrackerState {
  return {
    cases: SEED_CASES.map((c) => ({ ...c })),
    samples: SEED_SAMPLES.map((s) => ({
      ...s,
      holdReasons: [...s.holdReasons],
      tempCurve: s.tempCurve.map((p) => ({ ...p })),
      reviews: s.reviews.map((r) => ({ ...r })),
    })),
  };
}

export function resetState(): TrackerState {
  const fresh = seedState();
  saveState(fresh);
  return fresh;
}
