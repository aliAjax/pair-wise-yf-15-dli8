/** 领域模型：案件、样本与核对记录的结构定义 */

export interface CaseFile {
  id: string;
  title: string;
  scene: string;
  openedAt: string;
}

/** pending=待核对（不可进入鉴定队列） active=在鉴定队列 sealed=已封存 */
export type SampleStatus = "pending" | "active" | "sealed";

export interface TempPoint {
  /** 读数时刻 */
  at: string;
  /** 环境温度（℃） */
  celsius: number;
}

export type ReviewAction = "入库拦截" | "核对归回" | "封存" | "复检副本";

export interface ReviewRecord {
  at: string;
  actor: string;
  action: ReviewAction;
  note: string;
}

export interface Sample {
  id: string;
  caseId: string;
  /** 容器条码 */
  barcode: string;
  /** 采样网格（在同一案件内不得重合） */
  grid: string;
  /** 环境温度 ℃ */
  temperature: number;
  /** 暴露阶段 */
  exposureStage: string;
  /** 虫种 */
  species: string;
  /** 发育阶段 */
  devStage: string;
  /** 保存方式 */
  preservation: string;
  /** 采样时刻 */
  sampledAt: string;
  status: SampleStatus;
  /** 被保留待核对的原因 */
  holdReasons: string[];
  /** 现场照片编号（由核对人员补写） */
  photoNo: string | null;
  /** 温度曲线，封存后冻结 */
  tempCurve: TempPoint[];
  sealedAt: string | null;
  /** 若为复检副本，指向原样本 id */
  copyOf: string | null;
  /** 历次核对轨迹 */
  reviews: ReviewRecord[];
}

export interface TrackerState {
  cases: CaseFile[];
  samples: Sample[];
}

/** 入库表单草稿，温度先以字符串接收再校验 */
export interface IntakeDraft {
  caseId: string;
  barcode: string;
  grid: string;
  temperature: string;
  exposureStage: string;
  species: string;
  devStage: string;
  preservation: string;
  sampledAt: string;
}
