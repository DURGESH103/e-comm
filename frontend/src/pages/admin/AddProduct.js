import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories } from '../../store/slices/adminSlice';
import { toast } from 'react-toastify';
import api from '../../services/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.admin);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: 0,
    stock: '',
    category: '',
    subCategory: '',
    tags: [],
    images: [''],
    brand: '',
    isFeatured: false
  });

  const categoryOptions = [
    'Clothing', 'Electronics', 'Books', 'Home', 'Sports', 'Beauty', 'Toys'
  ];

  const subCategoryOptions = {
    'Clothing': ['Men', 'Women', 'Kids'],
    'Electronics': ['Mobile', 'Laptop', 'Audio'],
    'Books': ['Fiction', 'Non-Fiction', 'Educational'],
    'Home': ['Kitchen', 'Furniture', 'Decor'],
    'Sports': ['Fitness', 'Outdoor', 'Team Sports'],
    'Beauty': ['Skincare', 'Makeup', 'Haircare'],
    'Toys': ['Educational', 'Action', 'Board Games']
  };

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        subCategory: '' // Reset subcategory when category changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleTagChange = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        discount: Number(formData.discount),
        stock: Number(formData.stock),
        category: formData.category,
        subCategory: formData.subCategory,
        tags: formData.tags,
        images: formData.images.filter(img => img.trim() !== ''),
        brand: formData.brand,
        isFeatured: formData.isFeatured
      };

      console.log('Sending product data:', JSON.stringify(productData, null, 2));
      const response = await api.post('/admin/products', productData);
      console.log('Response:', response.data);
      toast.success('Product added successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error adding product:', error);
      console.log('Error response:', JSON.stringify(error.response?.data, null, 2));
      toast.error(error.response?.data?.message || error.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
    }
  };

  const tagOptions = ['new', 'trending', 'hot', 'offer', 'bestseller'];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Select Category</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Sub Category *</label>
            <select
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              required
              disabled={!formData.category}
              className="w-full p-2 border rounded disabled:bg-gray-100"
            >
              <option value="">Select Sub Category</option>
              {formData.category && subCategoryOptions[formData.category]?.map(subCat => (
                <option key={subCat} value={subCat}>{subCat}</option>
              ))}
            </select>
            {!formData.category && (
              <p className="text-sm text-gray-500 mt-1">Select a category first</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Product Images</label>
          {formData.images.map((image, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder="Image URL"
                className="flex-1 p-2 border rounded"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Add Image
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map(tag => (
              <label key={tag} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.tags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                  className="mr-2"
                />
                {tag}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="mr-2"
            />
            Featured Product
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Adding...' : 'Add Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;