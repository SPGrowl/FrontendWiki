import type { User, UserRole } from "@/type/user";

export function canEditEntryMetadata(
  user: Pick<User, "id" | "role">,
  creatorId: string
): boolean {
  return user.role === "admin" || user.id === creatorId;
}

export function isAdmin(role: UserRole): boolean {
  return role === "admin";
}
