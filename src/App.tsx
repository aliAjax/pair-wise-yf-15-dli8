import { useState } from "react";
import "./styles.css";
import { useTracker } from "./store/useTracker";
import { IntakePage } from "./pages/IntakePage";
import { ReviewPage } from "./pages/ReviewPage";
import { QueuePage } from "./pages/QueuePage";
import { CasesPage } from "./pages/CasesPage";
import { SampleDetail } from "./components/SampleDetail";

type Tab = "intake" | "review" | "queue" | "cases";

const TABS: Array<{ key: Tab; label: string }> = [
  { key: "intake", label: "入库登记" },
  { key: "review", label: "待核对" },
  { key: "queue", label: "鉴定队列" },
  { key: "cases", label: "案件关联" },
];

function App() {
  const { state, intake, release, seal, reexam, reset } = useTracker();
  const [tab, setTab] = useState<Tab>("intake");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = state.samples.find((s) => s.id === selectedId) ?? null;
  const pendingCount = state.samples.filter((s) => s.status === "pending").length;
  const queueCount = state.samples.filter((s) => s.status === "active").length;
  const sealedCount = state.samples.filter((s) => s.status === "sealed").length;

  const openDetail = (id: string) => setSelectedId(id);

  return (
    <main className="app">
      <section className="hero">
        <p>法医昆虫样本追踪台 · 数据仅保存在本浏览器</p>
        <h1>法医昆虫样本追踪台</h1>
        <span>
          入库判定条码与网格冲突，冲突样本保留待核对；核对人员补写现场照片编号后归回案件；
          封存后复检仅建立副本，原记录与温度曲线保持不动。
        </span>
      </section>

      <section className="metrics">
        <article>
          <small>案件</small>
          <strong>{state.cases.length}</strong>
        </article>
        <article>
          <small>待核对</small>
          <strong>{pendingCount}</strong>
        </article>
        <article>
          <small>鉴定队列</small>
          <strong>{queueCount}</strong>
        </article>
        <article>
          <small>已封存</small>
          <strong>{sealedCount}</strong>
        </article>
      </section>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "tab active" : "tab"}
            onClick={() => setTab(t.key)}
          >
            {t.label}
            {t.key === "review" && pendingCount > 0 && (
              <span className="tab-count">{pendingCount}</span>
            )}
          </button>
        ))}
        <button className="tab reset" onClick={reset} title="清空浏览器数据并恢复预置样例">
          重置演示数据
        </button>
      </nav>

      {tab === "intake" && <IntakePage cases={state.cases} onIntake={intake} />}
      {tab === "review" && (
        <ReviewPage cases={state.cases} samples={state.samples} onRelease={release} />
      )}
      {tab === "queue" && (
        <QueuePage cases={state.cases} samples={state.samples} onSelect={openDetail} />
      )}
      {tab === "cases" && (
        <CasesPage cases={state.cases} samples={state.samples} onSelect={openDetail} />
      )}

      {selected && (
        <SampleDetail
          sample={selected}
          cases={state.cases}
          samples={state.samples}
          onSeal={(id) => seal(id, "鉴定员")}
          onReexam={(id) => {
            const copy = reexam(id, "鉴定员");
            if (copy) setSelectedId(copy.id);
          }}
          onClose={() => setSelectedId(null)}
        />
      )}
    </main>
  );
}

export default App;
