/**
 * api/lead.js
 * Vercel serverless — POST /api/lead
 * Stores a new enrollment lead in MongoDB Atlas.
 */

const { connectDB, Lead } = require('../lib/db');

module.exports = async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    const { name, phone, course, message } = body || {};

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Phone is required' });
    }
    if (!course || !course.trim()) {
      return res.status(400).json({ success: false, message: 'Course is required' });
    }

    await connectDB();

    await Lead.create({
      name:    name.trim(),
      phone:   phone.trim(),
      course:  course.trim(),
      message: (message || '').trim(),
      source:  'website',
    });

    return res.status(200).json({ success: true, message: 'Lead saved' });

  } catch (err) {
    console.error('[POST /api/lead]', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};