import type { User } from "../types/user";

export function requireAuth(user: User | null) {
  if (!user) {
    throw new Error("Authentication required");
  }

  return true;
}
