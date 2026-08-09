import type {
  AuthErrorResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@/type/user";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T;
  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof (data as AuthErrorResponse).error === "string"
        ? (data as AuthErrorResponse).error
        : `请求失败 (${response.status})`;
    throw new Error(message);
  }
  return data;
}

/** POST /api/auth/register */
export async function register(
  body: RegisterRequest
): Promise<AuthResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse<AuthResponse>(response);
}

/** POST /api/auth/login */
export async function login(body: LoginRequest): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return parseJsonResponse<AuthResponse>(response);
}

/** POST /api/auth/logout */
export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) {
    throw new Error(`登出失败 (${response.status})`);
  }
}
