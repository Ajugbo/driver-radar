import jwt, { type JwtPayload } from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

export interface AuthDriver {
  id: number;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      driver?: AuthDriver;
    }
  }
}

function getJwtSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be configured for JWT authentication.");
  }
  return secret;
}

export function createAccessToken(driver: AuthDriver) {
  return jwt.sign({ email: driver.email }, getJwtSecret(), {
    subject: String(driver.id),
    expiresIn: "30d",
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
    const id = Number(payload.sub);
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!Number.isInteger(id) || !email) {
      res.status(401).json({ message: "Invalid authentication token." });
      return;
    }
    req.driver = { id, email };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired authentication token." });
  }
}