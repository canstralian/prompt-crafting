# CLAUDE.md - AI Assistant Guide for Builder Prompt Engine

This document provides comprehensive guidance for AI assistants working with the Builder Prompt Engine codebase.

## Project Overview

**Builder Prompt Engine** is a full-stack SaaS web application for managing, building, and testing AI prompts. It provides a collaborative platform for prompt engineering with role-based access control, version management, and educational content.

**Platform**: Built with the Lovable AI code generation platform
**Type**: Modern React SPA with TypeScript, backed by Supabase

## Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.8** - Type-safe JavaScript
- **Vite 5.4** - Build tool and dev server (port 8080)
- **React Router DOM 6.30** - Client-side routing

### UI & Styling
- **shadcn-ui** - Component library (50+ components in `src/components/ui/`)
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### State & Data
- **TanStack React Query 5.83** - Server state management & caching
- **React Hook Form 7.61** - Form state management
- **Zod 3.25** - Schema validation

### Backend
- **Supabase** - PostgreSQL database + Authentication + Real-time

## Directory Structure

```
src/
├── components/
│   ├── ui/           # shadcn-ui components (DO NOT manually edit)
│   ├── auth/         # ProtectedRoute, AdminRoute, AuthForm
│   └── layout/       # AppLayout, PublicLayout, Header, Footer
├── pages/
│   ├── app/          # Protected pages (dashboard, library, builder, etc.)
│   └── *.tsx         # Public pages (landing, pricing, learn, auth)
├── hooks/            # Custom React hooks
│   ├── useAuth.tsx   # Authentication context & hooks
│   ├── useAdminRole.ts # RBAC admin check
│   └── useLearnPosts.ts # Learning content queries
├── integrations/
│   └── supabase/     # Supabase client & generated types
├── lib/
│   └── utils.ts      # Utility functions (cn for classNames)
├── App.tsx           # Main app with routing
├── main.tsx          # React entry point
└── index.css         # Global styles & Tailwind directives

supabase/
└── migrations/       # SQL migration files
```

## Development Commands

```bash
npm i              # Install dependencies
npm run dev        # Start dev server (localhost:8080)
npm run build      # Production build
npm run lint       # Run ESLint
npm run test       # Run tests once
npm run test:watch # Run tests in watch mode
npm run preview    # Preview production build
```

## Code Conventions

### Import Paths
Always use the `@/` path alias for imports:
```typescript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
```

### Component Patterns

**Functional components with arrow functions:**
```typescript
const MyComponent = ({ prop }: { prop: string }) => {
  return <div>{prop}</div>;
};
```

**UI components from shadcn-ui:**
```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
```

### Styling
- Use Tailwind CSS utility classes
- Use `cn()` utility for conditional classNames:
```typescript
import { cn } from "@/lib/utils";
className={cn("base-class", condition && "conditional-class")}
```
- CSS variables define theme colors (HSL format in `index.css`)
- Dark mode supported via CSS class strategy

### TypeScript
The project uses lenient TypeScript settings:
- `noImplicitAny: false`
- `strictNullChecks: false`
- `noUnusedLocals: false`
- `noUnusedParameters: false`

### Data Fetching
Use TanStack React Query for server state:
```typescript
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error } = useQuery({
  queryKey: ['uniqueKey'],
  queryFn: async () => {
    const { data } = await supabase.from('table').select('*');
    return data;
  },
});
```

### Form Handling
Use React Hook Form with Zod validation:
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({ field: z.string().min(1) });
const form = useForm({ resolver: zodResolver(schema) });
```

## Architecture Patterns

### Authentication Flow
```
AuthProvider (src/hooks/useAuth.tsx)
    ↓
ProtectedRoute (checks user session)
    ↓
AdminRoute (checks admin role)
```

- `useAuth()` hook provides: `user`, `session`, `loading`, `signUp`, `signIn`, `signOut`
- Session persisted via Supabase's built-in localStorage handling

### Route Structure
```
/ (PublicLayout)
├── /               # LandingPage
├── /pricing        # PricingPage
├── /learn          # LearnPage
├── /learn/:slug    # LearnPostPage
└── /library        # PublicLibraryPage

/auth               # AuthPage (standalone)

/app (ProtectedRoute + AppLayout)
├── /dashboard      # DashboardPage
├── /library        # PromptLibraryPage
├── /prompts/new    # PromptBuilderPage
├── /prompts/:id    # PromptLibraryPage (detail view)
├── /tests          # TestRunsPage
├── /workspace      # WorkspacePage
├── /billing        # BillingPage
└── /admin          # AdminPage (AdminRoute)
```

### Role-Based Access Control (RBAC)
- Roles: `admin`, `moderator`, `user`
- Check role: `useAdminRole()` hook queries `user_roles` table
- Database RLS policies enforce access at Supabase level

## Database Schema

### Key Tables
- **profiles** - User profile info (linked to auth.users)
- **learn_categories** - Educational content categories
- **learn_posts** - Learning articles with markdown content
- **user_roles** - RBAC role assignments

### Security
- Row Level Security (RLS) enabled on all tables
- Policies restrict data based on `auth.uid()`
- Admin-only write access to content tables

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/App.tsx` | Main app component with all routes |
| `src/hooks/useAuth.tsx` | Authentication context provider |
| `src/hooks/useAdminRole.ts` | Admin role checking hook |
| `src/integrations/supabase/client.ts` | Supabase client initialization |
| `src/integrations/supabase/types.ts` | Generated database types |
| `src/lib/utils.ts` | Utility functions (`cn` for classNames) |
| `tailwind.config.ts` | Tailwind theme configuration |
| `vite.config.ts` | Vite build configuration |

## Important Notes for AI Assistants

### DO
- Use path aliases (`@/`) for all imports
- Follow existing component patterns
- Use shadcn-ui components from `@/components/ui/`
- Use TanStack React Query for data fetching
- Use Tailwind CSS for styling
- Run `npm run lint` to check code quality
- Run `npm run test` to verify changes

### DON'T
- Manually edit files in `src/components/ui/` (shadcn-ui managed)
- Create new components when shadcn-ui has one available
- Use inline styles - use Tailwind classes instead
- Skip the `@/` import alias
- Modify Supabase types manually (they are generated)

### Adding New Features
1. Check if shadcn-ui has a relevant component
2. Create page components in `src/pages/`
3. Add routes in `src/App.tsx`
4. Use `useQuery` for data fetching
5. Apply existing styling patterns (Tailwind + cn utility)

### Database Changes
- Add migrations to `supabase/migrations/`
- Update RLS policies as needed
- Regenerate types after schema changes

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

## Testing

- Framework: Vitest with jsdom environment
- Test utilities: @testing-library/react
- Run tests: `npm run test`
- Watch mode: `npm run test:watch`

## Deployment

This project is designed for deployment via the Lovable platform:
1. Open the Lovable project dashboard
2. Click Share -> Publish
3. Custom domains can be configured in Project > Settings > Domains
