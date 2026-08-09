/** 用户角色，对应 users.role CHECK 约束 */
export type UserRole = "admin" | "user";

/**
 * 用户表（users）对外读模型
 * 不含 password；密码哈希仅存于数据库与 UserRecord
 */
export interface User {
  id: string;
  name: string;
  role: UserRole;
  createdAt: string;
  avatar: string;
}

/** users 表完整行（服务端内部使用） */
export interface UserRecord extends User {
  password: string;
}

/** POST /api/auth/register 请求体 */
export interface RegisterRequest {
  name: string;
  password: string;
  avatar?: string;
}

/** POST /api/auth/login 请求体 */
export interface LoginRequest {
  name: string;
  password: string;
}

/** 登录 / 注册成功响应 */
export interface AuthResponse {
  user: User;
}

/** 认证 API 错误响应 */
export interface AuthErrorResponse {
  error: string;
}

/** 嵌入词条页、列表中的用户摘要 */
/**
 * 用户详情读模型
 * 由 users + entry_versions / entry_contributors 聚合而成
 */
export interface UserView extends User {
  contributionCount: number;
  recentContributions: Array<{
    entryId: string;
    entryName: string;
    href: string;
    contributedAt: string;
  }>;
}
