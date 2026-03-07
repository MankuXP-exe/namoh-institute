/**
 * api/chat.js
 * Vercel Serverless Function — POST /api/chat
 *
 * Receives a user message and returns an AI response using Google Gemini.
 * The GOOGLE_API_KEY is stored ONLY in Vercel environment variables.
 * It is NEVER sent to the browser — the frontend only calls this endpoint.
 */

const { chatLimiter } = require('../lib/rateLimiter');
const { sanitizeString, getClientIP } = require('../lib/sanitize');

function buildFallbackReply(message) {
    const text = String(message || '').toLowerCase().trim();
    const compact = text.replace(/[^a-z0-9]/g, '');
    const has = (re) => re.test(text) || re.test(compact);

    if (!text) {
        return `Please type your question and I will help. You can ask about courses, demo class, batch timing, admission, fees, or placement support.`;
    }

    if (has(/^(hi|hello|hey|hlo|namaste|hy)$/)) {
        return `Hello! I can help with:
- Courses and duration
- Demo classes
- Batch timings
- Admission process
- Fees and installments

What would you like to know first?`;
    }

    if (has(/demo|freedemo|trial/)) {
        return `Yes, we offer FREE demo classes for all major courses before enrollment.

Available for:
- Computer Courses
- Spoken English
- Teacher Training

You can choose a morning, afternoon, or evening slot (Mon-Sat).`;
    }

    if (has(/batch|batc|timing|time|schedule|slot|hour/)) {
        return `Batch timings are available Monday-Saturday, 8:00 AM to 8:00 PM.

Typical slots:
- Morning
- Afternoon
- Evening

Tell me your course name and preferred time, and I will suggest the best batch.`;
    }

    if (has(/spoken|english/)) {
        return `Spoken English options:
- 3-Month Basic
- 6-Month Advanced
- 1-Year Professional

Focus areas include speaking confidence, grammar, public speaking, interview communication, and hesitation removal. FREE demo class is available.`;
    }

    if (has(/course|courses|class|program|computer|tally|excel|gst|powerbi|photoshop|vba|typing/)) {
        return `We offer:
- Computer Courses: Basic Computer, MS Office, Advanced Excel, Tally, GST, Data Analytics, Power BI, Typing, Diploma in Financial Accounting
- Spoken English: 3-month, 6-month, 1-year
- Teacher Training: NTT, PTT, SPTT, DCTT
- Distance Education and Vocational programs

If you share your goal/job target, I can suggest the best course.`;
    }

    if (has(/fee|fees|price|cost|charge|payment|installment|emi/)) {
        return `Fees vary by course and duration. Easy installment options are available.

If you tell me the course name, I can guide you on the expected fee range and duration. For exact latest fee structure, call/WhatsApp +91 9991919261.`;
    }

    if (has(/admission|enroll|enrol|join|apply|registration|register/)) {
        return `Admission process:
1. Choose course and preferred batch time
2. Attend FREE demo/counseling
3. Complete registration
4. Start classes

Required details are basic student information and course selection.`;
    }

    if (has(/placement|job|career|support|interview/)) {
        return `Yes, we provide placement support:
- Interview preparation
- Communication and confidence training
- Resume guidance
- Job-oriented practical training

Our training is focused on helping students become job-ready.`;
    }

    if (has(/address|location|where|map/)) {
        return `NAMOH Institute address:
Main Bus Stand, Pataudi Road, Below Red Gym Basement, Farrukh Nagar, Haryana 122506.

Timings: Mon-Sat, 8:00 AM to 8:00 PM (Sunday by appointment).`;
    }

    return `I can help with courses, demo class, batch timings, admission, fees, and placement support.

Please tell me what you want to know, for example:
- "Do you offer free demo classes?"
- "Batch timing for spoken English?"
- "Best course for job in accounting?"`;
}

function shouldUseFallbackReply(userMessage, aiReply) {
    if (!aiReply) return true;

    const q = String(userMessage || '').toLowerCase();
    const r = String(aiReply || '').toLowerCase();
    const genericEscalation = /for fastest support.*call|call\/whatsapp \+91 9991919261/.test(r);
    const likelySpecificQuestion = /(demo|batch|batc|timing|course|spoken|english|fee|admission|address|location|placement|job)/.test(q);
    const likelyAnswered = /(yes|available|morning|afternoon|evening|month|course|admission|fee|address|placement)/.test(r);

    return genericEscalation && likelySpecificQuestion && !likelyAnswered;
}

// ---- NAMOH Institute System Prompt ----
const SYSTEM_PROMPT = `You are a warm, polite, and knowledgeable counselor for NAMOH Institute of Computer & Spoken English, located at Main Bus Stand, Pataudi Road, Below Red Gym Basement, Farrukh Nagar, Haryana 122506. The institute is Government Registered under MHRD Department.

KEY INFORMATION YOU KNOW:
- Contact: +91 9991919261 (call/WhatsApp)
- Working Hours: Monday–Saturday, 8:00 AM – 8:00 PM. Sunday by appointment.
- All courses have Free Demo Classes available before enrollment.

COURSES OFFERED:
1. Computer Courses: Basic Computer, Advanced Excel, MS Office Suite, Tally ERP9/Prime, Photoshop, GST & Taxation, Data Analytics, Power BI, VBA Macro, Typing Classes (Hindi & English), Diploma in Financial Accounting
2. Spoken English: 3-Month Basic, 6-Month Advance, 1-Year Professional (includes public speaking, debate, business English)
3. Teacher Training: NTT (Nursery), PTT (Primary), SPTT (Special PTT), DCTT (Diploma in Computer Teacher)
4. Distance Education: BA/BCom/BSc, MBA/MCA, BBA/BCA, MCom/MA, B.Tech/M.Tech, JBT/B.Ed/B.PEd
5. Vocational: Fire Safety, Beautician, Yoga, ITI, Hotel Management, Industrial Training, Paramedical

INSTITUTE HIGHLIGHTS:
- 5000+ students trained, 30+ courses, 100% Placement Support, 5+ years experience
- Individual attention, small batches
- Fully AC Computer Lab with latest systems
- Digital Smart Board classrooms
- Free course notes and practice material
- Free interview skills, communication coaching, public speaking, hesitation removal sessions
- Flexible batch timings (morning, afternoon, evening)
- Easy installment payment options

RESPONSE GUIDELINES:
- Be encouraging, concise, and friendly. Use simple language.
- Answer the user's exact question directly in the first 1-2 lines.
- For very short or typo messages (example: "batceh"), infer likely intent and answer helpfully.
- If asked about fees, say fees vary by course and the student should call or visit for the latest fee structure and batch schedule.
- Mention call/WhatsApp details only when relevant (fees, admission, contact, exact confirmation) or when you truly do not know.
- If you don't know something specific, be honest and direct them to call.
- Keep responses under 150 words unless a detailed course comparison is asked.
- Use bullet points for listing courses or features.`;

module.exports = async function handler(req, res) {
    // CORS — allow our own site
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed.' });
    }

    // ---- Rate Limiting ----
    const clientIP = getClientIP(req);
    const rateResult = chatLimiter.check(clientIP);
    if (!rateResult.allowed) {
        res.setHeader('Retry-After', rateResult.retryAfter);
        return res.status(429).json({
            success: false,
            message: `Too many messages. Please wait ${rateResult.retryAfter} seconds.`,
        });
    }

    // ---- Validate Input ----
    const body = req.body || {};
    const userMessage = sanitizeString(body.message, 500);
    if (!userMessage) {
        return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    // ---- Build conversation history ----
    let history = [];
    if (Array.isArray(body.history)) {
        history = body.history
            .slice(-8)
            .filter(m => m && typeof m.role === 'string' && typeof m.content === 'string')
            .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: sanitizeString(m.content, 500) }],
            }));
    }

    // ---- Check API Key (server-side only, never exposed to browser) ----
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    if (!GOOGLE_API_KEY) {
        console.error('[NAMOH] GOOGLE_API_KEY is not configured.');
        return res.status(200).json({
            success: true,
            reply: buildFallbackReply(userMessage),
            source: 'fallback',
        });
    }
    // ---- Call Google Gemini API (server-side HTTP call) ----
    try {
        const model = 'gemini-1.5-flash-latest'; // Fast, cost-effective model

        // Build the contents array: system context + history + new message
        const contents = [
            // Inject system prompt as the first user turn, then a model acknowledgement
            // (Gemini doesn't have a dedicated system role in this endpoint format)
            { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\nAcknowledge that you understand your role.' }] },
            { role: 'model', parts: [{ text: 'I understand. I am the NAMOH Institute assistant and I am ready to help students.' }] },
            ...history,
            { role: 'user', parts: [{ text: userMessage }] },
        ];

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`;

        const geminiRes = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                generationConfig: {
                    maxOutputTokens: 350,
                    temperature: 0.45,
                    topP: 0.9,
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                ],
            }),
        });

        if (!geminiRes.ok) {
            const errData = await geminiRes.json().catch(() => ({}));
            console.error('[NAMOH] Gemini API error:', geminiRes.status, JSON.stringify(errData));
            throw new Error(`Gemini responded with ${geminiRes.status}`);
        }

        const data = await geminiRes.json();
        const aiReply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
        const reply = shouldUseFallbackReply(userMessage, aiReply) ? buildFallbackReply(userMessage) : aiReply;

        if (!reply) throw new Error('Empty response from Gemini');

        return res.status(200).json({ success: true, reply });

    } catch (err) {
        console.error('[NAMOH] Chat error:', err.message);
        return res.status(200).json({
            success: true,
            reply: buildFallbackReply(userMessage),
            source: 'fallback',
        });
    }
};