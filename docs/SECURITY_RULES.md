# SECURITY_RULES.md — Firestore Security Rules

> Security rules for the mystyleai MVP Firestore database.
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

    // Check if the request is from an authenticated user
    function isAuthenticated() {
      return request.auth != null;
    }

    // Check if the authenticated user is an admin
    function isAdmin() {
      return isAuthenticated() && request.auth.token.admin == true;
    }

    // Check if the authenticated user owns the resource
    function isOwner(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }

    // ─── Collection: designs ───
    // Read: anyone can read public designs
    // Write: server-only (Admin SDK bypasses rules)
    match /designs/{designId} {
      allow read: if resource.data.visibility == "public" || isOwner(resource.data.ownerUid);
      allow create, update, delete: if false; // Server-only via Admin SDK
    }

    // ─── Collection: likes ───
    // Read: anyone can read likes
    // Write: server-only
    match /likes/{likeId} {
      allow read: if true;
      allow create, update, delete: if false; // Server-only via Admin SDK
    }

    // ─── Collection: generationLimits ───
    // Read: owner only
    // Write: server-only
    match /generationLimits/{limitId} {
      allow read: if isAuthenticated() && limitId.matches(request.auth.uid + '_.*');
      allow create, update, delete: if false; // Server-only via Admin SDK
    }

    // ─── Collection: rankings ───
    // Read: anyone can read rankings
    // Write: server-only (snapshot function)
    match /rankings/{rankingId} {
      allow read: if true;
      allow create, update, delete: if false; // Server-only via Admin SDK
    }

    // ─── Collection: users ───
    // Read: anyone can read public profile fields
    // Write: server-only
    match /users/{userId} {
      allow read: if true;
      allow create, update, delete: if false; // Server-only via Admin SDK
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
      allow write: if false; // Server-only via Admin SDK
    }

    // User profile images: readable by anyone, writable only by server
    match /profiles/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if false; // Server-only via Admin SDK
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
| Read public data       | Allowed    | Allowed                |
| Read own private data  | Allowed    | Allowed                |
| Create design          | Blocked    | Allowed                |
| Toggle like            | Blocked    | Allowed                |
| Update counters        | Blocked    | Allowed (atomic)       |
| Modify user profile    | Blocked    | Allowed                |
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

Like counts and generation limits are updated using atomic operations:

```typescript
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Atomic increment
await getFirestore()
  .collection("designs")
  .doc(designId)
  .update({ likeCount: FieldValue.increment(1) });
```

### Rate Limiting

All API routes should implement rate limiting:
- Generation: enforced by `generationLimits` collection
- Likes: 1 per user per design (enforced by document ID pattern)
- General API: consider middleware-level rate limiting (e.g., Vercel Edge)

---

## Testing Rules

Use the Firebase Emulator Suite to test security rules locally:

```bash
firebase emulators:start --only firestore

# Run rule tests
npm run test:rules
```
