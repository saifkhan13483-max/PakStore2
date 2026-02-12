# Firestore Collection Architecture Planning (Part 6.2)

This document outlines the planned Firestore architecture for migrating from the current SQL-based schema.

## Collection Mapping

### 1. `users` (Top-level Collection)
- **Document ID**: `uid` (Firebase Auth UID)
- **Data Model**:
  - `email`: string
  - `displayName`: string
  - `photoURL`: string (optional)
  - `phoneNumber`: string (optional)
  - `address`: string (optional)
  - `city`: string (optional)
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

### 2. `parentCategories` (Top-level Collection)
- **Document ID**: Auto-generated or `slug`
- **Data Model**:
  - `slug`: string (indexed)
  - `name`: string
  - `description`: string (optional)
  - `image`: string (optional)

### 3. `categories` (Top-level Collection)
- **Document ID**: Auto-generated or `slug`
- **Data Model**:
  - `slug`: string (indexed)
  - `name`: string
  - `description`: string (optional)
  - `image`: string (optional)
  - `parentCategoryId`: string (Reference to `parentCategories` document ID)

### 4. `products` (Top-level Collection)
- **Document ID**: Auto-generated or `slug`
- **Data Model**:
  - `slug`: string (indexed)
  - `name`: string
  - `description`: string
  - `longDescription`: string (optional)
  - `price`: number
  - `originalPrice`: number (optional)
  - `images`: string[]
  - `categoryId`: string (Reference to `categories` document ID)
  - `inStock`: boolean
  - `active`: boolean
  - `rating`: number
  - `reviewCount`: number
  - `features`: string[]
  - `specifications`: map (Record<string, any>)
  - `stock`: number
  - `createdAt`: timestamp
  - `updatedAt`: timestamp

### 5. `orders` (Top-level Collection)
- **Document ID**: Auto-generated
- **Data Model**:
  - `userId`: string (Reference to `users` document ID)
  - `total`: number
  - `status`: string (enum: 'pending', 'processing', 'shipped', 'delivered', 'cancelled')
  - `createdAt`: timestamp
  - `shippingAddress`: map
    - `street`: string
    - `area`: string
    - `city`: string
  - **Embedded Subcollection: `items`** (or array for small orders)
    - `productId`: string
    - `quantity`: number
    - `priceAtPurchase`: number (Denormalized)
    - `productName`: string (Denormalized for history)
    - `productImage`: string (Denormalized for history)

## Relationship Handling Strategy

1.  **References**: Use string IDs for relationships between top-level collections (e.g., `productId` in `orders` refers to a document in `products`).
2.  **Denormalization**:
    *   **Orders**: Product details (name, price, image) will be denormalized into the order items to preserve the state at the time of purchase.
    *   **Categories**: `parentCategoryId` is stored as a string ID.
3.  **Subcollections**: `orders/{orderId}/items` can be used if order items grow large, though usually an array within the order document is sufficient for typical e-commerce (limit 1MB per document). Given the existing `CartItem` interface, we'll likely start with an array of objects inside the `Order` document for simplicity unless item counts are expected to be massive.

## Query Optimization

*   Composite indexes will be required for filtering products by category and status.
*   Orders will be queried by `userId` and `createdAt` (descending).
*   Slugs will be used for SEO-friendly URLs and queried via unique indexes.
