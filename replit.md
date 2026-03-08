# PakCart - E-commerce Platform

## Project Overview
A full-stack React + Firebase e-commerce platform for Pakistani products. Built with Vite, shadcn/ui, and Firebase backend.

## Architecture

### Frontend
- **Framework**: React with Vite
- **UI**: shadcn/ui components with Tailwind CSS
- **State Management**: Zustand (for auth and cart)
- **Data Fetching**: TanStack React Query with Firebase
- **Routing**: Wouter

### Backend
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Image Storage**: Cloudinary CDN

### Key Directories
- `client/src/pages/` - Main pages (Home, Products, ProductDetail)
- `client/src/components/` - Reusable React components
- `client/src/services/` - Firebase service layer
- `client/src/lib/` - Utilities (Firebase config, seed scripts)
- `client/src/store/` - Global state (auth, cart)

## Features

### Comments System
- Comments displayed in `CommentSection.tsx` component
- Avatar display logic:
  - If `userPhoto` is provided: displays image with fallback to first letter
  - If `userPhoto` is empty: displays colored circular avatar with first letter
- Seed comments use color-coded initials (no external images)
- Colors are consistent per user based on hash of their name

#### Avatar Colors Utility
- **File**: `client/src/lib/avatar-colors.ts`
- **Function**: `getAvatarColor(name: string)` generates RGB colors
- **Color Palette**: 8 distinct colors (purple, red, blue, green, amber, violet, pink, emerald)
- **Logic**: Consistent hashing based on name ensures same user always gets same color

#### Seed Comments
- **File**: `client/src/lib/seed-comments.ts`
- Generates 2-3 random comments per product
- Comments have `userPhoto: ""` (empty string)
- Uses realistic names from South Asian cultures
- Auto-updates product rating and review count

### Product Management
- Products have: name, description, price, category, images, rating, review count
- Categories organized in sidebar navigation
- Product detail page shows full info with comments section

### Authentication
- Firebase Auth integration
- Admin features (seed data button on home page for logged-in admins)

### Shopping Cart
- Stored in local Zustand state
- Add/remove items functionality

## Development

### Running the App
```bash
npm run dev
```
Starts both Express backend and Vite frontend on port 3000

### Adding Features
1. Define data models in `shared/schema.ts` using Zod
2. Create Firestore service in `client/src/services/`
3. Add components in `client/src/components/`
4. Add pages in `client/src/pages/` and register in `App.tsx`

## Important Notes
- Do NOT modify `package.json` - use package manager for dependencies
- Do NOT modify `vite.config.ts` or `server/vite.ts` - they're already configured
- Use `@` aliases for imports (configured in Vite)
- Use `@assets/` for imported assets

## Recent Changes (2026-03-08)
- **Implemented colored avatar system for comments**
  - Seed comments now display initials with vibrant background colors
  - Created `avatar-colors.ts` utility for consistent color generation (8 distinct colors)
  - Updated `CommentSection.tsx` to support both image and text-based avatars

- **Fixed seed comments functionality**
  - Changed from dynamic import to static import in `Home.tsx` to prevent module loading errors
  - Made seed function idempotent: checks if comments already exist and deletes old ones before reseeding
  - Seed comments marked with `userId: "system-seed"` for identification and safe deletion
  - Supports multiple re-runs without duplicate document errors
