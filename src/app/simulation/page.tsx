"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AGENT_PERSONAS } from "@/lib/simulation-config";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";

export default function SimulationPage() {
    const { user, loading } = useAuth();
    const [activeAgentIndex, setActiveAgentIndex] = useState<number | null>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [completedAgents, setCompletedAgents] = useState<number[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingAdmin, setCheckingAdmin] = useState(true);

    const addLog = (msg: string) => {
        setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
    };

    useEffect(() => {
        let mounted = true;

        const checkAdminClaim = async () => {
            if (loading) return;
            if (!user) {
                if (mounted) {
                    setIsAdmin(false);
                    setCheckingAdmin(false);
                }
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

        checkAdminClaim();
        return () => {
            mounted = false;
        };
    }, [user, loading]);

    const startSimulation = async () => {
        if (isRunning || !user || !isAdmin) return;

        setIsRunning(true);
        addLog("Starting simulation for 30 agents...");

        const authToken = await user.getIdToken();

        for (let i = 0; i < AGENT_PERSONAS.length; i++) {
            setActiveAgentIndex(i);
            const agent = AGENT_PERSONAS[i];
            addLog(`Agent ${agent.name} is working...`);

            try {
                const res = await fetch("/api/simulate/agent", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ agentIndex: i }),
                });

                if (!res.ok) {
                    throw new Error(`API Error: ${res.statusText}`);
                }

                const data = await res.json();
                addLog(`Agent ${agent.name} completed! (Design ID: ${data.designId})`);
                setCompletedAgents((prev) => [...prev, i]);
            } catch (error) {
                addLog(`Agent ${agent.name} failed: ${error}`);
            }

            await new Promise((r) => setTimeout(r, 1000));
        }

        setIsRunning(false);
        setActiveAgentIndex(null);
        addLog("Simulation completed!");
    };

    if (loading || checkingAdmin) {
        return (
            <div className="bg-white min-h-screen text-black font-mono p-8">
                <Header pageTitle="SIMULATION CONTROLLER" />
                <div className="max-w-4xl mx-auto pt-24">
                    <p className="text-sm text-gray-600">Checking admin access...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-white min-h-screen text-black font-mono p-8">
                <Header pageTitle="SIMULATION CONTROLLER" />
                <div className="max-w-4xl mx-auto pt-24">
                    <h1 className="text-2xl font-bold mb-3">Admin Login Required</h1>
                    <p className="text-sm text-gray-600 mb-6">Simulation is restricted to administrators.</p>
                    <Link href="/login" className="inline-block px-4 py-2 rounded-lg bg-black text-white text-sm font-bold">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="bg-white min-h-screen text-black font-mono p-8">
                <Header pageTitle="SIMULATION CONTROLLER" />
                <div className="max-w-4xl mx-auto pt-24">
                    <h1 className="text-2xl font-bold mb-3">Access Denied</h1>
                    <p className="text-sm text-gray-600">This page is available only for administrator accounts.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen text-black font-mono p-8">
            <Header pageTitle="SIMULATION CONTROLLER" />

            <div className="max-w-4xl mx-auto pt-20">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">User Activity Simulation</h1>
                        <p className="text-gray-500">Run 30 automated agents to populate content</p>
                    </div>
                    <button
                        onClick={startSimulation}
                        disabled={isRunning}
                        className={`px-6 py-3 rounded-xl font-bold text-white transition-colors ${
                            isRunning ? "bg-gray-400 cursor-not-allowed" : "bg-black hover:bg-gray-800"
                        }`}
                    >
                        {isRunning ? "Simulating..." : "Start Simulation"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <h3 className="font-bold mb-4 flex justify-between">
                            <span>Agent Status</span>
                            <span>{completedAgents.length} / {AGENT_PERSONAS.length}</span>
                        </h3>
                        <div className="grid grid-cols-5 gap-2">
                            {AGENT_PERSONAS.map((agent, i) => (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${
                                        i === activeAgentIndex
                                            ? "bg-blue-500 text-white ring-2 ring-blue-300 scale-110"
                                            : completedAgents.includes(i)
                                              ? "bg-green-500 text-white"
                                              : "bg-gray-200 text-gray-400"
                                    }`}
                                    title={agent.name}
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                        {activeAgentIndex !== null && (
                            <div className="mt-4 p-3 bg-white rounded-xl border border-blue-100">
                                <p className="text-xs font-bold text-blue-600 mb-1">Current Agent</p>
                                <p className="text-sm font-bold">{AGENT_PERSONAS[activeAgentIndex].name}</p>
                                <p className="text-xs text-gray-500">{AGENT_PERSONAS[activeAgentIndex].prompt}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-black text-green-400 rounded-2xl p-6 font-mono text-xs h-[400px] overflow-y-auto">
                        <h3 className="font-bold text-white mb-4 sticky top-0 bg-black pb-2 border-b border-gray-800">
                            System Logs
                        </h3>
                        <div className="space-y-1.5">
                            {logs.map((log, i) => (
                                <div key={i}>{log}</div>
                            ))}
                            {logs.length === 0 && <span className="text-gray-600">Waiting to start...</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
