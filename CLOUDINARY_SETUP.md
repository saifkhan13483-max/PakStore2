# Cloudinary Dual-Account Upload System

## Overview
This project implements a robust image upload system using two Cloudinary accounts with intelligent fallback logic. If Account A reaches quota or rate limits, uploads automatically fall back to Account B.

## Architecture

### Components

1. **Configuration** (`client/src/config/cloudinary.ts`)
   - Exports two Cloudinary account configs (A and B)
   - Reads from environment variables with `VITE_` prefix

2. **Upload Utility** (`client/src/lib/uploadImage.ts`)
   - `uploadImage(file)` - Main upload function with fallback
   - `isCloudinaryQuotaError()` - Detects quota/rate limit errors
   - `getCloudinaryImageUrl()` - Constructs transformation URLs

3. **React Components**
   - `ImageUploader.tsx` - Upload component with progress/preview
   - `ProductImage.tsx` - Display images from either account
   - `ProductCard.tsx` - Example product card using ProductImage

4. **Firestore Integration** (`client/src/lib/firestoreImageService.ts`)
   - Save/retrieve image metadata
   - Support for multiple images per product
   - Works with both Cloudinary accounts

## Environment Variables

Set these in your `.env.local` or Replit secrets:

```
VITE_CLOUDINARY_A_CLOUD_NAME=your-account-a-cloud-name
VITE_CLOUDINARY_A_UPLOAD_PRESET=your-account-a-preset

VITE_CLOUDINARY_B_CLOUD_NAME=your-account-b-cloud-name
VITE_CLOUDINARY_B_UPLOAD_PRESET=your-account-b-preset
```

## Cloudinary Setup Instructions

### For Each Account (A and B):

1. **Log in to Cloudinary Dashboard**
   - Go to https://cloudinary.com/console

2. **Create Upload Preset**
   - Navigate to Settings → Upload
   - Click "Add upload preset"
   - **Settings:**
     - Mode: `Unsigned` (for frontend use)
     - Upload Preset Name: Choose a descriptive name (e.g., `pakcart-a`)
     - ✅ **Important:** Allow unsigned requests
   - Copy the preset name and cloud name from your dashboard

3. **Get Cloud Name**
   - Visible in Cloudinary Dashboard header
   - Format: `your-cloud-name`

### Why Unsigned Upload?
- No API secrets exposed in frontend code
- Safe to use in client-side JavaScript
- Preset controls what can be uploaded
- All security is handled server-side by Cloudinary

## Usage

### Basic Upload
```typescript
import { uploadImage } from '@/lib/uploadImage';

const file = e.target.files[0];
const image = await uploadImage(file);

console.log(image);
// {
//   url: "https://res.cloudinary.com/.../...",
//   publicId: "pakcart/product-123",
//   cloudName: "account-a"
// }
```

### In React Component
```typescript
import { ImageUploader } from '@/components/ImageUploader';

export function ProductImageUpload() {
  return (
    <ImageUploader
      onUploadSuccess={(image) => {
        console.log('Uploaded to:', image.cloudName);
        // Save to Firestore
      }}
      onUploadError={(error) => {
        console.error('Upload failed:', error.message);
      }}
    />
  );
}
```

### Display Image
```typescript
import { ProductImage } from '@/components/ProductImage';

export function ProductView({ productId, imageData }) {
  return (
    <ProductImage
      image={imageData}
      alt="Product image"
      width={500}
      height={500}
      crop="fill"
    />
  );
}
```

### Save to Firestore
```typescript
import { updateProductImage } from '@/lib/firestoreImageService';

await updateProductImage(productId, uploadedImage);
```

## Fallback Logic

### How It Works

1. **Try Account A**
   - Upload to Account A using its preset
   - On success → return immediately

2. **On Error**
   - Check if error is quota/rate/storage limit related
   - If **quota error** → try Account B
   - If **other error** (validation, format, network) → throw immediately

3. **Account B Upload**
   - Upload to Account B using its preset
   - On success → return image with Account B cloud name
   - On failure → throw detailed error

### Error Detection
The system detects quota errors by checking:
- Error message content (contains "quota", "limit", "bandwidth", etc.)
- HTTP status codes: `429` (too many), `402` (payment), `403` (forbidden)
- Cloudinary error codes

### What Gets Stored
```typescript
{
  url: "https://res.cloudinary.com/account-b/.../...",  // Full URL
  publicId: "pakcart/product-456",                        // Public ID
  cloudName: "account-b-cloud"                            // Which account
}
```

The `cloudName` field ensures you always know which account an image is stored with.

## Security Considerations

✅ **What's Safe**
- Environment variables (never in code)
- Upload presets (define restrictions server-side)
- Public URLs (stored in Firestore)
- Public IDs (just identifiers)

❌ **Never Do This**
- Store `api_secret` in environment variables
- Expose secrets in frontend code
- Use signed uploads from frontend

## Troubleshooting

### Upload fails immediately
- Check environment variables are set correctly
- Verify upload preset exists and is "Unsigned"
- Check file size and type are allowed

### Fallback not working
- Ensure Account B env vars are set
- Check Account B upload preset is configured
- Look at browser console logs (prefixed with `[Cloudinary]`)

### Image not displaying
- Verify image URL is correct in Firestore
- Check cloud name matches preset
- Use browser DevTools to check image request

### Rate limiting
- Cloudinary has default rate limits
- Consider upgrading plans if consistently hitting limits
- Implement client-side queuing for bulk uploads

## Monitoring

All operations log to console with `[Cloudinary]` prefix:
```javascript
[Cloudinary] Attempting upload to Account A...
[Cloudinary] Upload successful to Account A
[Cloudinary] Account A quota exceeded, attempting fallback to Account B...
[Cloudinary] Upload successful to Account B (fallback)
```

Monitor these logs in production to:
- Track which account is being used
- Identify quota issues early
- Debug upload failures

## Example: Product with Multiple Images

```typescript
// In Firestore:
{
  id: "prod-kashmiri-shawl",
  name: "Kashmiri Pashmina Shawl",
  price: 5999,
  
  // Primary image
  image: {
    url: "https://res.cloudinary.com/account-a/...",
    publicId: "pakcart/shawl-main",
    cloudName: "account-a"
  },
  
  // Multiple views (from both accounts)
  images: [
    {
      url: "https://res.cloudinary.com/account-a/...",
      publicId: "pakcart/shawl-view1",
      cloudName: "account-a"
    },
    {
      url: "https://res.cloudinary.com/account-b/...",  // Fallback account
      publicId: "pakcart/shawl-view2",
      cloudName: "account-b"
    }
  ]
}
```

## Next Steps

1. Create two Cloudinary accounts and upload presets
2. Set environment variables in `.env.local`
3. Use `ImageUploader` component in your admin/product pages
4. Save results using `updateProductImage` or `addImageToProduct`
5. Display with `ProductImage` component
