# Environment Variable Management

## Required Environment Variables for Vercel

The following environment variables must be configured in the Vercel Dashboard for both **Preview** and **Production** environments.

### Firebase Configuration
These variables are required for the client-side Firebase SDK integration.

- `VITE_FIREBASE_API_KEY`: Your Firebase project API Key.
- `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase project Auth Domain (e.g., `project-id.firebaseapp.com`).
- `VITE_FIREBASE_PROJECT_ID`: Your Firebase Project ID.
- `VITE_FIREBASE_STORAGE_BUCKET`: Your Firebase Storage Bucket (e.g., `project-id.appspot.com`).
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: Your Firebase Messaging Sender ID.
- `VITE_FIREBASE_APP_ID`: Your Firebase App ID.

### Cloudinary Configuration
These variables are required for direct client-side image uploads.

- `VITE_CLOUDINARY_CLOUD_NAME`: Your Cloudinary Cloud Name.
- `VITE_CLOUDINARY_UPLOAD_PRESET`: Your Cloudinary Unsigned Upload Preset.

## Security Considerations
- All variables are prefixed with `VITE_`, making them accessible to the client-side code at build time.
- **Do not** include any sensitive administrative keys (like Firebase Admin SDK private keys) in these variables.
- Firebase Client SDK keys are generally safe for client-side use as they are restricted by Firebase Security Rules (refer to Part 21 for security rules implementation).
- Cloudinary upload presets should be configured as "unsigned" for client-side use.

## Environment Scoping
- **Production**: Use your production Firebase project and Cloudinary account.
- **Preview**: You can use a separate "Staging" Firebase project or the same production project if development/production data separation isn't strictly required at this stage.

## How to Configure in Vercel
1. Go to your Project Settings in Vercel.
2. Navigate to the **Environment Variables** tab.
3. Add each key-value pair.
4. Select the environments (Production, Preview, Development) where each variable should be active.
5. Redeploy your project for the changes to take effect.
