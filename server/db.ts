// Database connection - supports both Supabase PostgreSQL and Neon
import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.STORAGE_POSTGRES_PRISMA_URL ||
  process.env.STORAGE_POSTGRES_URL ||
  process.env.STORAGE_POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be set. Please configure DATABASE_URL (or Supabase STORAGE_POSTGRES_URL) in your environment.",
  );
}

// If using Supabase, the connection string should be from:
// Supabase Dashboard > Settings > Database > Connection string > URI
// Format: postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres

const pool = new Pool({ 
  connectionString,
  max: 1, // Serverless için daha küçük pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});
export const db = drizzle({ client: pool, schema });
