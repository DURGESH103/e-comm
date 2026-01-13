import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createClothingProduct, clearError, clearCreateSuccess } from '../../store/slices/adminClothingSlice';
import { toast } from 'react-toastify';

const CreateClothingProduct = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, createSuccess } = useSelector((state) => state.adminClothing);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: 0,
    stock: '',
    brand: '',
    gender: '', // This will map to subCategory
    images: [''],
    tags: [],
    isFeatured: false
  });

  const genderOptions = [
    { value: 'Men', label: "Men's Clothing", icon: '👨' },
    { value: 'Women', label: "Women's Clothing", icon: '👩' },
    { value: 'Kids', label: "Kids Clothing", icon: '👶' }
  ];

  const tagOptions = ['new', 'trending', 'hot', 'offer', 'bestseller'];

  useEffect(() => {
    if (createSuccess) {
      toast.success('Clothing product created successfully!');
      navigate('/admin/clothing');
      dispatch(clearCreateSuccess());
    }
  }, [createSuccess, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
    
    if (!formData.gender) {
      toast.error('Please select a gender category');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      discount: Number(formData.discount),
      stock: Number(formData.stock),
      brand: formData.brand,
      gender: formData.gender, // Backend will map this to subCategory
      images: formData.images.filter(img => img.trim() !== ''),
      tags: formData.tags,
      isFeatured: formData.isFeatured
    };

    dispatch(createClothingProduct(productData));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Clothing Product</h1>
        <p className="text-gray-600">Add a new clothing item to your inventory</p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-blue-600 mr-3">ℹ️</div>
            <div>
              <p className="text-sm text-blue-800 font-medium">Automatic Category Assignment</p>
              <p className="text-sm text-blue-700">Category will be automatically set to "Clothing" and subcategory based on your gender selection.</p>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Gender Selection - MANDATORY */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            Gender Category * <span className="text-red-500">(Required)</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {genderOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.gender === option.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{option.icon}</span>
                  <div>
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">Category: Clothing → {option.value}</div>
                  </div>
                </div>
                {formData.gender === option.value && (
                  <div className="absolute top-2 right-2 text-indigo-500">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Basic Product Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Men's Cotton T-Shirt"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., Nike, Adidas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Discount (%)</label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe the clothing item..."
          />
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Images *</label>
          {formData.images.map((image, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                placeholder="Image URL"
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Add Image
          </button>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map(tag => (
              <label key={tag} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.tags.includes(tag)}
                  onChange={() => handleTagChange(tag)}
                  className="mr-2"
                />
                <span className="capitalize">{tag}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Featured Product */}
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

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={loading || !formData.gender}
            className={`px-8 py-3 rounded-lg font-medium transition-all ${
              loading || !formData.gender
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? 'Creating...' : 'Create Clothing Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/clothing')}
            className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateClothingProduct;