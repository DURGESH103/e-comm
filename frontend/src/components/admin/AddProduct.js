import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct, addCategory, getCategories } from '../../store/slices/adminSlice';

const AddProduct = () => {
  const dispatch = useDispatch();
  const { categories, loading, error, success } = useSelector(state => state.admin);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount: 0,
    stock: '',
    category: '',
    brand: '',
    images: [''],
    tags: [],
    isFeatured: false
  });

  const [newCategory, setNewCategory] = useState('');
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addProduct(formData));
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    dispatch(addCategory({ name: newCategory }));
    setNewCategory('');
    setShowCategoryForm(false);
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageField = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Product added successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <input
              type="text"
              required
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock
            </label>
            <input
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="flex gap-2">
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {showCategoryForm && (
          <div className="p-4 bg-gray-50 rounded-md">
            <form onSubmit={handleCategorySubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Add
              </button>
            </form>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            required
            rows="4"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Images
          </label>
          {formData.images.map((image, index) => (
            <div key={index} className="mb-2">
              <input
                type="url"
                placeholder="Image URL"
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="text-blue-500 hover:text-blue-700"
          >
            + Add Another Image
          </button>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
            Featured Product
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;