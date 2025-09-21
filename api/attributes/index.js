const connectDB = require('../../lib/mongodb');
const Attribute = require('../../models/Attribute');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Protect routes
const protect = async (req) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    throw new Error('Not authorized to access this route');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('No user found with this token');
    }

    return user;
  } catch (err) {
    throw new Error('Not authorized to access this route');
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (user) => {
    if (!roles.includes(user.role)) {
      throw new Error(`User role ${user.role} is not authorized to access this route`);
    }
    return true;
  };
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    await connectDB();

    if (req.method === 'GET') {
      // Get all attributes
      const attributes = await Attribute.find().sort({ createdAt: -1 });
      return res.json({
        success: true,
        count: attributes.length,
        data: attributes
      });
    }

    if (req.method === 'POST') {
      // Create new attribute (Admin only)
      try {
        const user = await protect(req);
        authorize('admin')(user);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      const { name, options } = req.body;

      // Check if attribute already exists
      const existingAttribute = await Attribute.findOne({ name });
      if (existingAttribute) {
        return res.status(400).json({
          success: false,
          message: 'Attribute with this name already exists'
        });
      }

      const attribute = await Attribute.create({
        name,
        options
      });

      return res.status(201).json({
        success: true,
        data: attribute
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}
