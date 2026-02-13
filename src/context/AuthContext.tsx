"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    User,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
    signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<{ error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
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
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!auth) {
            console.warn("Firebase Auth is unavailable.");
            return;
        }
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
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
