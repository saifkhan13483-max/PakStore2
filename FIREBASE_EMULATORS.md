# Firebase Emulator Setup & Usage

This project uses Firebase Emulators for local development and testing. This allows you to test Firestore and Auth features without touching production data or incurring costs.

## Prerequisites

You need to have the Firebase CLI installed globally or use the one installed in the project.
The system dependencies should already include `firebase-tools`.

## Configuration Files

- `firebase.json`: Configures the emulator ports (Auth: 9099, Firestore: 8080).
- `firestore.rules`: Security rules for Firestore.
- `firestore.indexes.json`: Firestore index configuration.

## Available Scripts

In the project root, you can run:

### Start Emulators
```bash
npm run emulators:start
```
This will start the Auth and Firestore emulators along with the Emulator UI (accessible at http://localhost:4000).

### Run Tests with Emulators
```bash
npm run emulators:test
```
This will start the emulators, run your test suite, and then shut down the emulators.

## Connecting to Emulators in Code

To point your application to the emulators, ensure your Firebase initialization code checks for the environment.

Example in `server/config/firebase.ts`:

```typescript
if (process.env.NODE_ENV === 'development') {
  // Firestore emulator
  db.settings({
    host: 'localhost:8080',
    ssl: false
  });
  
  // Auth emulator
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
}
```

*Note: The `firebase-admin` SDK also respects `FIRESTORE_EMULATOR_HOST` and `FIREBASE_AUTH_EMULATOR_HOST` environment variables.*
