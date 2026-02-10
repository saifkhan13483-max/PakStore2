# Cloudinary Production Deployment Checklist

This document outlines the critical steps to ensure the Cloudinary integration is secure, optimized, and ready for production deployment.

## 1. Cloudinary Console Configuration (Security)
- [ ] **Unsigned Upload Preset**: Ensure the production upload preset is "Unsigned".
- [ ] **Restrict File Types**: Explicitly set allowed formats (e.g., `jpg, png, webp, mp4, pdf`) in the preset settings.
- [ ] **Size Limits**: Set maximum file sizes (e.g., 5MB for images, 50MB for videos).
- [ ] **Folder Organization**: Use dynamic folder naming (e.g., `prod/users/${user_id}`) to keep assets organized.
- [ ] **Security Filters**: Enable "Resource type" restrictions to prevent users from uploading executable scripts.
- [ ] **Auto-Optimization**: Ensure "Incoming Transformations" are set to `f_auto` and `q_auto` for storage efficiency.

## 2. Environment Variables (Replit Secrets)
- [ ] `VITE_CLOUDINARY_CLOUD_NAME`: Must be set to your production Cloudinary cloud name.
- [ ] `VITE_CLOUDINARY_UPLOAD_PRESET`: Must be set to your production-specific unsigned preset.
- [ ] **Verify Visibility**: Ensure these are prefixed with `VITE_` to be accessible in the React frontend.

## 3. Quota & Rate Limiting
- [ ] **Cloudinary Plan**: Verify your plan (Free/Plus/Pro) handles the expected monthly bandwidth and transformations.
- [ ] **Firestore Quotas**: Ensure the `media` collection has proper Firestore Security Rules to prevent unauthorized metadata writes.
- [ ] **Client-Side Limits**: Verify `rateLimitService.js` values (current: 15/hr, 50/day) align with your business needs.

## 4. Error Monitoring & Reliability
- [ ] **Fallback UI**: Test how the app behaves when the Cloudinary API returns a 4xx or 5xx error.
- [ ] **Firestore Sync**: Ensure `completeMediaService.js` handles cases where upload succeeds but metadata saving fails (Partial Success state).
- [ ] **Responsive Breakpoints**: Verify `imageTransformService.js` generates URLs that match your CSS media queries.

## 5. Pre-Launch Final Check
- [ ] Run `npm run test` (if applicable) or verify `tests/mediaUpload.test.js` logic passes.
- [ ] Perform a manual upload of an image and a video to verify end-to-end flow in the production-like environment.
- [ ] Check Cloudinary "Usage" dashboard to ensure no unexpected spikes.
