import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { databaseConfig } from "./lib/env";

if (!databaseConfig.url) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

export default defineConfig({
  out: "./drizzle",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseConfig.url,
  },
});
