# PakCart - Pakistani E-Commerce Platform

## Overview

PakCart is a Pakistani artisanal e-commerce platform built as a full-stack application. It showcases curated products like Kashmiri Pashminas, Multani Khussas, and premium food items. The app features a React frontend with a luxury emerald & gold design theme, an Express backend serving product APIs, and a PostgreSQL database managed via Drizzle ORM. Prices are displayed in PKR (Pakistani Rupees). The cart uses client-side Zustand state management with localStorage persistence, while product data is served from the database with a mock data fallback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (`client/`)
- **Framework**: React 18 with TypeScript, rendered client-side (SPA)
- **Routing**: `wouter` — a lightweight router. Routes are defined in `client/src/App.tsx`
- **Styling**: Tailwind CSS with CSS variables for theming. Custom emerald & gold color palette defined in `client/src/index.css`. Fonts: Playfair Display (display) and Outfit (body)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives, stored in `client/src/components/ui/`
- **State Management**: Zustand with `persist` middleware (localStorage) for the shopping cart (`client/src/store/cartStore.ts`)
- **Data Fetching**: TanStack React Query. Custom hooks in `client/src/hooks/use-products.ts` fetch from the API with automatic fallback to mock data in `client/src/data/products.ts`
- **Animations**: Framer Motion for page transitions and UI animations
- **Build Tool**: Vite with React plugin, HMR in dev, outputs to `dist/public`

### Backend (`server/`)
- **Framework**: Express 5 on Node.js with TypeScript (run via `tsx`)
- **API Pattern**: RESTful routes defined in `server/routes.ts`, prefixed with `/api/`. Route contracts are defined in `shared/routes.ts` with Zod schemas
- **Storage Layer**: `server/storage.ts` implements an `IStorage` interface using `DatabaseStorage` class backed by Drizzle ORM queries
- **Dev Server**: Vite dev server is integrated as Express middleware (`server/vite.ts`) for HMR during development
- **Production**: Built with esbuild for the server and Vite for the client. Server outputs to `dist/index.cjs`, client to `dist/public/`

### Shared (`shared/`)
- **Schema**: `shared/schema.ts` — Drizzle ORM table definitions for `products` and `cart_items`. Uses `drizzle-zod` for insert schema generation
- **Routes**: `shared/routes.ts` — API route contracts with paths, methods, and Zod response schemas. Used by both frontend hooks and backend route handlers
- **Types**: `Product`, `InsertProduct`, `CartItem`, `InsertCartItem` are exported from schema for use across the stack

### Database
- **Engine**: PostgreSQL (required — `DATABASE_URL` environment variable must be set)
- **ORM**: Drizzle ORM with `drizzle-kit` for migrations
- **Schema Push**: Run `npm run db:push` to sync schema to database
- **Connection**: `node-postgres` Pool in `server/db.ts`
- **Tables**:
  - `products` — id, name, slug (unique), description, longDescription, price, originalPrice, images (text array), category, inStock, features (text array), specifications (jsonb)
  - `cart_items` — id, productId, quantity, userId, sessionId

### Key Design Decisions
- **Mock Data Fallback**: The frontend hooks try the API first, then fall back to local mock data. This ensures the UI works even if the database isn't seeded yet
- **Client-side Cart**: Cart state lives in Zustand with localStorage persistence rather than in the database, keeping things simple for guest users
- **Shared Contracts**: Route definitions and schemas are shared between frontend and backend via the `shared/` directory, ensuring type safety across the stack
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`, configured in both `tsconfig.json` and `vite.config.ts`

## External Dependencies

### Firebase (Authentication & Cart Sync)
- **Firebase Auth** — Google Sign-In via popup for user authentication (`client/src/store/authStore.ts`)
- **Cloud Firestore** — Syncs cart data for authenticated users (`client/src/store/cartStore.ts`)
- **Required Environment Variables** (set as secrets with `VITE_` prefix):
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

### Database
- **PostgreSQL** — Primary data store, connected via `DATABASE_URL` environment variable
- **Drizzle ORM** — Query builder and schema management
- **connect-pg-simple** — Listed as dependency (for potential session storage)

### Frontend Libraries
- **shadcn/ui + Radix UI** — Full component library (accordion, dialog, sheet, select, tabs, toast, tooltip, etc.)
- **TanStack React Query** — Server state management and caching
- **Zustand** — Client-side state management (cart)
- **Framer Motion** — Animations
- **Lucide React** — Icon library
- **embla-carousel-react** — Carousel component
- **react-day-picker** — Calendar/date picker
- **react-hook-form + @hookform/resolvers** — Form handling
- **date-fns** — Date utilities
- **Zod** — Runtime validation for API responses and schemas

### Build Tools
- **Vite** — Frontend bundler with HMR
- **esbuild** — Server bundler for production
- **tsx** — TypeScript execution for development
- **Tailwind CSS + PostCSS + Autoprefixer** — Styling pipeline

### Replit-specific
- **@replit/vite-plugin-runtime-error-modal** — Error overlay in development
- **@replit/vite-plugin-cartographer** — Dev tooling (dev only)
- **@replit/vite-plugin-dev-banner** — Dev banner (dev only)