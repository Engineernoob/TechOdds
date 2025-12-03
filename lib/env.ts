/**
 * Environment variable validation and access
 * Centralized place for all environment variable access
 */

import * as dotenv from "dotenv";

// Load .env.local file
dotenv.config({ path: ".env.local" });

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvOptional(
  key: string,
  defaultValue?: string
): string | undefined {
  return process.env[key] || defaultValue;
}

// Supabase Configuration
export const supabaseConfig = {
  url: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
  anonKey: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  serviceRoleKey: getEnvOptional("SUPABASE_SERVICE_ROLE_KEY"),
};

// Database Configuration
export const databaseConfig = {
  url: getEnvOptional("DATABASE_URL"),
};

// Validate required environment variables
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        `Please check your .env.local file.`
    );
  }
}

// Validate on import (only warn, don't throw during build)
// This allows the app to build even without env vars set
if (process.env.NODE_ENV !== "production") {
  try {
    validateEnv();
  } catch (error) {
    // Don't throw in build-time, just warn
    // Users will get runtime errors with helpful messages
    if (typeof console !== "undefined" && console.warn) {
      console.warn("Environment validation warning:", error);
    }
  }
}
