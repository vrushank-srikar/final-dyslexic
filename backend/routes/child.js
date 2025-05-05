// child.js: Express router for child-related routes, handling authentication, emotion detection, and game reports

// Import required modules
const express = require('express'); // Express framework for routing
const router = express.Router(); // Create a new Express router instance
const bcrypt = require('bcryptjs'); // Library for password hashing and comparison
const jwt = require('jsonwebtoken'); // Library for generating and verifying JSON Web Tokens
const Child = require('../models/Child'); // Mongoose model for Child

// Middleware to verify JWT token for authenticated child routes
const verifyToken = (req, res, next) => {
  // Extract token from Authorization header (Bearer format)
  const token = req.headers['authorization']?.split(' ')[1];
  // Check if token is missing
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    // Verify token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach decoded user data to request object
    req.user = decoded;
    next(); // Proceed to next middleware or route handler
  } catch (err) {
    // Log and handle token verification errors
    console.error('❌ Token verification failed:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Route: Child login
router.post('/login', async (req, res) => {
  // Extract login credentials from request body
  const { childName, userId, password } = req.body;
  // Validate required fields
  if (!childName || !userId || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Find child by childName (case-insensitive) and userId
    const child = await Child.findOne({
      childName: { $regex: new RegExp(`^${childName}$`, 'i') },
      userId,
    });
    // Check if child exists and is active
    if (!child || !child.isActive) {
      return res.status(401).json({ message: 'Invalid credentials or account disabled' });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, child.password);
    // Check if password matches
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    // Generate JWT token with userId and childName
    const token = jwt.sign(
      { userId: child.userId, childName: child.childName },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    // Send success response with token and userId
    res.json({ message: 'Login successful', token, userId: child.userId });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Child login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route: Forward emotion detection request to Flask service
router.post('/detect-emotion', verifyToken, async (req, res) => {
  // Extract facial landmarks from request body
  const { landmarks } = req.body;
  // Validate required landmarks data
  if (!landmarks) {
    return res.status(400).json({ message: 'Landmarks are required' });
  }

  try {
    // Dynamically import node-fetch for HTTP requests
    const { default: fetch } = await import('node-fetch');

    // Send landmarks to Flask emotion detection service
    const response = await fetch('http://localhost:5000/detect_emotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ landmarks }),
    });

    // Parse Flask response
    const data = await response.json();
    if (response.ok) {
      // Send Flask response data if successful
      res.json(data);
    } else {
      // Log and forward Flask errors
      console.error('❌ Flask response error:', data);
      res.status(response.status).json(data);
    }
  } catch (err) {
    // Log and handle errors communicating with Flask
    console.error('❌ Error forwarding to Flask:', err);
    res.status(500).json({ message: 'Error communicating with emotion detection service' });
  }
});

// Route: Save emotion data for a child
router.post('/save-emotion', verifyToken, async (req, res) => {
  // Extract emotion data from request body
  const { userId, emotion, question } = req.body;
  // Validate required fields
  if (!userId || !emotion || !question) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Find child by userId
    const child = await Child.findOne({ userId });
    // Check if child exists and is active
    if (!child || !child.isActive) {
      return res.status(404).json({ message: 'Child not found or disabled' });
    }

    // Add emotion data to child's emotionHistory
    child.emotionHistory.push({ emotion, question, timestamp: new Date() });
    // Save updated child document
    await child.save();

    // Emit real-time event to notify clients (e.g., admin dashboard) of emotion update
    req.app.get('io').emit('emotionUpdate', {
      parentId: child.parentId,
      userId,
      emotion,
      question,
      timestamp: new Date(),
    });
    // Send success response
    res.json({ message: 'Emotion saved successfully' });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Error saving emotion:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route: Get emotion trends for a child
router.get('/emotion-trends/:userId', verifyToken, async (req, res) => {
  try {
    // Find child by userId
    const child = await Child.findOne({ userId: req.params.userId });
    // Check if child exists
    if (!child) return res.status(404).json({ message: 'Child not found' });
    // Send child's emotionHistory
    res.json(child.emotionHistory);
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Error fetching emotion trends:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route: Save game report for a child
router.post('/save-game', verifyToken, async (req, res) => {
  // Extract game report data from request body
  const { userId, score, emotions, question, isCorrect } = req.body;
  // Validate required fields
  if (!userId || score === undefined || !question || isCorrect === undefined) {
    return res.status(400).json({ message: 'userId, score, question, and isCorrect are required' });
  }

  try {
    // Find child by userId
    const child = await Child.findOne({ userId });
    // Check if child exists and is active
    if (!child || !child.isActive) {
      return res.status(404).json({ message: 'Child not found or disabled' });
    }

    // Add game report to child's gameReports
    child.gameReports.push({ score, emotions, question, isCorrect, completedAt: new Date() });
    // Save updated child document
    await child.save();

    // Emit real-time event to notify clients (e.g., admin dashboard) of game report update
    req.app.get('io').emit('gameReportUpdate', {
      parentId: child.parentId,
      userId,
      score,
      emotions,
      question,
      isCorrect,
      completedAt: new Date(),
    });
    // Send success response
    res.json({ message: 'Game report saved successfully' });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Error saving game report:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route: Get game reports for a child
router.get('/game-reports/:userId', verifyToken, async (req, res) => {
  try {
    // Get limit parameter from query string, default to 10
    const limit = parseInt(req.query.limit) || 10;
    // Find child by userId
    const child = await Child.findOne({ userId: req.params.userId });
    // Check if child exists
    if (!child) return res.status(404).json({ message: 'Child not found' });

    // Sort game reports by completion date (newest first) and limit results
    const gameReports = child.gameReports
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, limit);

    // Send game reports in response
    res.json(gameReports);
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Error fetching game reports:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export the router for use in the main server
module.exports = router;