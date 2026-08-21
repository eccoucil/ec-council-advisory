// Crypto helpers read AUTH_SECRET at call time; tests need a deterministic one.
process.env.AUTH_SECRET ??= "test-secret-not-used-outside-vitest";
