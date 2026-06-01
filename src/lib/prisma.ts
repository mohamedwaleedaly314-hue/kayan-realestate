/**
 * Database client — uses Supabase REST API instead of a direct TCP connection.
 * This allows Vercel serverless functions to reach the Supabase database
 * without requiring a working connection pooler configuration.
 */
export { prismaDb as prisma } from './supabase-db';
