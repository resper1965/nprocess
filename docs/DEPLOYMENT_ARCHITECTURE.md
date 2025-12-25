# nProcess Deployment Architecture

This document describes the correct deployment architecture for the nProcess platform, including the separation between static and server-rendered applications.

## Overview

The nProcess platform consists of three main components with different deployment strategies:

1. **Client Portal** - Static Next.js app (Firebase Hosting)
2. **Admin Dashboard** - Server-rendered Next.js app (Cloud Run)
3. **API Services** - Backend APIs (Cloud Run)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Hosting                          │
│                   (nprocess.ness.com.br)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       │               │               │
       ▼               ▼               ▼
┌─────────────┐ ┌──────────────┐ ┌──────────────┐
│   Static    │ │  Cloud Run   │ │  Cloud Run   │
│   Portal    │ │    Admin     │ │     API      │
│  (client)   │ │  Dashboard   │ │   Services   │
└─────────────┘ └──────────────┘ └──────────────┘
     │                 │                 │
     └─────────────────┼─────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │   Firebase Services  │
            │ • Firestore          │
            │ • Auth               │
            │ • Storage            │
            │ • Cloud Functions    │
            │ • Cloud Messaging    │
            └──────────────────────┘
```

## Component Details

### 1. Client Portal (Static Export)

**Location:** `/client-portal`

**Technology Stack:**
- Next.js 14 with `output: 'export'`
- Firebase Auth (client-side)
- React Query
- Tailwind CSS

**Deployment:**
- **Platform:** Firebase Hosting
- **Build:** `npm run build` (generates `/client-portal/out`)
- **Deploy:** `firebase deploy --only hosting:client-portal`

**Configuration:**
```javascript
// client-portal/next.config.js
{
  output: 'export',  // ✅ Static export enabled
  images: { unoptimized: true }  // Required for static export
}
```

**Features:**
- ✅ Firebase Authentication (client-side)
- ✅ Firebase Cloud Messaging (FCM)
- ✅ Firestore queries (client-side)
- ✅ Static generation for fast loading
- ❌ No API routes
- ❌ No server-side rendering
- ❌ No middleware

**URL:** `https://nprocess.ness.com.br/`

---

### 2. Admin Dashboard (Server-Rendered)

**Location:** `/admin-dashboard`

**Technology Stack:**
- Next.js 14 with **server features**
- NextAuth.js for authentication
- API Routes for auth endpoints
- Middleware for route protection
- React Query

**Deployment:**
- **Platform:** Google Cloud Run
- **Build:** `npm run build` (standard Next.js build)
- **Deploy:** `gcloud run deploy nprocess-admin-dashboard`

**Configuration:**
```javascript
// admin-dashboard/next.config.js
{
  // NO output: 'export' ❌
  // Uses standard Next.js server
}
```

**Features:**
- ✅ NextAuth.js authentication
- ✅ API routes (`/api/auth/*`)
- ✅ Middleware for route protection
- ✅ Server-side rendering (SSR)
- ✅ Server-side API calls
- ❌ Cannot use Firebase Hosting (requires Node.js server)

**URL:** `https://nprocess.ness.com.br/admin/*` (proxied to Cloud Run)

**Cloud Run Service Name:** `nprocess-admin-dashboard`

---

### 3. API Services

**Location:** Various backend services

**Services:**
- **ComplianceEngine API:** `compliance-engine-api`
- **RegulatoryRAG API:** `regulatory-rag-api`
- **Admin Control Plane:** `admin-control-plane`

**Deployment:** Google Cloud Run

**URL:** `https://nprocess.ness.com.br/v1/*` (proxied to Cloud Run)

---

## Firebase Hosting Configuration

**File:** `/firebase.json`

```json
{
  "hosting": [
    {
      "target": "client-portal",
      "public": "client-portal/out",
      "rewrites": [
        {
          "source": "/admin/**",
          "run": {
            "serviceId": "nprocess-admin-dashboard",
            "region": "us-central1"
          }
        },
        {
          "source": "/v1/**",
          "run": {
            "serviceId": "compliance-engine-api",
            "region": "us-central1"
          }
        },
        {
          "source": "**",
          "destination": "/index.html"
        }
      ]
    }
  ]
}
```

**How it works:**
1. **`/admin/*`** → Proxied to Cloud Run service `nprocess-admin-dashboard`
2. **`/v1/*`** → Proxied to Cloud Run service `compliance-engine-api`
3. **`/**`** → Served from static files (`client-portal/out`)

---

## Deployment Workflow

### Client Portal

```bash
# 1. Build static export
cd client-portal
npm run build  # Outputs to ./out

# 2. Deploy to Firebase Hosting
cd ..
firebase deploy --only hosting:client-portal
```

### Admin Dashboard

```bash
# 1. Build Next.js app
cd admin-dashboard
npm run build

# 2. Deploy to Cloud Run
gcloud run deploy nprocess-admin-dashboard \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NEXTAUTH_SECRET=xxx,NEXTAUTH_URL=https://nprocess.ness.com.br/admin" \
  --min-instances 0 \
  --max-instances 10
```

### Firebase Services

```bash
# Deploy Firestore rules, indexes, and Cloud Functions
firebase deploy --only firestore,functions,storage
```

---

## Why This Architecture?

### Client Portal = Static Export ✅

**Reasons:**
- Fast loading times (CDN-served static files)
- Low cost (Firebase Hosting free tier)
- Global distribution
- No server maintenance
- Perfect for public-facing client app

**Trade-offs:**
- No server-side rendering
- Auth must be client-side (Firebase Auth)
- No API routes in the app

### Admin Dashboard = Server-Rendered ✅

**Reasons:**
- Secure authentication with NextAuth.js
- Server-side session management
- API routes for backend logic
- Middleware for route protection
- More control over auth flow

**Trade-offs:**
- Requires Cloud Run (not free)
- Higher latency than static files
- Server maintenance needed

---

## Common Mistakes (What NOT to Do)

### ❌ DON'T: Use `output: 'export'` with NextAuth

```javascript
// admin-dashboard/next.config.js - WRONG ❌
{
  output: 'export',  // ❌ Breaks NextAuth
}
```

**Why:** NextAuth requires API routes and middleware, which are not available in static exports.

### ❌ DON'T: Deploy Admin Dashboard to Firebase Hosting

```json
// firebase.json - WRONG ❌
{
  "hosting": {
    "target": "admin-dashboard",
    "public": "admin-dashboard/out"  // ❌ Won't work
  }
}
```

**Why:** Admin Dashboard needs Next.js server runtime.

### ❌ DON'T: Use Server Components in Client Portal

```javascript
// client-portal - WRONG ❌
export default async function Page() {
  const data = await fetch(...)  // ❌ Not available in static export
}
```

**Why:** Static export doesn't support server components or data fetching.

---

## Authentication Comparison

| Feature | Client Portal | Admin Dashboard |
|---------|--------------|----------------|
| **Auth Library** | Firebase Auth | NextAuth.js |
| **Auth Type** | Client-side | Server-side |
| **Session Storage** | Firebase token | JWT + HTTP-only cookie |
| **Providers** | Email/Password, Google | Email/Password, Google |
| **Route Protection** | Client-side redirect | Server middleware |
| **API Routes** | ❌ None | ✅ `/api/auth/*` |
| **Security** | Good | Better (server-side) |

---

## Environment Variables

### Client Portal

Required variables (must start with `NEXT_PUBLIC_`):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FCM_VAPID_KEY=...
NEXT_PUBLIC_API_URL=https://compliance-engine-5wqihg7s7a-uc.a.run.app
```

### Admin Dashboard

Required variables (server-side, do NOT use `NEXT_PUBLIC_`):

```env
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://nprocess.ness.com.br/admin
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:8008
```

---

## Troubleshooting

### Problem: Admin Dashboard shows "desidratada" (dehydrated) page

**Symptoms:**
- Page loads without styles
- JavaScript doesn't hydrate
- Components don't render

**Cause:**
- Using `output: 'export'` with NextAuth
- NextAuth API routes don't exist in static build
- React hydration mismatch

**Solution:**
1. Remove `output: 'export'` from `admin-dashboard/next.config.js`
2. Deploy to Cloud Run instead of Firebase Hosting
3. Update Firebase rewrites to proxy `/admin/*` to Cloud Run

### Problem: Firebase Auth not working in Client Portal

**Symptoms:**
- "Firebase App not initialized"
- Auth operations fail

**Cause:**
- Missing `NEXT_PUBLIC_` prefix in environment variables
- Variables not defined in `next.config.js`

**Solution:**
1. Ensure all Firebase variables start with `NEXT_PUBLIC_`
2. Add them to `next.config.js` env section
3. Rebuild the app

---

## Future Improvements

1. **Add Firebase App Check** for abuse prevention
2. **Implement rate limiting** in Cloud Functions
3. **Add CDN caching** for API responses
4. **Set up monitoring** with Firebase Performance
5. **Implement A/B testing** with Firebase Remote Config

---

## Related Documentation

- [Firebase Migration Plan](./FIREBASE_MIGRATION_PLAN.md)
- [Migration Status](./MIGRATION_STATUS.md)
- [Firebase Integration Analysis](./FIREBASE_COMPLETE_INTEGRATION.md)

---

**Last Updated:** 2025-12-25
**Version:** 1.0
**Author:** Claude Code Review
