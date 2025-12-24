# ness. Client Portal

Elegant, minimalist client portal for ComplianceEngine SaaS platform.

## Features

- 🎨 **Modern Design** - Glassmorphism UI with ness. branding
- 🌓 **Dark Mode** - Automatic dark mode with gray-900 tones
- ⚡ **Next.js 14** - App Router with React Server Components
- 🎯 **TypeScript** - Full type safety
- 💅 **Tailwind CSS** - Utility-first styling with shadcn/ui
- 🔒 **Self-Service** - API key management, secrets, integrations
- 💬 **Gemini Chat** - AI assistant powered by Gemini
- 💳 **Billing** - Subscription management with 3 tiers
- 📊 **Compliance** - Real-time compliance monitoring

## Brand Identity

**ness.**
- Font: Montserrat Medium
- Logo color: White/Black (adaptive)
- Dot color: `#00ade8`
- Accent color: `#00ade9`
- Glass effect: Backdrop blur with subtle borders

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd client-portal
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) to view the portal.

### Build

```bash
npm run build
npm start
```

## Pages

- `/dashboard` - Overview dashboard with stats
- `/dashboard/api-keys` - Self-service API key management
- `/dashboard/secrets` - Integration secrets configuration
- `/dashboard/integrations` - Google Drive, SharePoint, etc.
- `/dashboard/documents` - Document upload and analysis
- `/dashboard/compliance` - Compliance status monitoring
- `/dashboard/chat` - Chat with Gemini AI assistant
- `/dashboard/billing` - Subscription and billing management
- `/dashboard/team` - Team member management
- `/dashboard/settings` - Account settings

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React (no colors, monochrome)
- **State**: TanStack Query + Zustand
- **Charts**: Recharts
- **Notifications**: Sonner
- **Theme**: next-themes

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8008
```

## Design Principles

1. **Minimalist** - Clean, uncluttered interfaces
2. **Elegant** - Glassmorphism and smooth transitions
3. **Modern** - Latest design patterns and best practices
4. **Accessible** - WCAG compliant
5. **Fast** - Optimized performance

## Future Enhancements

- [ ] Authentication integration (OAuth, JWT)
- [ ] Real API integration with admin-control-plane
- [ ] Stripe payment integration
- [ ] Document upload with drag-and-drop
- [ ] Real-time notifications
- [ ] Multi-language support
- [ ] Mobile app (React Native)
