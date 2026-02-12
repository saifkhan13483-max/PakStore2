# Deployment Checklist & Validation

## Pre-Deployment Checklist
Before deploying to Vercel, ensure the following steps are completed:

1. **Environment Variables**:
   - [ ] All variables in `DEPLOYMENT_ENV_VARS.md` are added to the Vercel project settings.
   - [ ] `VITE_FIREBASE_API_KEY` is present.
   - [ ] `VITE_FIREBASE_PROJECT_ID` is present.
   - [ ] `VITE_FIREBASE_APP_ID` is present.
   - [ ] `VITE_CLOUDINARY_CLOUD_NAME` is present.
   - [ ] `VITE_CLOUDINARY_UPLOAD_PRESET` is present.

2. **Firebase Configuration**:
   - [ ] Firebase Authentication is enabled (Google Auth + Email/Password).
   - [ ] Firestore Database is initialized.
   - [ ] Firestore Security Rules are deployed (see Part 21).

3. **Cloudinary Configuration**:
   - [ ] Unsigned upload preset is created and matches `VITE_CLOUDINARY_UPLOAD_PRESET`.

4. **Build Validation**:
   - [ ] Run `npm run build` locally to ensure no compilation errors.
   - [ ] Verify `dist/` contains `index.html` and static assets.

## Automated Validation (Post-Deployment)
After deployment, verify the following:

1. **Routing**:
   - [ ] Access `/` (Home).
   - [ ] Access `/products` (Listing).
   - [ ] Refresh a deep link (e.g., `/products/123`) to ensure `vercel.json` rewrites are working.

2. **Authentication**:
   - [ ] Sign up as a new user.
   - [ ] Login as an existing user.
   - [ ] Verify "Profile" page loads with user data.

3. **Data Fetching**:
   - [ ] Verify products load from Firestore on the Home/Products page.
   - [ ] Check console for any Firebase initialization errors.

4. **Media**:
   - [ ] Upload a test image to verify Cloudinary integration.
   - [ ] Verify image displays correctly in the UI.

## Troubleshooting
- **404 on Refresh**: Check `vercel.json` for proper `rewrites` configuration.
- **Firebase Permission Denied**: Check Firestore Security Rules.
- **VITE_... is undefined**: Ensure environment variables were added *before* the latest build in Vercel.
