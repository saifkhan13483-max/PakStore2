# NoorBazaar - Authentic Pakistani Artisanal E-Commerce

NoorBazaar is a premium Pakistani artisanal e-commerce platform built as a full-stack application. It showcases curated products like Kashmiri Pashminas, Multani Khussas, and premium local artisanal goods.

## 🚀 Technology Stack

- **Frontend**: React 18 (TypeScript), wouter (Routing), Tailwind CSS, shadcn/ui (Radix UI)
- **State Management**: Zustand (Cart & UI State)
- **Backend/API**: Express 5 (Node.js), Zod (Validation)
- **Database**: PostgreSQL (Neon/Replit DB), Drizzle ORM
- **Auth & Persistence**: Firebase Auth (Google Sign-In), Cloud Firestore (Cart Sync)
- **Build Tool**: Vite (optimized for performance)

## 🛠️ Setup Instructions

1.  **Clone & Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file (or set secrets in Replit) with:
    - `DATABASE_URL`: PostgreSQL connection string
    - `VITE_FIREBASE_API_KEY`
    - `VITE_FIREBASE_AUTH_DOMAIN`
    - `VITE_FIREBASE_PROJECT_ID`
    - `VITE_FIREBASE_STORAGE_BUCKET`
    - `VITE_FIREBASE_MESSAGING_SENDER_ID`
    - `VITE_FIREBASE_APP_ID`

3.  **Database Setup**:
    Sync the schema to your PostgreSQL database:
    ```bash
    npm run db:push
    ```

4.  **Development**:
    Start the dev server (Vite + Express):
    ```bash
    npm run dev
    ```

5.  **Production Build**:
    ```bash
    npm run build
    npm start
    ```

## 🏗️ Project Structure

- `client/`: React frontend source code
- `server/`: Express backend and database configuration
- `shared/`: Shared TypeScript types and Zod schemas
- `attached_assets/`: Static image assets for products

## 📜 License

MIT
