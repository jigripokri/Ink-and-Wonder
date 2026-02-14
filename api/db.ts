import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./schema.js";

neonConfig.webSocketConstructor = ws;

// Make database optional for development
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/dev';

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });
