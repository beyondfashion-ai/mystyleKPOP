import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

// 관리자 계정 초기 세팅 API (개발 환경 전용)
export async function POST(request: Request) {
    try {
        if (process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const configuredSetupToken = process.env.ADMIN_SETUP_TOKEN;
        const requestSetupToken = request.headers.get("x-admin-setup-token");

        if (!configuredSetupToken) {
            return NextResponse.json(
                { error: "ADMIN_SETUP_TOKEN is not configured" },
                { status: 500 }
            );
        }

        if (requestSetupToken !== configuredSetupToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!adminAuth) {
            return NextResponse.json(
                { error: "Admin SDK not available" },
                { status: 500 }
            );
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminDisplayName = process.env.ADMIN_DISPLAY_NAME ?? "Admin";

        if (!adminEmail || !adminPassword) {
            return NextResponse.json(
                { error: "ADMIN_EMAIL / ADMIN_PASSWORD are required" },
                { status: 500 }
            );
        }

        try {
            const existing = await adminAuth.getUserByEmail(adminEmail);
            await adminAuth.setCustomUserClaims(existing.uid, { admin: true });

            if (adminDb) {
                await adminDb.collection("users").doc(existing.uid).set(
                    {
                        role: "admin",
                        email: adminEmail,
                        displayName: adminDisplayName,
                    },
                    { merge: true }
                );
            }

            return NextResponse.json({
                success: true,
                message: "Admin account already exists, claims updated",
                uid: existing.uid,
                email: adminEmail,
            });
        } catch {
            // Continue to creation when user is not found.
        }

        const userRecord = await adminAuth.createUser({
            email: adminEmail,
            password: adminPassword,
            displayName: adminDisplayName,
            emailVerified: true,
        });

        await adminAuth.setCustomUserClaims(userRecord.uid, { admin: true });

        if (adminDb) {
            await adminDb.collection("users").doc(userRecord.uid).set({
                role: "admin",
                email: adminEmail,
                displayName: adminDisplayName,
                createdAt: new Date(),
            });
        }

        return NextResponse.json({
            success: true,
            message: "Admin account created",
            uid: userRecord.uid,
            email: adminEmail,
        });
    } catch (error) {
        console.error("Admin setup error:", error);
        return NextResponse.json(
            { error: "Failed to create admin account" },
            { status: 500 }
        );
    }
}
