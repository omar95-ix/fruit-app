import React, { useState, useEffect, useCallback } from 'react';
import { productsAPI, attributesAPI } from '../services/api';
import { getMediaUrl } from '../services/upload';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    attributes: {},
    sortBy: 'newest'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAttributes = async () => {
    try {
      const response = await attributesAPI.getAttributes();
      setAttributes(response.data.data);
    } catch (error) {
      console.error('Error fetching attributes:', error);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        ...filters
      };

      // Convert attributes filter to array format
      if (Object.keys(filters.attributes).length > 0) {
        const attributeValues = Object.values(filters.attributes).flat();
        if (attributeValues.length > 0) {
          params.attributes = JSON.stringify(attributeValues);
        }
      }

      const response = await productsAPI.getProducts(params);
      setProducts(response.data.data);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchAttributes();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const handleAttributeFilterChange = (attributeId, option) => {
    setFilters(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [attributeId]: prev.attributes[attributeId]?.includes(option)
          ? prev.attributes[attributeId].filter(opt => opt !== option)
          : [...(prev.attributes[attributeId] || []), option]
      }
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      attributes: {},
      sortBy: 'newest'
    });
    setCurrentPage(1);
  };

  const renderAttributeFilters = () => {
    return attributes.map(attribute => (
      <div key={attribute._id} className="filter-group">
        <h4>{attribute.name}</h4>
        <div className="filter-options">
          {attribute.options.map(option => (
            <label key={option} className="filter-option">
              <input
                type="checkbox"
                checked={filters.attributes[attribute._id]?.includes(option) || false}
                onChange={() => handleAttributeFilterChange(attribute._id, option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
    ));
  };

  const renderProducts = () => {
    if (loading) {
      return <div className="loading">Loading products...</div>;
    }

    if (products.length === 0) {
      return <div className="no-products">No products found matching your criteria.</div>;
    }

    return (
      <div className="products-grid">
        {products.map(product => (
          <div key={product._id} className="product-card">
            {/* Product Images */}
            {product.images && product.images.length > 0 && (
              <div className="product-media">
                <img 
                  src={getMediaUrl('images', product.images[0])} 
                  alt={product.name}
                  className="product-image"
                />
              </div>
            )}
            
            <div className="product-header">
              <h3>{product.name}</h3>
              <span className={`status ${product.status}`}>
                {product.status}
              </span>
            </div>
            <p className="product-title">{product.title}</p>
            <p className="product-price">${product.price}</p>
            {product.phoneNumber && (
              <p className="product-info">
                <strong>Phone:</strong> {product.phoneNumber}
              </p>
            )}
            {product.address && (
              <p className="product-info">
                <strong>Address:</strong> {product.address}
              </p>
            )}
            
            {product.attributes && product.attributes.length > 0 && (
              <div className="product-attributes">
                {product.attributes.map((attr, index) => (
                  <div key={index} className="product-attribute">
                    <strong>{attr.attribute.name}:</strong>
                    <span>{attr.selectedOptions.join(', ')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`page-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="page-btn"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="page-btn"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="product-listing">
      <div className="listing-header">
        <h1>Fruits & Vegetables</h1>
        <p>Browse our collection of fresh produce</p>
      </div>

      {/* Top Filter Bar */}
      <div className="top-filters">
        <div className="top-filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="top-filter-group">
          <label>Price Range:</label>
          <div className="price-inputs">
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="price-input"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="price-input"
            />
          </div>
        </div>

        <div className="top-filter-group">
          <label>Sort:</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        <button onClick={clearFilters} className="clear-filters-btn">
          Clear All
        </button>
      </div>

      <div className="listing-content">
        {/* Filters Sidebar */}
        <div className="filters-sidebar">
          <div className="filters-header">
            <h3>Attribute Filters</h3>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <h4>Status</h4>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Dynamic Attribute Filters */}
          {renderAttributeFilters()}
        </div>

        {/* Products Grid */}
        <div className="products-section">
          {renderProducts()}
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
