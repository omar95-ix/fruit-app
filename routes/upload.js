const express = require('express');
const path = require('path');
const fs = require('fs');
const { uploadMedia } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Upload media files
// @route   POST /api/upload/media
// @access  Private (Admin only)
router.post('/media', protect, authorize('admin'), uploadMedia, (req, res) => {
  try {
    const uploadedFiles = {
      images: [],
      videos: []
    };

    // Process uploaded images
    if (req.files.images) {
      req.files.images.forEach(file => {
        uploadedFiles.images.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        });
      });
    }

    // Process uploaded videos
    if (req.files.videos) {
      req.files.videos.forEach(file => {
        uploadedFiles.videos.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        });
      });
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
});

// @desc    Delete media file
// @route   DELETE /api/upload/media/:filename
// @access  Private (Admin only)
router.delete('/media/:filename', protect, authorize('admin'), (req, res) => {
  try {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, '../uploads/images', filename);
    const videoPath = path.join(__dirname, '../uploads/videos', filename);

    let filePath = null;
    if (fs.existsSync(imagePath)) {
      filePath = imagePath;
    } else if (fs.existsSync(videoPath)) {
      filePath = videoPath;
    }

    if (filePath) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Delete failed',
      error: error.message
    });
  }
});

// @desc    Serve media files
// @route   GET /api/upload/media/:type/:filename
// @access  Public
router.get('/media/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    
    if (type !== 'images' && type !== 'videos') {
      return res.status(400).json({
        success: false,
        message: 'Invalid media type'
      });
    }

    const filePath = path.join(__dirname, '../uploads', type, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve file',
      error: error.message
    });
  }
});

module.exports = router;
