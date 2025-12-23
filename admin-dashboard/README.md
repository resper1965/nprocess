# Compliance Admin Dashboard

Production-ready admin dashboard for managing ComplianceEngine and RegulatoryRAG APIs.

## Features

- 🔐 **Secure Authentication** - NextAuth.js with JWT
- 🔑 **API Key Management** - Generate, rotate, and revoke API keys
- 💰 **FinOps Dashboard** - Real-time cost tracking and analytics
- 📊 **Service Monitoring** - Health, metrics, and SLA tracking
- 👥 **Consumer Management** - Track and manage API consumers
- 🎨 **Elegant UI** - Tailwind CSS + shadcn/ui with dark mode (gray-950)
- 🔒 **Secure Storage** - Encrypted API keys using AES-256

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Authentication**: NextAuth.js
- **State Management**: TanStack Query
- **API Client**: Axios
- **Encryption**: crypto-js (AES-256-GCM)

## Project Structure

```
admin-dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx          # Main dashboard layout
│   │   │   ├── page.tsx             # Overview page
│   │   │   ├── services/            # Service management
│   │   │   ├── consumers/           # Consumer management
│   │   │   ├── api-keys/            # API key management
│   │   │   ├── finops/              # FinOps dashboard
│   │   │   └── settings/            # Settings
│   │   ├── api/
│   │   │   ├── auth/                # Auth endpoints
│   │   │   ├── api-keys/            # API key generation
│   │   │   └── consumers/           # Consumer CRUD
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── dashboard/               # Dashboard-specific components
│   │   ├── charts/                  # Chart components
│   │   └── forms/                   # Form components
│   └── lib/
│       ├── api-client.ts            # API client
│       ├── auth.ts                  # Auth utilities
│       ├── encryption.ts            # Encryption utilities
│       └── utils.ts                 # Utility functions
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Installation

```bash
cd admin-dashboard
npm install
```

## Environment Variables

Create `.env.local`:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=https://compliance-engine-xxx.run.app

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# API Key Encryption
API_KEY_ENCRYPTION_SECRET=your-encryption-secret-32-chars-min

# Database (for storing users and API keys)
DATABASE_URL=postgresql://user:pass@localhost:5432/compliance

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Key Security

API keys are secured using:

1. **Generation**: Cryptographically secure random tokens (32 bytes)
2. **Storage**: Hashed using bcrypt (salt rounds: 12)
3. **Transmission**: Encrypted using AES-256-GCM
4. **Display**: Shown only once during generation
5. **Rotation**: Automatic rotation policy (optional)

### API Key Format

```
ce_live_1234567890abcdef1234567890abcdef
│   │    │
│   │    └─ Random token (32 chars hex)
│   └────── Environment (live/test)
└────────── Prefix (ce = ComplianceEngine)
```

## Authentication Flow

1. User logs in with credentials
2. NextAuth.js validates and creates session
3. JWT token stored in httpOnly cookie
4. Protected routes verify token
5. API calls include bearer token

## Usage

### Login

Navigate to `/login` and authenticate.

### Generate API Key

1. Go to `/api-keys`
2. Click "Generate New Key"
3. Select consumer app
4. Set quotas and permissions
5. Copy key (shown only once!)

### Monitor Services

Visit `/services` to view:
- Service health status
- Uptime metrics
- Error rates
- Latency (P50, P95, P99)

### Track Costs

Visit `/finops` to see:
- Real-time cost tracking
- Cost per API call
- Cost by consumer
- Budget alerts

## Deployment

### Build

```bash
npm run build
```

### Deploy to Cloud Run

```bash
# Build Docker image
docker build -t gcr.io/nprocess/admin-dashboard .

# Push
docker push gcr.io/nprocess/admin-dashboard

# Deploy
gcloud run deploy admin-dashboard \
  --image gcr.io/nprocess/admin-dashboard \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXTAUTH_URL=https://admin.yourcompany.com
```

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **CORS**: Configure allowed origins
3. **Rate Limiting**: Implement on API Gateway
4. **Session Expiry**: Configure appropriate timeouts
5. **Key Rotation**: Rotate encryption keys periodically
6. **Audit Logs**: Log all sensitive operations

## License

Proprietary - Internal use only
