const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'submissions.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from root project directory
app.use(express.static(path.join(__dirname, '..')));

// Initialize submissions file
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// POST /api/enroll - Handle enrollment form submissions
app.post('/api/enroll', (req, res) => {
  const { name, phone, course, message } = req.body;

  // Basic validation
  if (!name || !phone || !course) {
    return res.status(400).json({
      success: false,
      message: 'Name, phone, and course are required fields.'
    });
  }

  const submission = {
    id: Date.now(),
    name: name.trim(),
    phone: phone.trim(),
    course: course.trim(),
    message: (message || '').trim(),
    timestamp: new Date().toISOString(),
    status: 'pending'
  };

  try {
    // Read existing submissions
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const submissions = JSON.parse(raw);

    // Append new submission
    submissions.push(submission);

    // Save back to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2));

    console.log(`[${new Date().toLocaleString()}] New enrollment: ${name} - ${course}`);

    res.json({
      success: true,
      message: `Thank you, ${name}! Your enrollment request for "${course}" has been received. We will contact you at ${phone} shortly.`,
      id: submission.id
    });
  } catch (err) {
    console.error('Error saving submission:', err);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again or call us directly.'
    });
  }
});

// GET /api/submissions - View all submissions (admin)
app.get('/api/submissions', (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const submissions = JSON.parse(raw);
    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error reading submissions.' });
  }
});

// Catch-all: serve index.html for any unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🎓 NAMOH Institute Server running at http://localhost:${PORT}`);
  console.log(`📋 Submissions stored in: ${DATA_FILE}`);
  console.log(`✅ API ready at /api/enroll\n`);
});
