const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load .env file
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from root directory
app.use(express.static(__dirname));

// Mock Vercel serverless environment headers
app.use('/api', (req, res, next) => {
    req.headers['x-forwarded-for'] = '127.0.0.1';
    next();
});

// Load API routes
const leadHandler = require('./api/lead');
const leadsHandler = require('./api/leads');
const chatHandler = require('./api/chat');

// Map Express routes to Vercel functions (req, res) structure
app.post('/api/lead', leadHandler);
app.get('/api/leads', leadsHandler);
app.post('/api/chat', chatHandler);

// Catch-all to serve index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Local Testing Server running at http://localhost:${PORT}`);
    console.log(`👉 Open http://localhost:${PORT} in your browser to test.`);
    if (process.env.GOOGLE_API_KEY) {
        console.log(`✅ GOOGLE_API_KEY found! Chatbot should work.`);
    } else {
        console.log(`❌ GOOGLE_API_KEY missing from .env`);
    }
});
