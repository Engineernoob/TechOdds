/**
 * Runtime environment variable validation
 * Use this in API routes and server components to validate env vars
 */

import { validateEnv } from "./env";

/**
 * Validate environment variables at runtime
 * Call this in API routes or server components that need env vars
 */
export function ensureEnvValidated() {
  try {
    validateEnv();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        `Environment configuration error: ${error.message}\n` +
          `Please ensure your .env.local file is properly configured.`
      );
    }
    throw error;
  }
}

/**
 * Get environment variable with validation
 */
export function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
        `Please add it to your .env.local file.`
    );
  }
  return value;
}
