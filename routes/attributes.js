const express = require('express');
const { body, validationResult } = require('express-validator');
const Attribute = require('../models/Attribute');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all attributes
// @route   GET /api/attributes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const attributes = await Attribute.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: attributes.length,
      data: attributes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single attribute
// @route   GET /api/attributes/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);
    
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Attribute not found'
      });
    }

    res.json({
      success: true,
      data: attribute
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new attribute
// @route   POST /api/attributes
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('name').notEmpty().withMessage('Attribute name is required'),
  body('options').isArray({ min: 1 }).withMessage('At least one option is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
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

    res.status(201).json({
      success: true,
      data: attribute
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update attribute
// @route   PUT /api/attributes/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), [
  body('name').optional().notEmpty().withMessage('Attribute name cannot be empty'),
  body('options').optional().isArray({ min: 1 }).withMessage('At least one option is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let attribute = await Attribute.findById(req.params.id);
    
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Attribute not found'
      });
    }

    // Check if name is being changed and if it already exists
    if (req.body.name && req.body.name !== attribute.name) {
      const existingAttribute = await Attribute.findOne({ name: req.body.name });
      if (existingAttribute) {
        return res.status(400).json({
          success: false,
          message: 'Attribute with this name already exists'
        });
      }
    }

    attribute = await Attribute.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: attribute
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete attribute
// @route   DELETE /api/attributes/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const attribute = await Attribute.findById(req.params.id);
    
    if (!attribute) {
      return res.status(404).json({
        success: false,
        message: 'Attribute not found'
      });
    }

    await Attribute.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Attribute deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
