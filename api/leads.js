/**
 * api/leads.js
 * Vercel serverless — GET /api/leads
 * Returns all leads sorted newest-first (admin only).
 * Requires: Authorization: Bearer <ADMIN_SECRET>
 */

const { connectDB, Lead } = require('../lib/db');

module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // ── Auth check ───────────────────────────────────────────────
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  const authHeader   = req.headers['authorization'] || '';
  const token        = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!ADMIN_SECRET || token !== ADMIN_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // ── Return leads ──────────────────────────────────────────────
  try {
    await connectDB();

    const leads = await Lead.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: leads });

  } catch (err) {
    console.error('[GET /api/leads]', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};