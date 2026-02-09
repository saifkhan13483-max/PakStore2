import { auth, firebaseInitialized } from "../config/firebase";
import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to verify Firebase ID tokens
 * Extracts Bearer token from Authorization header and verifies it using Firebase Admin SDK
 */
export async function verifyFirebaseToken(req: Request, res: Response, next: NextFunction) {
  if (!firebaseInitialized) {
    return res.status(503).json({ message: "Authentication service not initialized" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Missing or invalid token format" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    // Attach decoded user info to req.user (extend Request type as needed)
    (req as any).user = decodedToken;
    next();
  } catch (error: any) {
    console.error("Firebase Auth Error:", error);
    
    let message = "Unauthorized";
    if (error.code === "auth/id-token-expired") {
      message = "Token expired";
    } else if (error.code === "auth/argument-error") {
      message = "Invalid token";
    }

    res.status(401).json({ message });
  }
}
