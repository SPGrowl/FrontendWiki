const NAME_MIN = 2;
const NAME_MAX = 32;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 128;

export function normalizeName(name: unknown): string | null {
  if (typeof name !== "string") return null;
  const trimmed = name.trim();
  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) return null;
  return trimmed;
}

export function normalizePassword(password: unknown): string | null {
  if (typeof password !== "string") return null;
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return null;
  }
  return password;
}

export function normalizeAvatar(avatar: unknown): string {
  if (typeof avatar !== "string") return "";
  return avatar.trim().slice(0, 512);
}
