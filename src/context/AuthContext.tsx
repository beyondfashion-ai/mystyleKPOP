"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<{ error?: string }>;
    signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
    signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => ({}),
    signInWithEmail: async () => ({}),
    signUpWithEmail: async () => ({}),
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth || typeof auth.onAuthStateChanged !== "function") {
            console.warn("Firebase Auth not initialized. Check NEXT_PUBLIC_FIREBASE_* env vars in .env.local");
            setLoading(false);
            return;
        }

        // Handle signInWithRedirect result (when returning from Google OAuth)
        getRedirectResult(auth).catch((error) => {
            console.error("Redirect sign-in failed:", error);
        });

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async (): Promise<{ error?: string }> => {
        if (!auth) {
            return { error: "인증 서비스가 설정되지 않았습니다. 환경변수를 확인해주세요." };
        }
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            return {};
        } catch (error) {
            console.error("Error signing in with Google", error);
            const code = (error as { code?: string })?.code || "";
            if (code === "auth/popup-closed-by-user") {
                return { error: "Google 로그인이 취소되었습니다." };
            }
            if (code === "auth/cancelled-popup-request") {
                return { error: "이미 로그인 팝업이 열려있습니다. 기존 팝업을 먼저 닫아주세요." };
            }
            if (code === "auth/popup-blocked") {
                // Popup blocked — fall back to redirect
                try {
                    await signInWithRedirect(auth, provider);
                } catch {
                    return { error: "팝업이 차단되었습니다. 브라우저 팝업 허용 후 다시 시도해주세요." };
                }
                return {};
            }
            if (code === "auth/unauthorized-domain") {
                const domain = typeof window !== "undefined" ? window.location.hostname : "unknown";
                console.error(`Firebase unauthorized domain: ${domain}. Add it to Firebase Console → Authentication → Settings → Authorized domains.`);
                return { error: `현재 도메인(${domain})이 Firebase 승인 도메인에 등록되지 않았습니다. 관리자에게 문의해주세요.` };
            }
            if (code === "auth/operation-not-allowed") {
                return { error: "Google 로그인이 비활성화되어 있습니다. Firebase 설정을 확인해주세요." };
            }
            if (code === "auth/network-request-failed") {
                return { error: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인 후 다시 시도해주세요." };
            }
            if (code === "auth/invalid-api-key") {
                return { error: "Firebase API 키가 유효하지 않습니다." };
            }
            return { error: `Google 로그인에 실패했습니다. (${code || "알 수 없는 오류"})` };
        }
    };

    const signInWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
        if (!auth) {
            return { error: "Auth is not configured. Check environment variables." };
        }
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return {};
        } catch (error: unknown) {
            const code = (error as { code?: string })?.code || "";
            if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
                return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
            }
            if (code === "auth/too-many-requests") {
                return { error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요." };
            }
            return { error: "로그인에 실패했습니다. 다시 시도해주세요." };
        }
    };

    const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<{ error?: string }> => {
        if (!auth) {
            return { error: "Auth is not configured. Check environment variables." };
        }
        try {
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            if (displayName) {
                await updateProfile(cred.user, { displayName });
            }
            return {};
        } catch (error: unknown) {
            const code = (error as { code?: string })?.code || "";
            if (code === "auth/email-already-in-use") {
                return { error: "이미 사용 중인 이메일입니다." };
            }
            if (code === "auth/weak-password") {
                return { error: "비밀번호는 6자 이상이어야 합니다." };
            }
            return { error: "회원가입에 실패했습니다. 다시 시도해주세요." };
        }
    };

    const logout = async () => {
        if (!auth) {
            return;
        }
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
