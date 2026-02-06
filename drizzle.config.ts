
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

if (!process.env.TURSO_DATABASE_URL) {
  console.error("❌ TURSO_DATABASE_URL is missing in environment variables!");
} else {
  console.log("✅ TURSO_DATABASE_URL found:", process.env.TURSO_DATABASE_URL.substring(0, 10) + "...");
}

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
