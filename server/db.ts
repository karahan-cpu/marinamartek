// Database connection - supports both Supabase PostgreSQL and Neon
import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// DATABASE_URL can be:
// 1. Supabase PostgreSQL connection string (postgresql://...)
// 2. Neon connection string (postgres://...)
// Both work with @neondatabase/serverless driver
const connectionString = process.env.DATABASE_URL;

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
