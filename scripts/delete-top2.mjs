import fs from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Parse .env.local
const envLines = fs.readFileSync(".env.local", "utf-8").split("\n");
for (const line of envLines) {
  const idx = line.indexOf("=");
  if (idx > 0 && !line.startsWith("#")) {
    const key = line.substring(0, idx).trim();
    let val = line.substring(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

// Fix private key newlines
const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n");

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey,
  }),
});
const db = getFirestore(app);

const snap = await db.collection("designs").where("visibility", "==", "public").get();
const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
rows.sort((a, b) => {
  const aScore = Number(a.likeCount || 0) + Number(a.boostCount || 0) * 10;
  const bScore = Number(b.likeCount || 0) + Number(b.boostCount || 0) * 10;
  return bScore - aScore;
});

console.log(`Total public designs: ${rows.length}`);
if (rows.length < 2) {
  console.log("Not enough designs to delete top 2.");
  process.exit(0);
}

const top2 = rows.slice(0, 2);
for (const d of top2) {
  const score = Number(d.likeCount || 0) + Number(d.boostCount || 0) * 10;
  console.log(`Deleting: ${d.id} | score: ${score} | likes: ${d.likeCount} | boost: ${d.boostCount} | handle: ${d.ownerHandle} | group: ${d.groupTag}`);
  await db.collection("designs").doc(d.id).delete();
  console.log(`  -> Deleted ${d.id}`);
}

console.log("Done. Top 2 designs deleted.");
process.exit(0);
