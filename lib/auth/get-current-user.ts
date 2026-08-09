import { findUserById } from "@/lib/db/users";
import type { User } from "@/type/user";
import { getSessionUserId } from "@/lib/auth/session";

export async function getCurrentUser(): Promise<User | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return findUserById(userId);
}
