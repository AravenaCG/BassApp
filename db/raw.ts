import { env } from "cloudflare:workers";

export function getProgressDb(): D1Database {
  if (!env.DB) throw new Error("Progress storage unavailable");
  return env.DB;
}
