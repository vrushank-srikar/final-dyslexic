// admin.js: Express router for admin-related routes, handling authentication, child management, and real-time updates

// Import required modules
const express = require('express'); // Express framework for routing
const router = express.Router(); // Create a new Express router instance
const bcrypt = require('bcryptjs'); // Library for password hashing and comparison
const jwt = require('jsonwebtoken'); // Library for generating and verifying JSON Web Tokens
const crypto = require('crypto'); // Node.js module for cryptographic functions
const Admin = require('../models/Admin'); // Mongoose model for Admin
const Child = require('../models/Child'); // Mongoose model for Child

// Middleware to authenticate admin users
const authenticateAdmin = async (req, res, next) => {
  // Extract token from Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  // Check if token is missing
  if (!token) return res.status(403).json({ message: 'Access denied' });

  try {
    // Verify token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find admin by ID from token payload
    const admin = await Admin.findById(decoded.adminId);
    // Check if admin exists and is active
    if (!admin || !admin.active) return res.status(401).json({ message: 'Unauthorized' });
    // Attach admin to request object
    req.admin = admin;
    next(); // Proceed to next middleware or route handler
  } catch (err) {
    // Handle invalid token errors
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Route: Admin login
router.post('/login', async (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;
  // Validate required fields
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    // Find admin by email
    const admin = await Admin.findOne({ email });
    // Check if admin exists and is active
    if (!admin || !admin.active) return res.status(400).json({ message: 'Invalid email or account disabled' });

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    // Check if password matches
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    // Generate JWT token with admin ID and email
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    // Send success response with token and admin ID
    res.json({ message: 'Login successful', token, adminId: admin._id });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Admin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route: Register a new child
router.post('/register-child', authenticateAdmin, async (req, res) => {
  // Extract child data from request body
  const { childName, phone, userId, password } = req.body;
  // Validate required fields
  if (!childName || !phone || !userId || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check for existing child with same phone or user ID
    const existingChild = await Child.findOne({ $or: [{ phone }, { userId }] });
    if (existingChild) {
      return res.status(400).json({ message: 'Child with this phone or user ID already exists' });
    }

    // Hash the child's password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new child document
    const newChild = new Child({
      childName,
      phone,
      userId,
      password: hashedPassword,
      parentId: req.admin._id, // Associate child with the logged-in admin
    });

    // Save child to database
    await newChild.save();
    // Emit real-time event to notify clients of new child
    req.app.get('io').emit('newChild', { parentId: req.admin._id, child: newChild });
    // Send success response with child data
    res.json({ message: 'Child registered successfully', child: newChild });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Register child error:', err);
    res.status(500).json({ message: 'Server error registering child' });
  }
});

// Route: Get all children for the logged-in admin
router.get('/children', authenticateAdmin, async (req, res) => {
  try {
    // Find all children associated with the admin, sorted by registration date (newest first)
    const children = await Child.find({ parentId: req.admin._id }).sort({ registeredAt: -1 });
    // Send children data in response
    res.json(children);
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Error fetching children:', err);
    res.status(500).json({ message: 'Error fetching children' });
  }
});

// Route: Edit child information
router.put('/children/:childId/edit', authenticateAdmin, async (req, res) => {
  // Extract child ID from URL parameters
  const { childId } = req.params;
  // Extract updated child data from request body
  const { childName, phone, userId } = req.body;

  try {
    // Check for conflicts with other children (phone or user ID)
    const existingChild = await Child.findOne({
      $or: [{ phone }, { userId }],
      _id: { $ne: childId }, // Exclude the child being updated
    });
    if (existingChild) {
      return res.status(400).json({ message: 'Phone or user ID already in use by another child' });
    }

    // Update child document
    const child = await Child.findOneAndUpdate(
      { _id: childId, parentId: req.admin._id }, // Ensure admin owns the child
      { childName, phone, userId },
      { new: true } // Return updated document
    );
    // Check if child exists
    if (!child) return res.status(404).json({ message: 'Child not found or unauthorized' });

    // Emit real-time event to notify clients of child update
    req.app.get('io').emit('childUpdated', { parentId: req.admin._id, child });
    // Send success response with updated child data
    res.json({ message: 'Child updated successfully', child });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Error updating child:', err);
    res.status(500).json({ message: 'Error updating child' });
  }
});

// Route: Delete a child
router.delete('/children/:childId/delete', authenticateAdmin, async (req, res) => {
  // Extract child ID from URL parameters
  const { childId } = req.params;

  try {
    // Delete child document
    const child = await Child.findOneAndDelete({ _id: childId, parentId: req.admin._id });
    // Check if child exists
    if (!child) return res.status(404).json({ message: 'Child not found or unauthorized' });

    // Emit real-time event to notify clients of child deletion
    req.app.get('io').emit('childDeleted', { parentId: req.admin._id, childId });
    // Send success response
    res.json({ message: 'Child deleted successfully' });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Error deleting child:', err);
    res.status(500).json({ message: 'Error deleting child' });
  }
});

// Route: Reset child password
router.post('/children/:childId/reset-password', authenticateAdmin, async (req, res) => {
  // Extract child ID from URL parameters
  const { childId } = req.params;
  // Generate a random 8-character temporary password
  const temporaryPassword = crypto.randomBytes(4).toString('hex');

  try {
    // Hash the temporary password
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    // Update child document with new password
    const child = await Child.findOneAndUpdate(
      { _id: childId, parentId: req.admin._id }, // Ensure admin owns the child
      { password: hashedPassword },
      { new: true } // Return updated document
    );
    // Check if child exists
    if (!child) return res.status(404).json({ message: 'Child not found or unauthorized' });

    // Send success response with temporary password
    res.json({ message: 'Password reset successfully', temporaryPassword });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Error resetting child password:', err);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Route: Activate or deactivate a child account
router.patch('/children/:childId/status', authenticateAdmin, async (req, res) => {
  // Extract child ID from URL parameters
  const { childId } = req.params;
  // Extract isActive status from request body
  const { isActive } = req.body;

  try {
    // Update child document with new status
    const child = await Child.findOneAndUpdate(
      { _id: childId, parentId: req.admin._id }, // Ensure admin owns the child
      { isActive },
      { new: true } // Return updated document
    );
    // Check if child exists
    if (!child) return res.status(404).json({ message: 'Child not found or unauthorized' });

    // Emit real-time event to notify clients of status update
    req.app.get('io').emit('childStatusUpdated', { parentId: req.admin._id, child });
    // Send success response with updated child data
    res.json({ message: `Child status updated to ${isActive ? 'Active' : 'Inactive'}`, child });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Error updating child status:', err);
    res.status(500).json({ message: 'Error updating child status' });
  }
});

// Export the router for use in the main server
module.exports = router;