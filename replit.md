# Pakstore - Serverless E-commerce

## Overview
A modern e-commerce application built with React, Vite, and Firebase (Firestore & Authentication). The project has been migrated from a traditional Express/Postgres stack to a fully serverless architecture.

## Recent Changes
- **2026-02-10**: Removed Express.js backend (`server/` folder).
- **2026-02-10**: Migrated data persistence to Firebase Firestore.
- **2026-02-10**: Updated build process to be frontend-only (Vite).
- **2026-02-10**: Cleaned up legacy dependencies (Express, Drizzle, PG).

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI.
- **Database**: Firebase Firestore.
- **Authentication**: Firebase Auth.
- **File Storage**: Firebase Storage / Cloudinary.
- **Deployment**: Static hosting (Vite build).

## User Preferences
- Clean, modern UI using Shadcn components.
- Serverless architecture for scalability and low maintenance.
