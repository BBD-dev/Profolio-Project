import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { User, IUser } from "../models/User";

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  sub: string;
  role?: string;
  status?: string;
}

export function signToken(user: IUser): string {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, status: user.status },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] },
  );
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Not authenticated" });
  }

  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as JwtPayload;
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ detail: "Could not validate credentials" });
    if (user.status !== "approved") {
      return res.status(403).json({ detail: "Account not approved" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ detail: "Could not validate credentials" });
  }
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ detail: "Admin only" });
    }
    next();
  });
}

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next();

  try {
    const payload = jwt.verify(header.slice(7), env.jwtSecret) as JwtPayload;
    const user = await User.findById(payload.sub);
    if (user?.status === "approved") req.user = user;
  } catch {
    // ignore invalid token for public routes
  }
  next();
}
