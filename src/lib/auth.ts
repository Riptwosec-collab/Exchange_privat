import jwt from "jsonwebtoken";

const fallbackSecret = "development-only-secret-change-me";

export type SessionUser = {
  id: string;
  email: string;
  role: "user" | "admin";
};

export function signSession(user: SessionUser) {
  return jwt.sign(user, process.env.JWT_SECRET ?? fallbackSecret, { expiresIn: "7d" });
}

export function verifySession(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET ?? fallbackSecret) as SessionUser;
}
