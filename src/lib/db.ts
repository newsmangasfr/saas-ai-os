import Database from "better-sqlite3";
import { pbkdf2Sync, randomBytes } from "crypto";
import path from "path";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "saas.db");

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        plan TEXT DEFAULT 'starter',
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS sites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        wp_user TEXT,
        wp_app_password TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        site_id INTEGER REFERENCES sites(id),
        title TEXT NOT NULL,
        content TEXT,
        slug TEXT,
        status TEXT DEFAULT 'draft',
        source TEXT DEFAULT 'manual',
        wp_post_id INTEGER,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        payload TEXT,
        status TEXT DEFAULT 'pending',
        result TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        finished_at TEXT
      );
    `);
  }
  return _db;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const check = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return check === hash;
}
