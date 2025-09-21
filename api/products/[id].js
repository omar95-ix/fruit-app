const connectDB = require('../../lib/mongodb');
const Product = require('../../models/Product');
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

    const { id } = req.query;

    if (req.method === 'GET') {
      // Get single product
      const product = await Product.findById(id)
        .populate('attributes.attribute', 'name options');
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      return res.json({
        success: true,
        data: product
      });
    }

    if (req.method === 'PUT') {
      // Update product (Admin only)
      try {
        const user = await protect(req);
        authorize('admin')(user);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      let product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      product = await Product.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      ).populate('attributes.attribute', 'name options');

      return res.json({
        success: true,
        data: product
      });
    }

    if (req.method === 'DELETE') {
      // Delete product (Admin only)
      try {
        const user = await protect(req);
        authorize('admin')(user);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: error.message
        });
      }

      const product = await Product.findById(id);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      await Product.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Product deleted successfully'
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
