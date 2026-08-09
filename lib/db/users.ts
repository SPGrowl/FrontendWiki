import { query } from "@/lib/db";
import type { User, UserRecord, UserRole } from "@/type/user";

interface UserRow {
  id: string;
  name: string;
  password: string;
  role: UserRole;
  avatar: string;
  created_at: Date;
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    avatar: row.avatar,
    createdAt: row.created_at.toISOString(),
  };
}

function mapUserRecord(row: UserRow): UserRecord {
  return {
    ...mapUser(row),
    password: row.password,
  };
}

const USER_COLUMNS =
  "id, name, password, role, avatar, created_at";

export async function findUserByName(name: string): Promise<UserRecord | null> {
  const { rows } = await query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE name = $1 LIMIT 1`,
    [name]
  );
  return rows[0] ? mapUserRecord(rows[0]) : null;
}

export async function findUserById(id: string): Promise<User | null> {
  const { rows } = await query<UserRow>(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1 LIMIT 1`,
    [id]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function isNameTaken(name: string): Promise<boolean> {
  const { rows } = await query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM users WHERE name = $1) AS exists",
    [name]
  );
  return rows[0]?.exists ?? false;
}

export interface CreateUserInput {
  name: string;
  passwordHash: string;
  role?: UserRole;
  avatar?: string;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const { rows } = await query<UserRow>(
    `INSERT INTO users (name, password, role, avatar)
     VALUES ($1, $2, $3, $4)
     RETURNING ${USER_COLUMNS}`,
    [
      input.name,
      input.passwordHash,
      input.role ?? "user",
      input.avatar ?? "",
    ]
  );

  return mapUser(rows[0]);
}
