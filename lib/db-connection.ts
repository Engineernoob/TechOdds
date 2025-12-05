/**
 * Database Connection Utilities
 * Following Drizzle ORM best practices for Supabase
 * See: https://orm.drizzle.team/docs/get-started/supabase-new
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import { databaseConfig } from "./env";

/**
 * Create a database connection optimized for Supabase
 * 
 * For Supabase connection pooling with "Transaction" pool mode,
 * prepared statements are disabled as they're not supported.
 */
export function createDatabaseConnection() {
  const connectionString = databaseConfig.url;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set in .env.local. " +
        "Please configure your database connection string."
    );
  }

  // Validate connection string format
  if (
    connectionString.includes("your") ||
    connectionString.includes("localhost") ||
    connectionString.includes("placeholder")
  ) {
    throw new Error(
      "DATABASE_URL appears to contain placeholder values. " +
        "Please update .env.local with your actual Supabase connection string."
    );
  }

  // Create postgres client with Supabase-optimized settings
  // Disable prepare for Supabase transaction pool mode compatibility
  const client = postgres(connectionString, {
    prepare: false, // Required for Supabase transaction pool mode
    max: 1, // Single connection for serverless environments
  });

  // Create Drizzle instance with schema
  // Using the new Drizzle API pattern
  const db = drizzle(client, { schema });

  return { db, client };
}

/**
 * Get the database instance (singleton pattern)
 * Creates connection lazily on first access
 */
let dbInstance: ReturnType<typeof createDatabaseConnection>["db"] | null = null;
let clientInstance: ReturnType<typeof createDatabaseConnection>["client"] | null = null;

export function getDatabase() {
  if (!dbInstance) {
    try {
      const connection = createDatabaseConnection();
      dbInstance = connection.db;
      clientInstance = connection.client;
    } catch (error) {
      // During build-time, this might fail - that's okay
      if (process.env.NODE_ENV === "production" || process.env.NEXT_PHASE === "phase-production-build") {
        console.warn("Database connection not available during build:", error);
        return null as any;
      }
      throw error;
    }
  }
  return dbInstance;
}

/**
 * Close database connection (useful for cleanup)
 */
export async function closeDatabase() {
  if (clientInstance) {
    await clientInstance.end();
    dbInstance = null;
    clientInstance = null;
  }
}

