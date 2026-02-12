# Pakstore - Technical Documentation

## Overview
Pakstore has been migrated from a traditional Express/Postgres architecture to a modern, fully serverless architecture powered by Firebase (Firestore & Auth) and Cloudinary. This document outlines the architecture, setup, and maintenance procedures.

## Architecture
- **Frontend**: React (Vite) + Tailwind CSS + Shadcn UI
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **Asset Management**: Cloudinary (Direct Browser Uploads)
- **State Management**: TanStack Query (Server State) + Zustand (UI State)
- **Routing**: Wouter

## Implementation Details

### Firestore Service Layer (`src/lib/firestore.ts`)
- Generic CRUD operations with Zod schema validation.
- Offline persistence enabled for improved performance and data integrity.
- Pagination support via `getCollectionPaginated`.

### Authentication (`src/hooks/use-auth.ts`)
- Integrated with Firebase Auth.
- Synchronized with `authStore` in Zustand.
- Protected routes implemented via navigation guards.

### Cloudinary Integration (`src/lib/cloudinary.ts`)
- Direct-to-Cloudinary uploads using unsigned presets.
- Automatic image optimization (format, quality, and DPR).
- Responsive `srcSet` generation.

## Setup Instructions
1.  **Clone and Install**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env` file based on `.env.example` with:
    - `VITE_FIREBASE_API_KEY`
    - `VITE_FIREBASE_AUTH_DOMAIN`
    - `VITE_FIREBASE_PROJECT_ID`
    - `VITE_CLOUDINARY_CLOUD_NAME`
    - `VITE_CLOUDINARY_UPLOAD_PRESET`

3.  **Local Development**:
    ```bash
    npm run dev
    ```

## Maintenance Guide
### Adding a New Collection
1. Define the Zod schema in `shared/schema.ts`.
2. Use `src/lib/firestore.ts` methods to interact with the new collection.
3. Update Firestore Security Rules if needed.

### Cost Management
- Monitor Firestore read/write counts in the Firebase Console.
- Ensure all list views use pagination.
- Verify Cloudinary transformations are using `f_auto` and `q_auto`.

## Deployment
The project is optimized for deployment on Vercel or any static hosting provider.
1. Build the project: `npm run build`
2. Deploy the `dist` directory.
3. Configure environment variables in the hosting provider's dashboard.
