// @ts-nocheck
import type { Config } from "drizzle-kit";
import { databaseConfig } from "./lib/env";

if (!databaseConfig.url) {
  throw new Error("DATABASE_URL is not set in .env.local");
}

const config: Config = {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseConfig.url,
  },
};

export default config;
