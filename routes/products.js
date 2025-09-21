const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Attribute = require('../models/Attribute');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all products with filtering, sorting, and search
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  
  try {
    let query = {};
    let sort = {};

    // Search functionality - using regex for partial matching
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i'); // 'i' for case-insensitive
      query.$or = [
        { name: searchRegex },
        { title: searchRegex }
      ];
    }

    // Status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Attribute filters
    if (req.query.attributes) {
      const attributeFilters = JSON.parse(req.query.attributes);
      query['attributes.selectedOptions'] = { $in: attributeFilters };
    }

    // Sorting
    if (req.query.sortBy) {
      switch (req.query.sortBy) {
        case 'price-high':
          sort.price = -1;
          break;
        case 'price-low':
          sort.price = 1;
          break;
        case 'name':
          sort.name = 1;
          break;
        case 'newest':
          sort.createdAt = -1;
          break;
        default:
          sort.createdAt = -1;
      }
    } else {
      sort.createdAt = -1;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find(query)
      .populate('attributes.attribute', 'name options')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('attributes.attribute', 'name options');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('name').notEmpty().withMessage('Product name is required'),
  body('title').notEmpty().withMessage('Product title is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Please include a valid phone number'),
  body('address').optional().isLength({ max: 200 }).withMessage('Address cannot be more than 200 characters'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('videos').optional().isArray().withMessage('Videos must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, title, price, status, phoneNumber, address, images, videos, attributes } = req.body;

    // Validate attributes if provided
    if (attributes && attributes.length > 0) {
      for (const attr of attributes) {
        const attribute = await Attribute.findById(attr.attribute);
        if (!attribute) {
          return res.status(400).json({
            success: false,
            message: `Attribute with ID ${attr.attribute} not found`
          });
        }

        // Validate selected options
        for (const option of attr.selectedOptions) {
          if (!attribute.options.includes(option)) {
            return res.status(400).json({
              success: false,
              message: `Option "${option}" is not valid for attribute "${attribute.name}"`
            });
          }
        }
      }
    }

    const product = await Product.create({
      name,
      title,
      price,
      status: status || 'active',
      phoneNumber,
      address,
      images: images || [],
      videos: videos || [],
      attributes: attributes || []
    });

    const populatedProduct = await Product.findById(product._id)
      .populate('attributes.attribute', 'name options');

    res.status(201).json({
      success: true,
      data: populatedProduct
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), [
  body('name').optional().notEmpty().withMessage('Product name cannot be empty'),
  body('title').optional().notEmpty().withMessage('Product title cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  body('phoneNumber').optional().isMobilePhone().withMessage('Please include a valid phone number'),
  body('address').optional().isLength({ max: 200 }).withMessage('Address cannot be more than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate attributes if provided
    if (req.body.attributes && req.body.attributes.length > 0) {
      for (const attr of req.body.attributes) {
        const attribute = await Attribute.findById(attr.attribute);
        if (!attribute) {
          return res.status(400).json({
            success: false,
            message: `Attribute with ID ${attr.attribute} not found`
          });
        }

        // Validate selected options
        for (const option of attr.selectedOptions) {
          if (!attribute.options.includes(option)) {
            return res.status(400).json({
              success: false,
              message: `Option "${option}" is not valid for attribute "${attribute.name}"`
            });
          }
        }
      }
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('attributes.attribute', 'name options');

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
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
