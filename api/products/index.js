const connectDB = require('../../lib/mongodb');
const Product = require('../../models/Product');

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

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

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
}
