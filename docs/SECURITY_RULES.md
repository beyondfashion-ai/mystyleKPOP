# SECURITY_RULES.md — Firestore Security Rules

> Security rules for the MyStyleAI MVP Firestore database.
> Core principle: **Server-write only.** Clients never write directly to Firestore.

---

## Architecture Decision

All data mutations flow through Next.js API routes, which use the Firebase Admin SDK. The Admin SDK **bypasses Firestore security rules entirely**. Therefore, Firestore rules serve as a **safety net** to prevent any accidental or malicious client-side writes.

Client-side Firebase SDK is used **only for**:
- Authentication (sign up, sign in, sign out)
- Reading public data (gallery listings, design details, rankings)

---

## Firestore Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ─── Helper Functions ───

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() && request.auth.token.admin == true;
    }

    function isOwner(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }

    // ─── Collection: designs ───
    match /designs/{designId} {
      allow read: if resource.data.visibility == "public" || isOwner(resource.data.ownerUid);
      allow create, update, delete: if false;
    }

    // ─── Collection: votes ───
    match /votes/{voteId} {
      allow read: if true;
      allow create, update, delete: if false;
    }

    // ─── Collection: generationLimits ───
    match /generationLimits/{limitId} {
      allow read: if isAuthenticated() && limitId.matches(request.auth.uid + '_.*');
      allow create, update, delete: if false;
    }

    // ─── Collection: rankings ───
    match /rankings/{rankingId} {
      allow read: if true;
      allow create, update, delete: if false;
    }

    // ─── Collection: users ───
    match /users/{userId} {
      allow read: if true;
      allow create, update, delete: if false;
    }

    // ─── Collection: adminSettings ───
    match /adminSettings/{docId} {
      allow read: if isAdmin();
      allow create, update, delete: if false;
    }

    // ─── Collection: loraModels ───
    match /loraModels/{loraId} {
      allow read: if false;  // Server-only; never read from client
      allow create, update, delete: if false;
    }

    // ─── Collection: reports ───
    match /reports/{reportId} {
      allow read: if isAdmin();
      allow create, update, delete: if false;
    }

    // ─── Collection: moderationLogs ───
    match /moderationLogs/{logId} {
      allow read: if isAdmin();
      allow create, update, delete: if false;
    }

    // ─── Collection: credits_ledger ───
    match /credits_ledger/{ledgerId} {
      allow read: if isAuthenticated() && resource.data.uid == request.auth.uid;
      allow create, update, delete: if false;
    }

    // ─── Catch-all: deny everything else ───
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Storage Rules

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    // Design images: readable by anyone, writable only by server
    match /designs/{designId}/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }

    // User profile images: readable by anyone, writable only by server
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }

    // Catch-all: deny everything else
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Deployment

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

---

## Security Considerations

### Server-Write Architecture

| Operation              | Client SDK | Admin SDK (API Routes) |
| ---------------------- | ---------- | ---------------------- |
| Read public designs    | Allowed    | Allowed                |
| Read own private data  | Allowed    | Allowed                |
| Read admin settings    | Admin only | Allowed                |
| Read LoRA models       | Blocked    | Allowed                |
| Create design          | Blocked    | Allowed                |
| Cast vote              | Blocked    | Allowed                |
| Update counters        | Blocked    | Allowed (atomic)       |
| Publish design         | Blocked    | Allowed                |
| Modify user profile    | Blocked    | Allowed                |
| Read own credits/ledger| Allowed    | Allowed                |
| Deduct/add credits     | Blocked    | Allowed (atomic)       |
| Admin operations       | Blocked    | Allowed (claims check) |

### Admin Claims

Admin status is determined **exclusively** by Firebase Custom Claims:

```typescript
// Setting admin claims (run once per admin user)
import { getAuth } from "firebase-admin/auth";
await getAuth().setCustomUserClaims(uid, { admin: true });

// Checking admin in API routes
const decodedToken = await getAuth().verifyIdToken(token);
if (decodedToken.admin !== true) {
  return Response.json({ error: "Forbidden" }, { status: 403 });
}
```

### Counter Atomicity

Vote counts are updated using atomic operations:

```typescript
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Atomic increment in POST /api/vote
await getFirestore()
  .collection("designs")
  .doc(designId)
  .update({ likeCount: FieldValue.increment(1) });
```

### Rate Limiting

- Generation: enforced by `generationLimits` collection
- Voting: 1 per user per design (enforced by document ID pattern `{designId}_{uid}`)
- Admin endpoints: protected by Custom Claims check
- General API: consider middleware-level rate limiting (e.g., Vercel Edge)

---

## Testing Rules

Use the Firebase Emulator Suite to test security rules locally:

```bash
firebase emulators:start --only firestore

# Run rule tests
npm run test:rules
```
