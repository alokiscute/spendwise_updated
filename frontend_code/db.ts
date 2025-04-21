import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Only create a database connection if DATABASE_URL is set
// For development, we'll use the MemStorage implementation instead
let pool;
let db;

if (process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
} else {
  console.log("DATABASE_URL not set. Using in-memory storage for development.");
  // Create dummy pool and db objects for development
  pool = {};
  db = {};
}

export { pool, db };
