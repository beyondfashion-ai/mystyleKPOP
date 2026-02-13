import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

let app: App;
let adminDb: Firestore;
let adminAuth: Auth;

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "Firebase Admin: Missing env vars (FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY). Using client SDK fallback."
    );
    // Return a minimal app with just project ID if available
    if (projectId) {
      return initializeApp({ projectId });
    }
    throw new Error("Firebase Admin SDK not configured");
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

try {
  app = getAdminApp();
  adminDb = getFirestore(app);
  adminAuth = getAuth(app);
} catch (e) {
  console.warn("Firebase Admin SDK initialization failed:", e);
  // These will be undefined — callers should check
  adminDb = undefined as unknown as Firestore;
  adminAuth = undefined as unknown as Auth;
}

export { adminDb, adminAuth };
