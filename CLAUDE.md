# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Primary Commands:**
- `npm run dev` - Start development server (localhost:8080)
- `npm run build` - Production build with optimizations
- `npm run build:dev` - Development mode build
- `npm run lint` - Run ESLint checks
- `npm run preview` - Preview production build locally

**Setup:**
```bash
npm i           # Install dependencies
npm run dev     # Start development server
```

## Project Architecture

**Framework Stack:**
- React 18.3.1 + TypeScript + Vite (SWC compiler)
- Styling: Tailwind CSS + shadcn/ui component library
- Backend: Supabase (PostgreSQL + real-time + auth)
- State: React Context + TanStack Query for server state
- Forms: React Hook Form + Zod validation
- Routing: React Router DOM

**Key Directories:**
```
src/
├── components/ui/        # shadcn/ui components (30+ reusable components)
├── components/schedule/  # Multi-step booking flow components
├── pages/               # Route-level page components
├── context/             # React Context providers (auth, etc.)
├── hooks/               # Custom React hooks
├── integrations/supabase/ # Database client and auto-generated types
├── lib/                 # Utility libraries and configurations
├── types/               # TypeScript type definitions
└── utils/               # Helper functions
```

## Core Features & Business Logic

**Authentication Flow:**
- Supabase Auth with Google OAuth integration
- Profile completion flow for new users
- Automatic data migration from guest to authenticated users

**Service Booking Flow:**
- Multi-step wizard: Service → Address → Time → Confirmation
- Address management with Google Places integration
- Dynamic time slot availability checking
- Cost calculation with discount support

**Performance Strategy:**
- Lazy loading for below-fold components
- Manual chunk splitting (vendor, ui, utils)
- WebP images with responsive breakpoints
- Critical CSS inlined, non-critical deferred

## Database Integration

**Supabase Schema:**
- User system: `profiles`, auth tables
- Address system: `addresses`, `addresses_temp` (for guest users)
- Order system: `orders`, `orders_temp`, `order_dry_cleaning_items`
- Service system: `services`, `time_slots`
- Admin/Driver systems for management and logistics

**Data Patterns:**
- Temporary tables for guest user data (migrated on auth)
- Real-time subscriptions for live updates
- TanStack Query for caching and synchronization
- Auto-generated TypeScript types from database schema

## Development Patterns

**Component Architecture:**
- Use shadcn/ui components from `components/ui/`
- Follow compound component pattern for complex UI
- Implement proper Suspense boundaries with loading states
- Lazy load components that aren't immediately visible

**State Management:**
- Authentication: React Context with Supabase
- Server state: TanStack Query with proper cache keys
- Forms: React Hook Form with Zod schemas
- Local component state: useState/useReducer

**Styling Approach:**
- Tailwind CSS with custom design system
- CSS variables for theming consistency
- Component variants using class-variance-authority
- Responsive design with mobile-first approach

## Build Configuration

**Vite Optimizations:**
- SWC for fast compilation
- Tree shaking enabled
- Terser minification (removes console logs in production)
- CSS code splitting for faster loading
- Asset organization (fonts/, images/ subdirectories)

**Bundle Strategy:**
- Vendor chunk: React core libraries
- UI chunk: Radix UI components
- Utils chunk: Icon and utility libraries
- Automatic asset optimization and hashing

## Key Integrations

**External Services:**
- Supabase: Database, auth, real-time
- CleverTap: User analytics and tracking
- Google Places: Address autocomplete and validation
- Vercel: Deployment with optimized caching headers

**Analytics Implementation:**
- Page tracking with CleverTap SDK
- Custom SEO hook for dynamic meta tags
- Performance monitoring for Core Web Vitals

## Development Notes

**File Aliasing:**
- Use `@/` for src directory imports
- Component imports follow absolute paths from src

**Code Quality:**
- ESLint configured with React and TypeScript rules
- Strict TypeScript configuration
- No formal testing framework currently configured

**Lovable Integration:**
- Project developed using Lovable platform
- Changes via Lovable auto-commit to this repository
- Component tagger plugin for development mode