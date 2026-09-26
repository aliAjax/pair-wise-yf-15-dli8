// 判定层：样本状态、入库冲突判定、核对归回、封存与复检副本规则。
// 本层不触碰 DOM 与 localStorage，只接收并返回新的状态对象。

export type SampleStatus = "held" | "in_queue" | "sealed";

export interface TempPoint {
  t: string;
  temp: number;
}

export interface HistoryEntry {
  time: string;
  type: "入库" | "留置" | "核对归回" | "封存" | "复检申请" | "复检副本";
  detail: string;
}

export interface Sample {
  id: string;
  caseId: string;
  barcode: string;
  grid: string;
  temperature: number;
  exposure: string;
  species: string;
  stage: string;
  preservation: string;
  sampledAt: string;
  status: SampleStatus;
  holdReasons: string[];
  photoNo: string | null;
  isCopy: boolean;
  parentId: string | null;
  tempCurve: TempPoint[];
  history: HistoryEntry[];
  createdAt: string;
}

export interface CaseInfo {
  id: string;
  code: string;
  name: string;
}

export interface State {
  cases: CaseInfo[];
  samples: Sample[];
}

export interface IntakeInput {
  caseId: string;
  barcode: string;
  grid: string;
  temperature: number;
  exposure: string;
  species: string;
  stage: string;
  preservation: string;
  sampledAt: string;
}

export const STATUS_LABEL: Record<SampleStatus, string> = {
  held: "待核对",
  in_queue: "鉴定队列",
  sealed: "已封存",
};

export const STAGES = ["卵", "一龄幼虫", "二龄幼虫", "三龄幼虫", "蛹", "成虫"];
export const EXPOSURES = ["新鲜期", "肿胀期", "腐败期", "干化期", "残骸期"];
export const PRESERVATIONS = ["70%乙醇", "冷冻(-20℃)", "干燥保存", "4%甲醛"];
export const SPECIES = ["丝光绿蝇", "大头金蝇", "家蝇", "巨尾阿丽蝇", "棕尾别麻蝇", "厩腐蝇"];

export function nowStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function genId(): string {
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

// 以环境温度为基准生成 12 个小时刻度的留存温度曲线（确定性，入库后即锁定）。
export function makeTempCurve(base: number): TempPoint[] {
  const pts: TempPoint[] = [];
  for (let h = 0; h < 12; h++) {
    const drift = Math.sin(h * 1.3) * 0.6 + ((h % 3) - 1) * 0.35 - h * 0.05;
    pts.push({ t: `+${h}h`, temp: Math.round((base + drift) * 10) / 10 });
  }
  return pts;
}

// 入库判定：条码全局重复，或采样网格在同一案件内重合（复检副本不参与网格判定）。
export function checkIntake(
  samples: Sample[],
  candidate: { caseId: string; barcode: string; grid: string }
): string[] {
  const reasons: string[] = [];
  if (samples.some((s) => s.barcode === candidate.barcode)) {
    reasons.push("条码重复");
  }
  if (
    samples.some((s) => !s.isCopy && s.caseId === candidate.caseId && s.grid === candidate.grid)
  ) {
    reasons.push("网格在案件内重合");
  }
  return reasons;
}

export function intakeSample(
  state: State,
  raw: IntakeInput
): { state: State; sample: Sample; reasons: string[] } {
  const input: IntakeInput = {
    ...raw,
    barcode: raw.barcode.trim(),
    grid: raw.grid.trim(),
  };
  const reasons = checkIntake(state.samples, input);
  const time = nowStr();
  const history: HistoryEntry[] = [
    {
      time,
      type: "入库",
      detail: `录入容器条码 ${input.barcode}，采样网格 ${input.grid}，环境温度 ${input.temperature}℃`,
    },
  ];
  if (reasons.length) {
    history.push({
      time,
      type: "留置",
      detail: `判定未通过：${reasons.join("、")}，保留待核对，暂不进入鉴定队列`,
    });
  }
  const sample: Sample = {
    id: genId(),
    ...input,
    status: reasons.length ? "held" : "in_queue",
    holdReasons: reasons,
    photoNo: null,
    isCopy: false,
    parentId: null,
    tempCurve: makeTempCurve(input.temperature),
    history,
    createdAt: time,
  };
  return { state: { ...state, samples: [...state.samples, sample] }, sample, reasons };
}

// 核对归回：必须补写现场照片编号，归回后进入鉴定队列。
export function verifySample(
  state: State,
  id: string,
  photoNo: string
): { state: State; error?: string } {
  const target = state.samples.find((s) => s.id === id);
  if (!target) return { state, error: "样本不存在" };
  if (target.status !== "held") return { state, error: "仅待核对样本可执行核对归回" };
  const photo = photoNo.trim();
  if (!photo) return { state, error: "请补写现场照片编号后再归回案件" };
  const time = nowStr();
  const samples = state.samples.map((s) =>
    s.id === id
      ? {
          ...s,
          status: "in_queue" as SampleStatus,
          photoNo: photo,
          history: [
            ...s.history,
            {
              time,
              type: "核对归回" as const,
              detail: `核对人员补写现场照片编号 ${photo}，样本归回案件并进入鉴定队列`,
            },
          ],
        }
      : s
  );
  return { state: { ...state, samples } };
}

// 封存：仅鉴定队列中的样本可封存，封存后原记录与温度曲线锁定。
export function sealSample(state: State, id: string): { state: State; error?: string } {
  const target = state.samples.find((s) => s.id === id);
  if (!target) return { state, error: "样本不存在" };
  if (target.status !== "in_queue") return { state, error: "仅鉴定队列中的样本可封存" };
  const time = nowStr();
  const samples = state.samples.map((s) =>
    s.id === id
      ? {
          ...s,
          status: "sealed" as SampleStatus,
          history: [
            ...s.history,
            {
              time,
              type: "封存" as const,
              detail: "样本封存，原记录与温度曲线锁定，后续复检仅建立副本",
            },
          ],
        }
      : s
  );
  return { state: { ...state, samples } };
}

// 复检：仅已封存样本可发起，只建立副本，原记录与温度曲线保持不动。
export function requestReexam(
  state: State,
  id: string
): { state: State; copy?: Sample; error?: string } {
  const target = state.samples.find((s) => s.id === id);
  if (!target) return { state, error: "样本不存在" };
  if (target.status !== "sealed") {
    return { state, error: "仅已封存样本可发起复检，复检仅建立副本" };
  }
  const time = nowStr();
  const n = state.samples.filter((s) => s.parentId === target.id).length + 1;
  const copy: Sample = {
    ...target,
    id: genId(),
    barcode: `${target.barcode}-R${n}`,
    status: "in_queue",
    holdReasons: [],
    isCopy: true,
    parentId: target.id,
    tempCurve: target.tempCurve.map((p) => ({ ...p })),
    createdAt: time,
    history: [
      {
        time,
        type: "复检副本",
        detail: `封存样本 ${target.barcode} 的第 ${n} 份复检副本，原记录与温度曲线保持不动`,
      },
    ],
  };
  const samples = state.samples.map((s) =>
    s.id === id
      ? {
          ...s,
          history: [
            ...s.history,
            {
              time,
              type: "复检申请" as const,
              detail: `收到复检请求，建立副本 ${copy.barcode}，原记录与温度曲线未改动`,
            },
          ],
        }
      : s
  );
  return { state: { ...state, samples: [...samples, copy] }, copy };
}
