import type { IntakeDraft, Sample, SampleStatus } from "./types";

/** 受控词表 */
export const EXPOSURE_STAGES = ["新鲜期", "肿胀期", "腐败期", "干化期", "残骸期"] as const;
export const DEV_STAGES = ["卵", "一龄幼虫", "二龄幼虫", "三龄幼虫", "蛹期", "成虫"] as const;
export const SPECIES = [
  "丝光绿蝇",
  "大头金蝇",
  "巨尾阿丽蝇",
  "家蝇",
  "棕尾别麻蝇",
  "尸食性阎甲",
] as const;
export const PRESERVATIONS = ["75%乙醇", "95%乙醇", "冷冻(-20℃)", "干燥保存", "活体饲养"] as const;

export const STATUS_LABEL: Record<SampleStatus, string> = {
  pending: "待核对",
  active: "鉴定队列",
  sealed: "已封存",
};

export const STATUS_CLASS: Record<SampleStatus, string> = {
  pending: "badge-pending",
  active: "badge-active",
  sealed: "badge-sealed",
};

/** 入库表单的字段完整性校验 */
export function validateDraft(draft: IntakeDraft): string[] {
  const errors: string[] = [];
  if (!draft.caseId) errors.push("请选择所属案件");
  if (!draft.barcode.trim()) errors.push("请录入容器条码");
  if (!draft.grid.trim()) errors.push("请录入采样网格");
  if (draft.temperature.trim() === "" || Number.isNaN(Number(draft.temperature))) {
    errors.push("环境温度需为数字（℃）");
  }
  if (!draft.exposureStage) errors.push("请选择暴露阶段");
  if (!draft.species) errors.push("请选择虫种");
  if (!draft.devStage) errors.push("请选择发育阶段");
  if (!draft.preservation) errors.push("请选择保存方式");
  if (!draft.sampledAt) errors.push("请录入采样时刻");
  return errors;
}

/**
 * 入库判定：
 * 1. 容器条码在全库重复 -> 保留待核对
 * 2. 采样网格在同一案件内重合 -> 保留待核对
 * 返回拦截原因；空数组表示可直接进入鉴定队列。
 */
export function judgeIntake(
  draft: Pick<IntakeDraft, "caseId" | "barcode" | "grid">,
  samples: Sample[]
): string[] {
  const reasons: string[] = [];
  const barcodeHit = samples.find(
    (s) => s.barcode.toLowerCase() === draft.barcode.trim().toLowerCase()
  );
  if (barcodeHit) {
    reasons.push(`容器条码「${draft.barcode.trim()}」与在库样本 ${barcodeHit.id} 重复`);
  }
  const gridHit = samples.find(
    (s) =>
      s.caseId === draft.caseId &&
      s.grid.trim().toLowerCase() === draft.grid.trim().toLowerCase()
  );
  if (gridHit) {
    reasons.push(`采样网格「${draft.grid.trim()}」在案件 ${draft.caseId} 内与样本 ${gridHit.id} 重合`);
  }
  return reasons;
}

/** 只有 active 样本能进入鉴定队列 */
export function canEnterQueue(sample: Sample): boolean {
  return sample.status === "active";
}

/** 核对人员必须补写现场照片编号才能归回案件 */
export function canRelease(photoNo: string): boolean {
  return photoNo.trim().length > 0;
}

/** 封存后不可再封存 */
export function canSeal(sample: Sample): boolean {
  return sample.status === "active";
}

/** 仅已封存样本可发起复检（只建副本） */
export function canReexam(sample: Sample): boolean {
  return sample.status === "sealed";
}

/** 鉴定员筛选：按虫种与发育阶段过滤队列样本 */
export function filterQueue(
  samples: Sample[],
  species: string,
  devStage: string
): Sample[] {
  return samples.filter(
    (s) =>
      s.status === "active" &&
      (species === "" || s.species === species) &&
      (devStage === "" || s.devStage === devStage)
  );
}
