# Pakstore - Serverless E-commerce

## Overview
A modern e-commerce application built with React, Vite, and Firebase (Firestore & Authentication). The project has been migrated from a traditional Express/Postgres stack to a fully serverless architecture.

## Recent Changes
- **2026-02-10**: Removed Express.js backend (`server/` folder).
- **2026-02-10**: Migrated data persistence to Firebase Firestore.
- **2026-02-10**: Updated build process to be frontend-only (Vite).
- **2026-02-10**: Cleaned up legacy dependencies (Express, Drizzle, PG).

## Technical Stack
- **Frontend Framework**: React with Vite
- **Styling**: Tailwind CSS + Shadcn/UI components
- **Authentication**: Firebase Authentication v9+
- **Database**: Firestore (NoSQL)
- **Media Storage**: Cloudinary
- **Deployment**: Vercel

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI.
- **Database**: Firebase Firestore.
- **Authentication**: Firebase Auth (Source of Truth for User State).
- **File Storage**: Cloudinary.
- **Deployment**: Static hosting.

## State Management Patterns
- **Server State (TanStack Query)**: Used for all Firestore data fetching, caching, and invalidation (Products, Categories, Orders).
- **Global UI State (Zustand)**:
  - `authStore`: Manages temporary UI auth state (loading, errors) and client-side derived state (isAdmin). Synchronized via `onAuthStateChanged`.
  - `cartStore`: Manages local cart items with persistence to Firestore for authenticated users.
- **Local State (React useState/useContext)**: Used for component-specific UI logic and small context providers.

## User Preferences
- Clean, modern UI using Shadcn components.
- Serverless architecture for scalability and low maintenance.

## Cost Optimization & Resource Management
- **Firestore**:
  - Implemented offline persistence to reduce unnecessary read operations.
  - Used paginated queries (`getCollectionPaginated`) for all list views to minimize document reads.
  - Leveraging TanStack Query's `staleTime` and `gcTime` for efficient client-side caching.
- **Cloudinary**:
  - Utilizing `f_auto` and `q_auto` for optimized asset delivery.
  - Implemented responsive `srcSet` generation to serve appropriately sized images.
  - Added `dpr_auto` support for high-density displays without over-serving pixels.
- **Vercel**:
  - Optimized build process and static asset caching.
  - Using serverless infrastructure to pay only for actual usage.
