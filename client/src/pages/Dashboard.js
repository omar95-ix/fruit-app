import React, { useState, useEffect } from 'react';
import { productsAPI, attributesAPI } from '../services/api';
import { uploadMedia, getMediaUrl } from '../services/upload';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    title: '',
    price: '',
    status: 'active',
    phoneNumber: '',
    address: '',
    images: [],
    videos: [],
    attributes: []
  });
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    options: ['']
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, attributesRes] = await Promise.all([
        productsAPI.getProducts(),
        attributesAPI.getAttributes()
      ]);
      setProducts(productsRes.data.data);
      setAttributes(attributesRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files, type) => {
    if (files.length === 0) return;

    setUploadingFiles(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append(type, file);
      });

      const response = await uploadMedia(formData);
      const uploadedFiles = response.files[type] || [];
      
      if (type === 'images') {
        setSelectedImages(prev => [...prev, ...uploadedFiles]);
        setNewProduct(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedFiles.map(file => file.filename)]
        }));
      } else if (type === 'videos') {
        setSelectedVideos(prev => [...prev, ...uploadedFiles]);
        setNewProduct(prev => ({
          ...prev,
          videos: [...prev.videos, ...uploadedFiles.map(file => file.filename)]
        }));
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files: ' + error.response?.data?.message || error.message);
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeFile = (filename, type) => {
    if (type === 'images') {
      setSelectedImages(prev => prev.filter(file => file.filename !== filename));
      setNewProduct(prev => ({
        ...prev,
        images: prev.images.filter(img => img !== filename)
      }));
    } else if (type === 'videos') {
      setSelectedVideos(prev => prev.filter(file => file.filename !== filename));
      setNewProduct(prev => ({
        ...prev,
        videos: prev.videos.filter(vid => vid !== filename)
      }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.createProduct(newProduct);
      setNewProduct({
        name: '',
        title: '',
        price: '',
        status: 'active',
        phoneNumber: '',
        address: '',
        images: [],
        videos: [],
        attributes: []
      });
      setSelectedImages([]);
      setSelectedVideos([]);
      setShowAddProduct(false);
      fetchData();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleAddAttribute = async (e) => {
    e.preventDefault();
    try {
      await attributesAPI.createAttribute(newAttribute);
      setNewAttribute({
        name: '',
        options: ['']
      });
      setShowAddAttribute(false);
      fetchData();
    } catch (error) {
      console.error('Error adding attribute:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.deleteProduct(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleDeleteAttribute = async (id) => {
    if (window.confirm('Are you sure you want to delete this attribute?')) {
      try {
        await attributesAPI.deleteAttribute(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting attribute:', error);
      }
    }
  };

  const addAttributeOption = () => {
    setNewAttribute({
      ...newAttribute,
      options: [...newAttribute.options, '']
    });
  };

  const updateAttributeOption = (index, value) => {
    const options = [...newAttribute.options];
    options[index] = value;
    setNewAttribute({
      ...newAttribute,
      options
    });
  };

  const removeAttributeOption = (index) => {
    const options = newAttribute.options.filter((_, i) => i !== index);
    setNewAttribute({
      ...newAttribute,
      options
    });
  };

  const handleAttributeToggle = (attributeId, isChecked) => {
    if (isChecked) {
      // Add attribute with empty selected options
      setNewProduct({
        ...newProduct,
        attributes: [...newProduct.attributes, { attribute: attributeId, selectedOptions: [] }]
      });
    } else {
      // Remove attribute
      setNewProduct({
        ...newProduct,
        attributes: newProduct.attributes.filter(attr => attr.attribute !== attributeId)
      });
    }
  };

  const handleAttributeOptionToggle = (attributeId, option, isChecked) => {
    const updatedAttributes = newProduct.attributes.map(attr => {
      if (attr.attribute === attributeId) {
        if (isChecked) {
          return {
            ...attr,
            selectedOptions: [...attr.selectedOptions, option]
          };
        } else {
          return {
            ...attr,
            selectedOptions: attr.selectedOptions.filter(opt => opt !== option)
          };
        }
      }
      return attr;
    });
    
    setNewProduct({
      ...newProduct,
      attributes: updatedAttributes
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="dashboard-sections">
        {/* Products Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Products ({products.length})</h2>
            <button 
              onClick={() => setShowAddProduct(true)}
              className="btn-primary"
            >
              Add Product
            </button>
          </div>
          
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
                
                <h3>{product.name}</h3>
                <p>{product.title}</p>
                <p className="price">${product.price}</p>
                <p className={`status ${product.status}`}>
                  {product.status}
                </p>
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
                <div className="product-actions">
                  <button 
                    onClick={() => handleDeleteProduct(product._id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attributes Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Attributes ({attributes.length})</h2>
            <button 
              onClick={() => setShowAddAttribute(true)}
              className="btn-primary"
            >
              Add Attribute
            </button>
          </div>
          
          <div className="attributes-grid">
            {attributes.map(attribute => (
              <div key={attribute._id} className="attribute-card">
                <h3>{attribute.name}</h3>
                <div className="attribute-options">
                  {attribute.options.map((option, index) => (
                    <span key={index} className="option-tag">
                      {option}
                    </span>
                  ))}
                </div>
                <div className="attribute-actions">
                  <button 
                    onClick={() => handleDeleteAttribute(attribute._id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Product</h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={newProduct.status}
                  onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={newProduct.phoneNumber}
                  onChange={(e) => setNewProduct({...newProduct, phoneNumber: e.target.value})}
                  placeholder="e.g., +1234567890"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={newProduct.address}
                  onChange={(e) => setNewProduct({...newProduct, address: e.target.value})}
                  placeholder="Enter product address..."
                  rows="3"
                />
              </div>
              
              {/* Media Upload */}
              <div className="form-group">
                <label>Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files, 'images')}
                  className="file-input"
                />
                {uploadingFiles && <p className="upload-status">Uploading files...</p>}
                <div className="uploaded-files">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="file-preview">
                      <img 
                        src={getMediaUrl('images', file.filename)} 
                        alt={file.originalName}
                        className="preview-image"
                      />
                      <span className="file-name">{file.originalName}</span>
                      <button 
                        type="button"
                        onClick={() => removeFile(file.filename, 'images')}
                        className="remove-file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Videos</label>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e.target.files, 'videos')}
                  className="file-input"
                />
                <div className="uploaded-files">
                  {selectedVideos.map((file, index) => (
                    <div key={index} className="file-preview">
                      <video 
                        src={getMediaUrl('videos', file.filename)} 
                        className="preview-video"
                        controls
                      />
                      <span className="file-name">{file.originalName}</span>
                      <button 
                        type="button"
                        onClick={() => removeFile(file.filename, 'videos')}
                        className="remove-file"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attributes Selection */}
              <div className="form-group">
                <label>Attributes</label>
                <div className="attributes-selection">
                  {attributes.map(attribute => (
                    <div key={attribute._id} className="attribute-selection">
                      <label className="attribute-label">
                        <input
                          type="checkbox"
                          checked={newProduct.attributes.some(attr => attr.attribute === attribute._id)}
                          onChange={(e) => handleAttributeToggle(attribute._id, e.target.checked)}
                        />
                        {attribute.name}
                      </label>
                      {newProduct.attributes.some(attr => attr.attribute === attribute._id) && (
                        <div className="attribute-options">
                          {attribute.options.map(option => (
                            <label key={option} className="option-label">
                              <input
                                type="checkbox"
                                checked={newProduct.attributes.find(attr => attr.attribute === attribute._id)?.selectedOptions.includes(option) || false}
                                onChange={(e) => handleAttributeOptionToggle(attribute._id, option, e.target.checked)}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Product</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddProduct(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Attribute Modal */}
      {showAddAttribute && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Attribute</h3>
            <form onSubmit={handleAddAttribute}>
              <div className="form-group">
                <label>Attribute Name</label>
                <input
                  type="text"
                  value={newAttribute.name}
                  onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Options</label>
                {newAttribute.options.map((option, index) => (
                  <div key={index} className="option-input">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateAttributeOption(index, e.target.value)}
                      required
                    />
                    {newAttribute.options.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeAttributeOption(index)}
                        className="btn-danger"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={addAttributeOption}
                  className="btn-secondary"
                >
                  Add Option
                </button>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Add Attribute</button>
                <button 
                  type="button" 
                  onClick={() => setShowAddAttribute(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
