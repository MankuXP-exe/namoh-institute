/**
 * lib/db.js
 * MongoDB connection with caching for Vercel serverless functions.
 * Reuses an existing connection across warm invocations — prevents reconnect storms.
 */

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME     = process.env.MONGODB_DBNAME || 'namoh';

// ── Connection cache (survives across warm lambda invocations) ──
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands:          false,
      maxPoolSize:             5,         // small pool — ideal for serverless
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS:         10000,
      dbName:                  DB_NAME,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(() => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ── Lead Schema ───────────────────────────────────────────────────
const leadSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true, maxlength: 80 },
  phone:   { type: String, required: true, trim: true, maxlength: 20 },
  course:  { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, trim: true, maxlength: 500, default: '' },
  source:  { type: String, default: 'website' },
  createdAt: { type: Date, default: Date.now },   // explicit — auto-generated on save
});

// Force collection name to "leads"
const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema, 'leads');

module.exports = { connectDB, Lead };