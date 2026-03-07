const fs = require('fs/promises');
const path = require('path');

const STORE_PATH = path.join(process.cwd(), 'backend', 'submissions.json');

async function ensureStore() {
    try {
        await fs.access(STORE_PATH);
    } catch (_) {
        await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
        await fs.writeFile(STORE_PATH, '[]', 'utf8');
    }
}

async function readLeads() {
    await ensureStore();
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed : [];
}

async function writeLeads(leads) {
    await fs.writeFile(STORE_PATH, JSON.stringify(leads, null, 2), 'utf8');
}

async function saveLead(lead) {
    const leads = await readLeads();
    const record = {
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ...lead,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    leads.unshift(record);
    await writeLeads(leads);
    return record;
}

module.exports = { readLeads, saveLead };
