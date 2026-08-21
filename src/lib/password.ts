import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: { N: number; r: number; p: number; maxmem: number },
) => Promise<Buffer>;

const SCHEME = "scrypt";
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export const PASSWORD_MIN_LENGTH = 10;

export async function hashPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt, KEY_LENGTH, PARAMS);

  return [
    SCHEME,
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password: string, stored: string | null) {
  // Accounts with no password still pay the derivation cost, so sign-in timing
  // does not reveal which emails exist.
  if (!stored) {
    await derive(password, randomBytes(SALT_LENGTH), KEY_LENGTH, PARAMS);
    return false;
  }

  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== SCHEME) {
    return false;
  }

  const [, n, r, p, salt, key] = parts;
  const params = {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: PARAMS.maxmem,
  };

  if (
    !Number.isInteger(params.N) ||
    !Number.isInteger(params.r) ||
    !Number.isInteger(params.p)
  ) {
    return false;
  }

  const expected = Buffer.from(key, "base64url");
  if (expected.length === 0) {
    return false;
  }

  try {
    const actual = await derive(
      password,
      Buffer.from(salt, "base64url"),
      expected.length,
      params,
    );
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
