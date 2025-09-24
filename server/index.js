/* server/index.js (Node + Express) */
const express = require('express');
const cors = require('cors');
const path = require('path');
const generateQuizRoute = require('./routes/generateQuiz');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// API Routes
app.use('/api/generate-quiz', generateQuizRoute);

// Serve client files for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Frontend available at http://localhost:${PORT}`);
});

module.exports = app;