"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AGENT_PERSONAS, type AgentPersona } from "@/lib/simulation-config";
import { IDOL_TYPES, CONCEPT_STYLES } from "@/data/concept-styles";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

// ─── Types ───

type StepStatus = "pending" | "running" | "done" | "error" | "skipped";

interface AgentStep {
  generate: StepStatus;
  feedback: StepStatus;
  publish: StepStatus;
  vote: StepStatus;
}

interface AgentResult {
  steps: AgentStep;
  imageUrl?: string;
  designId?: string;
  storageUrl?: boolean; // true if permanent Firebase Storage URL
  feedbackCount?: number;
  voteCount?: number;
  error?: string;
}

type LogLevel = "info" | "success" | "warn" | "error";

interface LogEntry {
  time: string;
  level: LogLevel;
  message: string;
}

// ─── Helpers ───

function now() {
  return new Date().toLocaleTimeString("ko-KR", { hour12: false });
}

const STEP_LABELS: Record<keyof AgentStep, string> = {
  generate: "생성",
  feedback: "피드백",
  publish: "발행",
  vote: "투표",
};

const STEP_COLORS: Record<StepStatus, string> = {
  pending: "bg-gray-200 text-gray-400",
  running: "bg-blue-500 text-white animate-pulse",
  done: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  skipped: "bg-yellow-400 text-yellow-900",
};

const AGENT_COLORS: Record<string, string> = {
  pending: "bg-gray-200 text-gray-500",
  running: "bg-blue-500 text-white ring-2 ring-blue-300 scale-105",
  done: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
};

function getAgentStatus(r?: AgentResult): string {
  if (!r) return "pending";
  const steps = Object.values(r.steps);
  if (steps.some((s) => s === "running")) return "running";
  if (steps.some((s) => s === "error")) return "error";
  if (steps.every((s) => s === "done" || s === "skipped")) return "done";
  return "pending";
}

// ─── Cost estimator ───
// fal.ai Flux 2 Turbo ≈ $0.01/image, Gemini Flash ≈ free tier
function estimateCost(count: number): string {
  const falCost = count * 0.01;
  return `~$${falCost.toFixed(2)}`;
}

// ─── Component ───

export default function SimulationPage() {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Settings
  const [agentCount, setAgentCount] = useState(5);
  const [enableFeedback, setEnableFeedback] = useState(true);
  const [enableVote, setEnableVote] = useState(true);

  // Runtime
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const cancelRef = useRef(false);
  const pauseRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [results, setResults] = useState<Map<number, AgentResult>>(new Map());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Collect designIds from completed agents for voting targets
  const completedDesignIds = useRef<string[]>([]);

  const addLog = useCallback((level: LogLevel, message: string) => {
    setLogs((prev) => [...prev, { time: now(), level, message }]);
  }, []);

  const updateResult = useCallback((idx: number, fn: (prev: AgentResult) => AgentResult) => {
    setResults((prev) => {
      const next = new Map(prev);
      const current = next.get(idx) || {
        steps: { generate: "pending", feedback: "pending", publish: "pending", vote: "pending" },
      };
      next.set(idx, fn(current));
      return next;
    });
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Admin check
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      if (loading) return;
      if (!user) {
        if (mounted) { setIsAdmin(false); setCheckingAdmin(false); }
        return;
      }
      try {
        const tokenResult = await user.getIdTokenResult();
        if (mounted) setIsAdmin(Boolean(tokenResult.claims.admin));
      } catch {
        if (mounted) setIsAdmin(false);
      } finally {
        if (mounted) setCheckingAdmin(false);
      }
    };
    check();
    return () => { mounted = false; };
  }, [user, loading]);

  // ─── Orchestration ───

  const runAgent = useCallback(async (idx: number, agent: AgentPersona, authToken: string) => {
    const idolType = IDOL_TYPES.find((t) => t.id === agent.idolType)!;
    const concept = CONCEPT_STYLES.find((c) => c.id === agent.conceptId)!;

    // Step 1: Generate
    updateResult(idx, (r) => ({ ...r, steps: { ...r.steps, generate: "running" } }));
    addLog("info", `[${agent.name}] 이미지 생성 중... (${concept.label})`);

    let imageUrl: string | undefined;
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: agent.tags.join(", "),
          idolType: idolType.prompt,
          conceptStyle: concept.mood,
          conceptPrompt: concept.prompt,
          imageCount: 1,
          quality: "light",
        }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      imageUrl = data.urls?.[0];
      if (!imageUrl) throw new Error("No image URL returned");

      updateResult(idx, (r) => ({ ...r, imageUrl, steps: { ...r.steps, generate: "done" } }));
      addLog("success", `[${agent.name}] 이미지 생성 완료`);
    } catch (err) {
      updateResult(idx, (r) => ({
        ...r,
        error: String(err),
        steps: { ...r.steps, generate: "error", feedback: "skipped", publish: "skipped", vote: "skipped" },
      }));
      addLog("error", `[${agent.name}] 생성 실패: ${err}`);
      return;
    }

    // Step 2: Stylist Feedback (optional)
    let feedbacks: unknown[] | undefined;
    if (enableFeedback) {
      updateResult(idx, (r) => ({ ...r, steps: { ...r.steps, feedback: "running" } }));
      addLog("info", `[${agent.name}] 스타일리스트 피드백 요청 중...`);
      try {
        const res = await fetch("/api/stylist/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idolType: idolType.label,
            concept: concept.label,
            keywords: agent.tags.join(", "),
            imageUrl,
          }),
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const data = await res.json();
        feedbacks = data.feedbacks;
        updateResult(idx, (r) => ({
          ...r,
          feedbackCount: Array.isArray(feedbacks) ? feedbacks.length : 0,
          steps: { ...r.steps, feedback: "done" },
        }));
        addLog("success", `[${agent.name}] 피드백 ${feedbacks?.length || 0}개 수신`);
      } catch (err) {
        updateResult(idx, (r) => ({ ...r, steps: { ...r.steps, feedback: "error" } }));
        addLog("warn", `[${agent.name}] 피드백 실패 (계속 진행): ${err}`);
      }
    } else {
      updateResult(idx, (r) => ({ ...r, steps: { ...r.steps, feedback: "skipped" } }));
    }

    // Step 3: Publish
    updateResult(idx, (r) => ({ ...r, steps: { ...r.steps, publish: "running" } }));
    addLog("info", `[${agent.name}] 갤러리에 발행 중...`);

    let designId: string | undefined;
    try {
      const res = await fetch("/api/designs/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          imageUrls: [imageUrl],
          prompt: agent.tags.join(", "),
          concept: concept.label,
          keywords: agent.tags.join(","),
          groupTag: agent.groupTag,
          ownerUid: `simulation_${agent.name}`,
          ownerHandle: agent.name,
          stylistFeedbacks: feedbacks || [],
          selectedStylistId: Array.isArray(feedbacks) && feedbacks.length > 0
            ? (feedbacks[0] as { personaId?: string }).personaId || null
            : null,
        }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      designId = data.designId;
      if (!designId) throw new Error("No designId returned");

      // Check if published with permanent Storage URL
      const isStorageUrl = !imageUrl.includes("fal.run") && !imageUrl.includes("fal-cdn");
      updateResult(idx, (r) => ({
        ...r,
        designId,
        storageUrl: isStorageUrl,
        steps: { ...r.steps, publish: "done" },
      }));
      addLog("success", `[${agent.name}] 발행 완료 (ID: ${designId})`);
      completedDesignIds.current.push(designId);
    } catch (err) {
      updateResult(idx, (r) => ({
        ...r,
        error: String(err),
        steps: { ...r.steps, publish: "error", vote: "skipped" },
      }));
      addLog("error", `[${agent.name}] 발행 실패: ${err}`);
      return;
    }

    // Step 4: Vote (optional)
    if (enableVote) {
      updateResult(idx, (r) => ({ ...r, steps: { ...r.steps, vote: "running" } }));

      // Pick up to 3 targets from previously completed designs (not own)
      const targets = completedDesignIds.current
        .filter((id) => id !== designId)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      if (targets.length === 0) {
        updateResult(idx, (r) => ({ ...r, voteCount: 0, steps: { ...r.steps, vote: "skipped" } }));
        addLog("info", `[${agent.name}] 투표 대상 없음 (첫 에이전트)`);
      } else {
        try {
          const res = await fetch("/api/simulate/agent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
              action: "vote",
              agentName: agent.name,
              targetDesignIds: targets,
            }),
          });
          if (!res.ok) throw new Error(`${res.status}`);
          const data = await res.json();
          updateResult(idx, (r) => ({
            ...r,
            voteCount: data.votedCount || 0,
            steps: { ...r.steps, vote: "done" },
          }));
          addLog("success", `[${agent.name}] ${data.votedCount || 0}개 디자인에 투표`);
        } catch (err) {
          updateResult(idx, (r) => ({ ...r, steps: { ...r.steps, vote: "error" } }));
          addLog("warn", `[${agent.name}] 투표 실패: ${err}`);
        }
      }
    } else {
      updateResult(idx, (r) => ({ ...r, steps: { ...r.steps, vote: "skipped" } }));
    }
  }, [enableFeedback, enableVote, addLog, updateResult]);

  const startSimulation = useCallback(async () => {
    if (isRunning || !user || !isAdmin) return;

    setIsRunning(true);
    setIsPaused(false);
    cancelRef.current = false;
    pauseRef.current = false;
    setResults(new Map());
    setLogs([]);
    completedDesignIds.current = [];
    setActiveIndex(null);

    const agents = AGENT_PERSONAS.slice(0, agentCount);
    addLog("info", `시뮬레이션 시작: ${agents.length}명 에이전트`);

    const authToken = await user.getIdToken();

    for (let i = 0; i < agents.length; i++) {
      // Check cancel
      if (cancelRef.current) {
        addLog("warn", "시뮬레이션 중단됨");
        break;
      }

      // Check pause
      while (pauseRef.current) {
        await new Promise((r) => setTimeout(r, 500));
        if (cancelRef.current) break;
      }
      if (cancelRef.current) {
        addLog("warn", "시뮬레이션 중단됨");
        break;
      }

      setActiveIndex(i);
      setSelectedAgent(i);
      await runAgent(i, agents[i], authToken);

      // Small delay between agents
      if (i < agents.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    setIsRunning(false);
    setActiveIndex(null);
    addLog("info", "시뮬레이션 완료!");
  }, [isRunning, user, isAdmin, agentCount, addLog, runAgent]);

  const togglePause = useCallback(() => {
    const next = !isPaused;
    setIsPaused(next);
    pauseRef.current = next;
    addLog("info", next ? "일시정지" : "재개");
  }, [isPaused, addLog]);

  const stopSimulation = useCallback(() => {
    cancelRef.current = true;
    pauseRef.current = false;
    setIsPaused(false);
  }, []);

  // ─── Validation Dashboard Stats ───

  const allResults = Array.from(results.values());
  const stats = {
    total: allResults.length,
    generateOk: allResults.filter((r) => r.steps.generate === "done").length,
    generateErr: allResults.filter((r) => r.steps.generate === "error").length,
    feedbackOk: allResults.filter((r) => r.steps.feedback === "done").length,
    feedbackErr: allResults.filter((r) => r.steps.feedback === "error").length,
    publishOk: allResults.filter((r) => r.steps.publish === "done").length,
    publishErr: allResults.filter((r) => r.steps.publish === "error").length,
    voteOk: allResults.filter((r) => r.steps.vote === "done").length,
    voteErr: allResults.filter((r) => r.steps.vote === "error").length,
    storageOk: allResults.filter((r) => r.storageUrl).length,
  };

  // ─── Render Guards ───

  if (loading || checkingAdmin) {
    return (
      <div className="bg-gray-950 min-h-screen text-white font-mono p-8">
        <Header pageTitle="SIMULATION" />
        <div className="max-w-6xl mx-auto pt-24">
          <p className="text-sm text-gray-400">Admin 권한 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-950 min-h-screen text-white font-mono p-8">
        <Header pageTitle="SIMULATION" />
        <div className="max-w-6xl mx-auto pt-24">
          <h1 className="text-2xl font-bold mb-3">로그인 필요</h1>
          <p className="text-sm text-gray-400 mb-6">시뮬레이션은 관리자 전용입니다.</p>
          <Link href="/login" className="inline-block px-4 py-2 rounded-lg bg-white text-black text-sm font-bold">
            로그인
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-gray-950 min-h-screen text-white font-mono p-8">
        <Header pageTitle="SIMULATION" />
        <div className="max-w-6xl mx-auto pt-24">
          <h1 className="text-2xl font-bold mb-3">접근 제한</h1>
          <p className="text-sm text-gray-400">관리자 계정만 접근 가능합니다.</p>
        </div>
      </div>
    );
  }

  const agents = AGENT_PERSONAS.slice(0, agentCount);
  const selResult = selectedAgent !== null ? results.get(selectedAgent) : undefined;
  const selAgent = selectedAgent !== null ? AGENT_PERSONAS[selectedAgent] : undefined;

  return (
    <div className="bg-gray-950 min-h-screen text-white font-mono">
      <Header pageTitle="SIMULATION" />

      <div className="max-w-6xl mx-auto pt-20 px-4 pb-12 space-y-6">

        {/* ── Section 1: Settings Panel ── */}
        <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
          <h2 className="text-lg font-bold mb-4">설정</h2>
          <div className="flex flex-wrap gap-6 items-end">
            {/* Agent count */}
            <div>
              <label className="text-xs text-gray-400 block mb-1">에이전트 수</label>
              <div className="flex gap-2">
                {[5, 10, 15, 30].map((n) => (
                  <button
                    key={n}
                    onClick={() => !isRunning && setAgentCount(n)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      agentCount === n
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isRunning}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableFeedback}
                  onChange={(e) => !isRunning && setEnableFeedback(e.target.checked)}
                  disabled={isRunning}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className={isRunning ? "text-gray-500" : ""}>피드백</span>
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableVote}
                  onChange={(e) => !isRunning && setEnableVote(e.target.checked)}
                  disabled={isRunning}
                  className="w-4 h-4 accent-blue-500"
                />
                <span className={isRunning ? "text-gray-500" : ""}>투표</span>
              </label>
            </div>

            {/* Cost estimate */}
            <div className="text-xs text-gray-500">
              예상 비용: <span className="text-yellow-400 font-bold">{estimateCost(agentCount)}</span>
              <span className="ml-1">(fal.ai 기준)</span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 ml-auto">
              {!isRunning ? (
                <button
                  onClick={startSimulation}
                  className="px-5 py-2 rounded-xl font-bold bg-green-600 hover:bg-green-500 text-white transition-colors"
                >
                  시작
                </button>
              ) : (
                <>
                  <button
                    onClick={togglePause}
                    className="px-4 py-2 rounded-xl font-bold bg-yellow-600 hover:bg-yellow-500 text-white transition-colors"
                  >
                    {isPaused ? "재개" : "일시정지"}
                  </button>
                  <button
                    onClick={stopSimulation}
                    className="px-4 py-2 rounded-xl font-bold bg-red-600 hover:bg-red-500 text-white transition-colors"
                  >
                    중단
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 2: Agent Grid + Detail ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Grid */}
          <div className="lg:col-span-1 bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <h3 className="font-bold text-sm mb-3 flex justify-between">
              <span>에이전트</span>
              <span className="text-gray-400">
                {allResults.filter((r) => getAgentStatus(r) === "done").length} / {agents.length}
              </span>
            </h3>
            <div className="grid grid-cols-5 gap-1.5">
              {agents.map((agent, i) => {
                const status = getAgentStatus(results.get(i));
                const isActive = i === activeIndex;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedAgent(i)}
                    className={`aspect-square rounded-md flex items-center justify-center text-[9px] font-bold transition-all ${
                      isActive ? AGENT_COLORS.running : AGENT_COLORS[status] || AGENT_COLORS.pending
                    } ${selectedAgent === i ? "ring-2 ring-white" : ""}`}
                    title={agent.name}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail */}
          <div className="lg:col-span-2 bg-gray-900 rounded-2xl p-4 border border-gray-800 min-h-[200px]">
            {selAgent ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg font-bold">{selAgent.name}</span>
                  <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">
                    {selAgent.groupTag}
                  </span>
                  <span className="text-xs text-gray-400">
                    {IDOL_TYPES.find((t) => t.id === selAgent.idolType)?.icon}{" "}
                    {CONCEPT_STYLES.find((c) => c.id === selAgent.conceptId)?.label}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {selAgent.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Step progress */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {(Object.keys(STEP_LABELS) as (keyof AgentStep)[]).map((step) => {
                    const status = selResult?.steps[step] || "pending";
                    return (
                      <div key={step} className="text-center">
                        <div className={`rounded-lg py-2 text-xs font-bold ${STEP_COLORS[status]}`}>
                          {STEP_LABELS[step]}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Result info */}
                {selResult?.imageUrl && (
                  <div className="flex gap-3 items-start">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selResult.imageUrl}
                      alt="Generated"
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                    <div className="text-xs space-y-1 text-gray-300">
                      {selResult.designId && <p>Design ID: <span className="text-white font-mono">{selResult.designId}</span></p>}
                      {selResult.feedbackCount !== undefined && <p>피드백: {selResult.feedbackCount}개</p>}
                      {selResult.voteCount !== undefined && <p>투표: {selResult.voteCount}건</p>}
                      {selResult.storageUrl !== undefined && (
                        <p>Storage: <span className={selResult.storageUrl ? "text-green-400" : "text-yellow-400"}>
                          {selResult.storageUrl ? "Firebase" : "fal.ai (임시)"}
                        </span></p>
                      )}
                      {selResult.error && <p className="text-red-400">{selResult.error}</p>}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                에이전트를 선택하세요
              </div>
            )}
          </div>
        </div>

        {/* ── Section 3: Validation Dashboard ── */}
        {stats.total > 0 && (
          <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
            <h2 className="text-lg font-bold mb-4">검증 대시보드</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Generate */}
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">이미지 생성</div>
                <div className="text-2xl font-bold text-green-400">{stats.generateOk}</div>
                <div className="text-xs text-gray-500">
                  {stats.generateErr > 0 && <span className="text-red-400">{stats.generateErr} 실패</span>}
                  {stats.generateErr === 0 && `/ ${stats.total}`}
                </div>
              </div>
              {/* Feedback */}
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">AI 피드백</div>
                <div className="text-2xl font-bold text-blue-400">{stats.feedbackOk}</div>
                <div className="text-xs text-gray-500">
                  {stats.feedbackErr > 0 && <span className="text-yellow-400">{stats.feedbackErr} 실패</span>}
                  {stats.feedbackErr === 0 && `/ ${stats.total}`}
                </div>
              </div>
              {/* Publish */}
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">발행 (Storage)</div>
                <div className="text-2xl font-bold text-purple-400">{stats.publishOk}</div>
                <div className="text-xs text-gray-500">
                  {stats.storageOk > 0 && <span className="text-green-400">{stats.storageOk} 영구 URL</span>}
                  {stats.publishErr > 0 && <span className="text-red-400 ml-1">{stats.publishErr} 실패</span>}
                </div>
              </div>
              {/* Vote */}
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">투표</div>
                <div className="text-2xl font-bold text-yellow-400">{stats.voteOk}</div>
                <div className="text-xs text-gray-500">
                  {stats.voteErr > 0 && <span className="text-red-400">{stats.voteErr} 실패</span>}
                  {stats.voteErr === 0 && `/ ${stats.total}`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Section 4: System Log ── */}
        <div className="bg-black rounded-2xl p-4 border border-gray-800 font-mono text-xs h-[300px] overflow-y-auto">
          <h3 className="font-bold text-gray-300 mb-3 sticky top-0 bg-black pb-2 border-b border-gray-800 z-10">
            시스템 로그
          </h3>
          <div className="space-y-0.5">
            {logs.length === 0 && <span className="text-gray-600">대기 중...</span>}
            {logs.map((log, i) => (
              <div
                key={i}
                className={
                  log.level === "error"
                    ? "text-red-400"
                    : log.level === "warn"
                      ? "text-yellow-400"
                      : log.level === "success"
                        ? "text-green-400"
                        : "text-gray-400"
                }
              >
                <span className="text-gray-600">[{log.time}]</span> {log.message}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
