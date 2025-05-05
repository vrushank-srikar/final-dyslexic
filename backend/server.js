
require('dotenv').config();

// Import required modules
const express = require('express'); // Express framework for building the server
const mongoose = require('mongoose'); // MongoDB ODM for database interactions
const cors = require('cors'); // Middleware to enable Cross-Origin Resource Sharing
const { Server } = require('socket.io'); // Socket.IO for real-time communication
const http = require('http'); // HTTP server for Express and Socket.IO
const path = require('path'); // Utility for handling file paths

// Import route handlers
const superadminRoutes = require('./routes/superadmin'); // Routes for superadmin operations
const adminRoutes = require('./routes/admin'); // Routes for admin operations
const childRoutes = require('./routes/child'); // Routes for child user operations

// Initialize Express application
const app = express();

// Create an HTTP server instance with Express
const server = http.createServer(app);

// Initialize Socket.IO server with CORS and transport configurations
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // Allow requests from the frontend (React app)
    methods: ['GET', 'POST'], // Allow specified HTTP methods
    credentials: true, // Enable credentials for CORS
  },
  transports: ['websocket', 'polling'], // Support WebSocket with fallback to polling
});

// Middleware setup
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Enable CORS for frontend
app.use(express.json()); // Parse incoming JSON request bodies
app.use('/uploads', express.static(path.join(__dirname, 'Uploads'))); // Serve static files from Uploads directory
app.set('io', io); // Attach Socket.IO instance to Express app for use in routes

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, // Use new URL parser to avoid deprecation warnings
  useUnifiedTopology: true, // Use new topology engine for MongoDB
})
  .then(() => console.log('✅ MongoDB connected')) // Log success on connection
  .catch(err => console.error('❌ MongoDB error:', err)); // Log errors on connection failure

// Route middleware
app.use('/superadmin', superadminRoutes); // Mount superadmin routes
app.use('/admin', adminRoutes); // Mount admin routes
app.use('/child', childRoutes); // Mount child routes

// Socket.IO connection handler for real-time updates
io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id); // Log when a client connects
  socket.on('disconnect', () => {
    console.log('Socket.IO client disconnected:', socket.id); // Log when a client disconnects
  });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err); // Log server errors
  res.status(500).json({ message: 'Internal Server Error' }); // Send generic error response
});

// Start the server
const PORT = process.env.PORT || 3000; // Use environment PORT or default to 3000
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)); // Start server and log status