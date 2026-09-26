// 应用外壳：承接页面切换，把页面事件转交给判定层，并把结果交给存取层持久化。
import { useEffect, useState } from "react";
import "./styles.css";
import {
  IntakeInput,
  State,
  intakeSample,
  requestReexam,
  sealSample,
  verifySample,
} from "./domain";
import { loadState, resetState, saveState } from "./storage";
import IntakePage from "./pages/IntakePage";
import VerifyPage from "./pages/VerifyPage";
import IdentifyPage from "./pages/IdentifyPage";
import CasesPage from "./pages/CasesPage";
import SampleDetail from "./pages/SampleDetail";

type Tab = "intake" | "verify" | "identify" | "cases";

const TABS: { key: Tab; label: string }[] = [
  { key: "intake", label: "入库登记" },
  { key: "verify", label: "核对台" },
  { key: "identify", label: "鉴定队列" },
  { key: "cases", label: "案件总览" },
];

export default function App() {
  const [state, setState] = useState<State>(() => loadState());
  const [tab, setTab] = useState<Tab>("intake");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  const heldCount = state.samples.filter((s) => s.status === "held").length;
  const detail = detailId ? state.samples.find((s) => s.id === detailId) ?? null : null;

  const handleIntake = (input: IntakeInput): string[] => {
    const r = intakeSample(state, input);
    setState(r.state);
    return r.reasons;
  };

  const handleVerify = (id: string, photoNo: string): string | null => {
    const r = verifySample(state, id, photoNo);
    if (r.error) return r.error;
    setState(r.state);
    setToast("已核对归回，样本进入鉴定队列");
    return null;
  };

  const handleSeal = (id: string) => {
    const r = sealSample(state, id);
    if (r.error) {
      setToast(r.error);
      return;
    }
    setState(r.state);
    setToast("样本已封存，原记录与温度曲线锁定");
  };

  const handleReexam = (id: string) => {
    const r = requestReexam(state, id);
    if (r.error || !r.copy) {
      setToast(r.error ?? "复检失败");
      return;
    }
    setState(r.state);
    setToast(`已建立复检副本 ${r.copy.barcode}，原记录与温度曲线未改动`);
  };

  const handleReset = () => {
    if (!window.confirm("确定重置为预置演示数据？本浏览器内的全部改动将被清除。")) return;
    setState(resetState());
    setDetailId(null);
    setToast("已重置为预置演示数据");
  };

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <h1>法医昆虫样本追踪台</h1>
          <p>数据仅保存在本浏览器 · 判定 / 存取 / 页面分层承接</p>
        </div>
        <nav>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={tab === t.key ? "active" : ""}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === "verify" && heldCount > 0 && (
                <span className="bubble">{heldCount}</span>
              )}
            </button>
          ))}
          <button className="ghost" onClick={handleReset}>
            重置演示数据
          </button>
        </nav>
      </header>

      {tab === "intake" && (
        <IntakePage cases={state.cases} samples={state.samples} onIntake={handleIntake} />
      )}
      {tab === "verify" && (
        <VerifyPage cases={state.cases} samples={state.samples} onVerify={handleVerify} />
      )}
      {tab === "identify" && (
        <IdentifyPage cases={state.cases} samples={state.samples} onOpen={setDetailId} />
      )}
      {tab === "cases" && (
        <CasesPage cases={state.cases} samples={state.samples} onOpen={setDetailId} />
      )}

      {detail && (
        <SampleDetail
          sample={detail}
          samples={state.samples}
          cases={state.cases}
          onClose={() => setDetailId(null)}
          onOpen={setDetailId}
          onSeal={handleSeal}
          onReexam={handleReexam}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
