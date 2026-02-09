# Cloudinary Configuration for PakCart

This project uses Cloudinary for product image management and uploads.

## Setup Instructions

1. **Create an Account**: Sign up at [Cloudinary](https://cloudinary.com/).
2. **Unsigned Upload Preset**:
   - Go to **Settings** -> **Upload**.
   - Scroll to **Upload presets**.
   - Click **Add upload preset**.
   - Set **Upload method** to `Unsigned`.
   - Set **Folder** to `pakcart/products` (optional but recommended).
   - Save the preset and note down the name.
3. **Environment Variables**:
   Add the following secrets to your Replit environment or Vercel deployment:

   | Variable | Description | Example |
   |----------|-------------|---------|
   | `VITE_CLOUDINARY_CLOUD_NAME` | Your Cloudinary Cloud Name | `dftvtsjcg` |
   | `VITE_CLOUDINARY_UPLOAD_PRESET` | The unsigned preset name | `pakcart` |

## Frontend Usage

Images can be uploaded directly from the client using the Cloudinary Upload API:

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
formData.append('folder', 'pakcart/products');

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
  { method: 'POST', body: formData }
);
const data = await response.json();
console.log(data.secure_url);
```
