// superadmin.js: Express router for superadmin-related routes, handling authentication, admin management, and file uploads

// Import required modules
const express = require('express'); // Express framework for routing
const router = express.Router(); // Create a new Express router instance
const bcrypt = require('bcryptjs'); // Library for password hashing and comparison
const jwt = require('jsonwebtoken'); // Library for generating and verifying JSON Web Tokens
const multer = require('multer'); // Middleware for handling multipart/form-data (file uploads)
const path = require('path'); // Utility for handling file paths
const SuperAdmin = require('../models/SuperAdmin'); // Mongoose model for SuperAdmin
const Admin = require('../models/Admin'); // Mongoose model for Admin

// Multer configuration for handling profile photo uploads
const storage = multer.diskStorage({
  // Specify the destination directory for uploaded files
  destination: (req, file, cb) => {
    cb(null, 'Uploads/');
  },
  // Generate a unique filename using timestamp and original file extension
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
// Initialize multer with the storage configuration
const upload = multer({ storage });

// Initialize default SuperAdmin account if it doesn't exist
const initSuperAdmin = async () => {
  // Check if default SuperAdmin exists
  const existing = await SuperAdmin.findOne({ email: 'superadmin@joyverse.com' });
  if (!existing) {
    // Hash default password
    const hashed = await bcrypt.hash('superadmin123', 10);
    // Create default SuperAdmin
    await SuperAdmin.create({ email: 'superadmin@joyverse.com', password: hashed });
    console.log('✅ Default SuperAdmin created');
  }
};
// Execute initialization
initSuperAdmin();

// Middleware to authenticate SuperAdmin
const authenticateSuperAdmin = async (req, res, next) => {
  // Extract token from Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  // Check if token is missing
  if (!token) return res.status(403).json({ message: 'Access denied' });

  try {
    // Verify token using JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find SuperAdmin by email from token payload
    const superadmin = await SuperAdmin.findOne({ email: decoded.email });
    // Check if SuperAdmin exists
    if (!superadmin) return res.status(401).json({ message: 'Unauthorized' });
    // Attach SuperAdmin to request object
    req.superadmin = superadmin;
    next(); // Proceed to next middleware or route handler
  } catch (err) {
    // Handle invalid token errors
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Route: SuperAdmin login
router.post('/login', async (req, res) => {
  // Extract email and password from request body
  const { email, password } = req.body;
  // Validate required fields
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

  try {
    // Find SuperAdmin by email
    const superadmin = await SuperAdmin.findOne({ email });
    // Check if SuperAdmin exists
    if (!superadmin) return res.status(401).json({ message: 'Invalid email' });

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, superadmin.password);
    // Check if password matches
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    // Generate JWT token with email
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '2h' });
    // Send success response with token
    res.json({ message: 'Login successful', token });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ SuperAdmin login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route: Register a new admin
router.post('/register-admin', authenticateSuperAdmin, upload.single('profilePhoto'), async (req, res) => {
  // Extract admin data from request body
  const { name, phone, email, password } = req.body;
  // Get uploaded profile photo path, if any
  const profilePhoto = req.file ? req.file.path : null;

  // Validate required fields
  if (!name || !phone || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check for existing admin with same phone or email
    const existing = await Admin.findOne({ $or: [{ phone }, { email }] });
    if (existing) return res.status(400).json({ message: 'Phone or email already in use' });

    // Hash the admin's password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create new admin document
    const newAdmin = new Admin({
      name,
      phone,
      email,
      profilePhoto,
      password: hashedPassword,
    });

    // Save admin to database
    await newAdmin.save();
    // Send success response with admin details (excluding password)
    res.json({ message: '✅ Admin registered successfully', admin: { name, phone, email } });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Register Admin Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route: Get all admins
router.get('/admins', authenticateSuperAdmin, async (req, res) => {
  try {
    // Fetch all admins, excluding passwords
    const admins = await Admin.find({}, { password: 0 });
    // Send admins data in response
    res.json(admins);
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Error fetching admins:', err);
    res.status(500).json({ message: 'Server error fetching admins' });
  }
});

// Route: Enable or disable an admin
router.put('/toggle-admin', authenticateSuperAdmin, async (req, res) => {
  // Extract phone and active status from request body
  const { phone, active } = req.body;
  // Validate required fields
  if (!phone || active === undefined) {
    return res.status(400).json({ message: 'Phone and active status required' });
  }

  try {
    // Update admin's active status
    const admin = await Admin.findOneAndUpdate(
      { phone },
      { active },
      { new: true } // Return updated document
    ).select('-password'); // Exclude password from response
    // Check if admin exists
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    // Send success response with updated admin data
    res.json({
      message: `Admin ${admin.active ? 'enabled' : 'disabled'} successfully`,
      admin,
    });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Error updating admin status:', err);
    res.status(500).json({ message: 'Server error updating admin status' });
  }
});

// Route: Delete an admin
router.delete('/delete-admin/:phone', authenticateSuperAdmin, async (req, res) => {
  // Extract phone from URL parameters
  const { phone } = req.params;
  try {
    // Delete admin by phone
    const deletedAdmin = await Admin.findOneAndDelete({ phone });
    // Check if admin exists
    if (!deletedAdmin) return res.status(404).json({ message: 'Admin not found' });

    // Send success response
    res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    // Log and handle server errors
    console.error('❌ Error deleting admin:', err);
    res.status(500).json({ message: 'Server error deleting admin' });
  }
});

// Export the router for use in the main server
module.exports = router;