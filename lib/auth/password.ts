import crypto from "node:crypto";

const SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
} as const;

const KEYLEN = 64;

function scryptAsync(
  password: string,
  salt: Buffer
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEYLEN, SCRYPT_PARAMS, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

/** 将明文密码哈希为可存入 users.password 的字符串 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const hash = await scryptAsync(password, salt);
  return `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`;
}

/** 校验明文密码是否与存储哈希匹配 */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const [algo, saltB64, hashB64] = stored.split(":");
  if (algo !== "scrypt" || !saltB64 || !hashB64) return false;

  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  const hash = await scryptAsync(password, salt);

  if (hash.length !== expected.length) return false;
  return crypto.timingSafeEqual(hash, expected);
}
