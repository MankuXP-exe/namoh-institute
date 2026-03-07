/**
 * lib/sanitize.js
 * Input sanitization and validation helpers.
 */

// Allowed course names (strict allowlist)
const ALLOWED_COURSES = new Set([
    'Basic Computer',
    'Advanced Excel',
    'MS Office Suite',
    'Tally ERP9 / Prime',
    'Photoshop',
    'GST & Taxation',
    'Data Analytics',
    'Power BI',
    'VBA Macro',
    'Typing Classes',
    '3 Months Basic Spoken English',
    '6 Months Advance Spoken English',
    '1 Year Professional Spoken English',
    'NTT — Nursery Teacher Training',
    'PTT — Primary Teacher Training',
    'SPTT — Special PTT',
    'DCTT — Diploma in Computer Teacher',
    'BA / BCom / BSc',
    'MBA / MCA',
    'BBA / BCA',
    'MCom / MA',
    'B.Tech / M.Tech',
    'JBT / B.Ed / B.PEd',
    'Fire Safety',
    'Beautician Course',
    'Yoga Courses',
    'ITI Courses',
    'Hotel Management',
    'Industrial Training',
    'Paramedical Courses',
    'Diploma in Financial Accounting',
]);

/**
 * Strip HTML/script tags and dangerous chars, then trim.
 * @param {*}      val   - Raw value from request body
 * @param {number} max   - Maximum allowed length
 * @returns {string}
 */
function sanitizeString(val, max = 500) {
    if (typeof val !== 'string') return '';
    return val
        .replace(/<[^>]*>/g, '')                   // Strip HTML tags
        .replace(/[<>"'`]/g, '')                   // Strip dangerous chars
        .replace(/\s+/g, ' ')                      // Collapse whitespace
        .trim()
        .slice(0, max);
}

/**
 * Validate an Indian phone number (10 digits, not starting with 0 or 1).
 * @param {string} phone
 * @returns {{ valid: boolean, cleaned: string }}
 */
function validatePhone(phone) {
    if (typeof phone !== 'string') return { valid: false, cleaned: '' };
    const cleaned = phone.replace(/\D/g, '');          // Remove non-digits
    const valid = /^[6-9]\d{9}$/.test(cleaned);        // Indian mobile: 6–9 start, 10 digits
    return { valid, cleaned };
}

/**
 * Validate the name field.
 * @param {string} name
 * @returns {{ valid: boolean, cleaned: string, error: string }}
 */
function validateName(name) {
    const cleaned = sanitizeString(name, 80);
    if (!cleaned || cleaned.length < 2) {
        return { valid: false, cleaned, error: 'Name must be at least 2 characters.' };
    }
    if (!/^[A-Za-z\u0900-\u097F\s\-'.]+$/.test(cleaned)) {
        return { valid: false, cleaned, error: 'Name contains invalid characters.' };
    }
    return { valid: true, cleaned, error: '' };
}

/**
 * Validate that the course is in the allowlist.
 * @param {string} course
 * @returns {{ valid: boolean, cleaned: string, error: string }}
 */
function validateCourse(course) {
    const cleaned = sanitizeString(course, 120);
    if (!ALLOWED_COURSES.has(cleaned)) {
        return { valid: false, cleaned, error: 'Please select a valid course.' };
    }
    return { valid: true, cleaned, error: '' };
}

/**
 * Get a privacy-safe hash of the client IP (for rate-limit logging).
 * @param {string} ip
 * @returns {string}
 */
function hashIP(ip) {
    let hash = 5381;
    for (let i = 0; i < ip.length; i++) {
        hash = (hash * 33) ^ ip.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
}

/**
 * Extract client IP from Vercel request headers.
 * @param {object} req - Vercel/Node request object
 * @returns {string}
 */
function getClientIP(req) {
    return (
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.headers['x-real-ip'] ||
        req.socket?.remoteAddress ||
        'unknown'
    );
}

module.exports = {
    sanitizeString,
    validatePhone,
    validateName,
    validateCourse,
    hashIP,
    getClientIP,
    ALLOWED_COURSES,
};
