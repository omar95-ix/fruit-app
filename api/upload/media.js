const connectDB = require('../../lib/mongodb');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { put } = require('@vercel/blob');

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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Check authentication
    try {
      const user = await protect(req);
      authorize('admin')(user);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }

    const uploadedFiles = {
      images: [],
      videos: []
    };

    // Process uploaded images
    if (req.body.images) {
      for (const image of req.body.images) {
        const blob = await put(`images/${Date.now()}-${image.name}`, image.buffer, {
          access: 'public',
          contentType: image.type
        });
        
        uploadedFiles.images.push({
          filename: blob.pathname.split('/').pop(),
          originalName: image.name,
          url: blob.url,
          size: image.size,
          mimetype: image.type
        });
      }
    }

    // Process uploaded videos
    if (req.body.videos) {
      for (const video of req.body.videos) {
        const blob = await put(`videos/${Date.now()}-${video.name}`, video.buffer, {
          access: 'public',
          contentType: video.type
        });
        
        uploadedFiles.videos.push({
          filename: blob.pathname.split('/').pop(),
          originalName: video.name,
          url: blob.url,
          size: video.size,
          mimetype: video.type
        });
      }
    }

    res.json({
      success: true,
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}
