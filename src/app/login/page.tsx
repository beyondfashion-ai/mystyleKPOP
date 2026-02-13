"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { user, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<"login" | "signup">("login");

    useEffect(() => {
        if (user) {
            router.push("/studio");
        }
    }, [user, router]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError("이메일과 비밀번호를 입력해주세요.");
            return;
        }
        setError("");
        setIsLoading(true);

        if (mode === "login") {
            const result = await signInWithEmail(email, password);
            if (result.error) setError(result.error);
        } else {
            if (password.length < 6) {
                setError("비밀번호는 6자 이상이어야 합니다.");
                setIsLoading(false);
                return;
            }
            const result = await signUpWithEmail(email, password, displayName || undefined);
            if (result.error) setError(result.error);
        }

        setIsLoading(false);
    };

    return (
        <div className="bg-white text-black min-h-screen flex flex-col font-korean">
            {/* Top accent bar */}
            <div className="h-1 bg-gradient-to-r from-black via-gray-800 to-vibrant-cyan"></div>

            <div className="flex-1 flex flex-col justify-center items-center px-6 py-12">
                {/* Brand */}
                <div className="mb-12 text-center">
                    <h1 className="text-2xl font-extrabold tracking-tighter font-display">
                        MY-STYLE<span className="text-vibrant-cyan">.</span>AI
                    </h1>
                    <p className="text-[12px] text-gray-400 mt-2 tracking-wide">AI K-POP Stage Fashion Design</p>
                </div>

                {/* Card */}
                <div className="w-full max-w-[360px]">
                    {/* Tab switch */}
                    <div className="flex mb-8 bg-gray-50 rounded-xl p-1">
                        <button
                            onClick={() => { setMode("login"); setError(""); }}
                            className={`flex-1 py-2.5 text-[13px] font-bold rounded-lg transition-all ${mode === "login"
                                    ? "bg-black text-white shadow-sm"
                                    : "text-gray-400 hover:text-black"
                                }`}
                        >
                            로그인
                        </button>
                        <button
                            onClick={() => { setMode("signup"); setError(""); }}
                            className={`flex-1 py-2.5 text-[13px] font-bold rounded-lg transition-all ${mode === "signup"
                                    ? "bg-black text-white shadow-sm"
                                    : "text-gray-400 hover:text-black"
                                }`}
                        >
                            회원가입
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-3">
                        {mode === "signup" && (
                            <div>
                                <input
                                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors text-[14px] placeholder:text-gray-300"
                                    placeholder="닉네임 (선택)"
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                />
                            </div>
                        )}
                        <div>
                            <input
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors text-[14px] placeholder:text-gray-300"
                                placeholder="이메일"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                        <div>
                            <input
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors text-[14px] placeholder:text-gray-300"
                                placeholder="비밀번호"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete={mode === "login" ? "current-password" : "new-password"}
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <p className="text-red-500 text-[12px] font-medium px-1">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-[14px] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    처리 중...
                                </span>
                            ) : mode === "login" ? "로그인" : "가입하기"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative flex items-center justify-center my-8">
                        <div className="border-t border-gray-100 w-full"></div>
                        <span className="absolute bg-white px-4 text-[10px] font-bold text-gray-300 tracking-widest uppercase">또는</span>
                    </div>

                    {/* Google Login */}
                    <button
                        onClick={signInWithGoogle}
                        className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 rounded-xl text-[14px] font-medium hover:border-black hover:shadow-sm transition-all"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google로 계속하기
                    </button>

                    {/* Admin hint */}
                    <p className="text-center text-[10px] text-gray-300 mt-6">
                        관리자: admin@mystyle.ai
                    </p>
                </div>
            </div>

            {/* Footer */}
            <footer className="py-6 text-center">
                <p className="text-[10px] text-gray-300">
                    © 2025 MY-STYLE.AI · All rights reserved
                </p>
            </footer>
        </div>
    );
}
