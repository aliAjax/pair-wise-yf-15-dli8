// 存取层：仅负责 localStorage 读写与演示数据预置，不含任何判定规则。
import { CaseInfo, Sample, State, makeTempCurve } from "./domain";

const KEY = "fe-tracker-state-v1";

function mk(p: {
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
  status: Sample["status"];
  holdReasons?: string[];
  photoNo?: string | null;
  isCopy?: boolean;
  parentId?: string | null;
  history: Sample["history"];
}): Sample {
  return {
    holdReasons: [],
    photoNo: null,
    isCopy: false,
    parentId: null,
    ...p,
    tempCurve: makeTempCurve(p.temperature),
    createdAt: p.history[0]?.time ?? p.sampledAt,
  };
}

export function seedState(): State {
  const cases: CaseInfo[] = [
    { id: "case-1", code: "FE-2026-041", name: "河道浮尸案" },
    { id: "case-2", code: "FE-2026-052", name: "废弃厂房遗骸案" },
    { id: "case-3", code: "FE-2026-063", name: "山林掩埋案" },
    { id: "case-4", code: "FE-2026-071", name: "出租屋腐尸案" },
  ];

  const samples: Sample[] = [
    mk({
      id: "s-001",
      caseId: "case-1",
      barcode: "BC-1001",
      grid: "网格A1",
      temperature: 24.5,
      exposure: "肿胀期",
      species: "丝光绿蝇",
      stage: "三龄幼虫",
      preservation: "70%乙醇",
      sampledAt: "2026-09-22 09:10",
      status: "in_queue",
      history: [
        { time: "2026-09-22 09:40", type: "入库", detail: "录入容器条码 BC-1001，采样网格 网格A1，环境温度 24.5℃" },
      ],
    }),
    mk({
      id: "s-002",
      caseId: "case-1",
      barcode: "BC-1002",
      grid: "网格A2",
      temperature: 23.8,
      exposure: "腐败期",
      species: "大头金蝇",
      stage: "蛹",
      preservation: "干燥保存",
      sampledAt: "2026-09-22 09:40",
      status: "sealed",
      photoNo: "IMG-041-009",
      history: [
        { time: "2026-09-22 10:05", type: "入库", detail: "录入容器条码 BC-1002，采样网格 网格A2，环境温度 23.8℃" },
        { time: "2026-09-23 11:20", type: "封存", detail: "样本封存，原记录与温度曲线锁定，后续复检仅建立副本" },
        { time: "2026-09-24 09:12", type: "复检申请", detail: "收到复检请求，建立副本 BC-1002-R1，原记录与温度曲线未改动" },
      ],
    }),
    mk({
      id: "s-002-r1",
      caseId: "case-1",
      barcode: "BC-1002-R1",
      grid: "网格A2",
      temperature: 23.8,
      exposure: "腐败期",
      species: "大头金蝇",
      stage: "蛹",
      preservation: "干燥保存",
      sampledAt: "2026-09-22 09:40",
      status: "in_queue",
      isCopy: true,
      parentId: "s-002",
      photoNo: "IMG-041-009",
      history: [
        { time: "2026-09-24 09:12", type: "复检副本", detail: "封存样本 BC-1002 的第 1 份复检副本，原记录与温度曲线保持不动" },
      ],
    }),
    mk({
      id: "s-003",
      caseId: "case-2",
      barcode: "BC-1001",
      grid: "网格B1",
      temperature: 26.1,
      exposure: "新鲜期",
      species: "家蝇",
      stage: "一龄幼虫",
      preservation: "冷冻(-20℃)",
      sampledAt: "2026-09-23 14:25",
      status: "held",
      holdReasons: ["条码重复"],
      history: [
        { time: "2026-09-23 15:00", type: "入库", detail: "录入容器条码 BC-1001，采样网格 网格B1，环境温度 26.1℃" },
        { time: "2026-09-23 15:00", type: "留置", detail: "判定未通过：条码重复，保留待核对，暂不进入鉴定队列" },
      ],
    }),
    mk({
      id: "s-004",
      caseId: "case-2",
      barcode: "BC-2002",
      grid: "网格B2",
      temperature: 25.4,
      exposure: "肿胀期",
      species: "巨尾阿丽蝇",
      stage: "成虫",
      preservation: "70%乙醇",
      sampledAt: "2026-09-23 15:02",
      status: "in_queue",
      history: [
        { time: "2026-09-23 15:30", type: "入库", detail: "录入容器条码 BC-2002，采样网格 网格B2，环境温度 25.4℃" },
      ],
    }),
    mk({
      id: "s-005",
      caseId: "case-3",
      barcode: "BC-3001",
      grid: "网格C1",
      temperature: 19.7,
      exposure: "干化期",
      species: "丝光绿蝇",
      stage: "三龄幼虫",
      preservation: "4%甲醛",
      sampledAt: "2026-09-24 08:15",
      status: "in_queue",
      history: [
        { time: "2026-09-24 08:50", type: "入库", detail: "录入容器条码 BC-3001，采样网格 网格C1，环境温度 19.7℃" },
      ],
    }),
    mk({
      id: "s-006",
      caseId: "case-4",
      barcode: "BC-4001",
      grid: "网格D1",
      temperature: 27.3,
      exposure: "腐败期",
      species: "棕尾别麻蝇",
      stage: "蛹",
      preservation: "冷冻(-20℃)",
      sampledAt: "2026-09-24 10:50",
      status: "in_queue",
      history: [
        { time: "2026-09-24 11:15", type: "入库", detail: "录入容器条码 BC-4001，采样网格 网格D1，环境温度 27.3℃" },
      ],
    }),
  ];

  return { cases, samples };
}

export function loadState(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed && Array.isArray(parsed.cases) && Array.isArray(parsed.samples)) {
        return parsed;
      }
    }
  } catch {
    // 数据损坏时回退到演示数据
  }
  const seeded = seedState();
  saveState(seeded);
  return seeded;
}

export function saveState(state: State): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 存储不可用时静默失败，页面内状态仍可用
  }
}

export function resetState(): State {
  const seeded = seedState();
  saveState(seeded);
  return seeded;
}
