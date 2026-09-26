import type { CaseFile, Sample, TempPoint } from "../domain/types";

function curve(base: number, delta = 1.2): TempPoint[] {
  const day = "2026-09-18T";
  return [
    { at: `${day}08:00`, celsius: Number((base - delta).toFixed(1)) },
    { at: `${day}10:00`, celsius: Number((base - delta * 0.3).toFixed(1)) },
    { at: `${day}12:00`, celsius: Number((base + delta * 0.6).toFixed(1)) },
    { at: `${day}14:00`, celsius: Number((base + delta).toFixed(1)) },
    { at: `${day}16:00`, celsius: Number((base + delta * 0.4).toFixed(1)) },
    { at: `${day}18:00`, celsius: Number((base - delta * 0.4).toFixed(1)) },
  ];
}

export const SEED_CASES: CaseFile[] = [
  { id: "AJ-2026-018", title: "东郊林地无名遗体案", scene: "城东防护林 G7 段", openedAt: "2026-09-18 06:40" },
  { id: "AJ-2026-021", title: "河岸废弃仓库命案", scene: "北河三号仓库", openedAt: "2026-09-20 14:10" },
  { id: "AJ-2026-024", title: "城中村出租屋案", scene: "南街新村 12 号", openedAt: "2026-09-22 09:25" },
  { id: "AJ-2026-027", title: "山区公路边坡案", scene: "X204 县道 11km 处", openedAt: "2026-09-24 17:05" },
];

const S01: Sample = {
  id: "YP-0001",
  caseId: "AJ-2026-018",
  barcode: "CT-7741-A",
  grid: "G7-03",
  temperature: 24.6,
  exposureStage: "肿胀期",
  species: "丝光绿蝇",
  devStage: "三龄幼虫",
  preservation: "75%乙醇",
  sampledAt: "2026-09-18T15:30",
  status: "active",
  holdReasons: [],
  photoNo: "IMG-1842",
  tempCurve: curve(24.6),
  sealedAt: null,
  copyOf: null,
  reviews: [
    { at: "2026-09-18 17:02", actor: "采样员 周岭", action: "入库拦截", note: "首次录入，校验通过" },
    { at: "2026-09-19 09:15", actor: "核对员 韩青", action: "核对归回", note: "照片编号 IMG-1842，标签清晰" },
  ],
};

const S02: Sample = {
  id: "YP-0002",
  caseId: "AJ-2026-018",
  barcode: "CT-7741-B",
  grid: "G7-05",
  temperature: 23.9,
  exposureStage: "肿胀期",
  species: "大头金蝇",
  devStage: "蛹期",
  preservation: "冷冻(-20℃)",
  sampledAt: "2026-09-18T16:10",
  status: "sealed",
  holdReasons: [],
  photoNo: "IMG-1846",
  tempCurve: curve(23.9, 0.8),
  sealedAt: "2026-09-23 10:30",
  copyOf: null,
  reviews: [
    { at: "2026-09-18 17:05", actor: "采样员 周岭", action: "入库拦截", note: "首次录入，校验通过" },
    { at: "2026-09-19 09:18", actor: "核对员 韩青", action: "核对归回", note: "照片编号 IMG-1846" },
    { at: "2026-09-23 10:30", actor: "鉴定员 陆鸣", action: "封存", note: "蛹期发育积温核算完成，归档" },
  ],
};

const S03: Sample = {
  id: "YP-0003",
  caseId: "AJ-2026-021",
  barcode: "CT-8032-A",
  grid: "W3-A1",
  temperature: 19.4,
  exposureStage: "腐败期",
  species: "巨尾阿丽蝇",
  devStage: "二龄幼虫",
  preservation: "75%乙醇",
  sampledAt: "2026-09-20T18:40",
  status: "active",
  holdReasons: [],
  photoNo: "IMG-2031",
  tempCurve: curve(19.4, 0.6),
  sealedAt: null,
  copyOf: null,
  reviews: [
    { at: "2026-09-20 20:11", actor: "采样员 邓珂", action: "入库拦截", note: "首次录入，校验通过" },
    { at: "2026-09-21 08:50", actor: "核对员 韩青", action: "核对归回", note: "照片编号 IMG-2031" },
  ],
};

const S04: Sample = {
  id: "YP-0004",
  caseId: "AJ-2026-021",
  barcode: "CT-8032-A",
  grid: "W3-A4",
  temperature: 18.8,
  exposureStage: "腐败期",
  species: "家蝇",
  devStage: "成虫",
  preservation: "干燥保存",
  sampledAt: "2026-09-21T09:05",
  status: "pending",
  holdReasons: ["容器条码「CT-8032-A」与在库样本 YP-0003 重复"],
  photoNo: null,
  tempCurve: curve(18.8, 0.5),
  sealedAt: null,
  copyOf: null,
  reviews: [
    { at: "2026-09-21 09:40", actor: "系统", action: "入库拦截", note: "条码与 YP-0003 重复，保留待核对" },
  ],
};

const S05: Sample = {
  id: "YP-0005",
  caseId: "AJ-2026-024",
  barcode: "CT-8207-C",
  grid: "NC12-02",
  temperature: 26.1,
  exposureStage: "新鲜期",
  species: "棕尾别麻蝇",
  devStage: "一龄幼虫",
  preservation: "95%乙醇",
  sampledAt: "2026-09-22T11:20",
  status: "pending",
  holdReasons: ["采样网格「NC12-02」在案件 AJ-2026-024 内与样本 YP-0006 重合"],
  photoNo: null,
  tempCurve: curve(26.1, 1.5),
  sealedAt: null,
  copyOf: null,
  reviews: [
    { at: "2026-09-22 13:02", actor: "系统", action: "入库拦截", note: "案件内网格与 YP-0006 重合，保留待核对" },
  ],
};

const S06: Sample = {
  id: "YP-0006",
  caseId: "AJ-2026-024",
  barcode: "CT-8207-D",
  grid: "NC12-02",
  temperature: 26.1,
  exposureStage: "新鲜期",
  species: "丝光绿蝇",
  devStage: "卵",
  preservation: "活体饲养",
  sampledAt: "2026-09-22T11:25",
  status: "active",
  holdReasons: [],
  photoNo: "IMG-2210",
  tempCurve: curve(26.1, 1.5),
  sealedAt: null,
  copyOf: null,
  reviews: [
    { at: "2026-09-22 12:55", actor: "采样员 邓珂", action: "入库拦截", note: "首次录入，校验通过" },
    { at: "2026-09-22 15:30", actor: "核对员 韩青", action: "核对归回", note: "照片编号 IMG-2210" },
  ],
};

export const SEED_SAMPLES: Sample[] = [S01, S02, S03, S04, S05, S06];
