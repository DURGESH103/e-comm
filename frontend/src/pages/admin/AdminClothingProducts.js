import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminClothingProducts } from '../../store/slices/adminClothingSlice';

const AdminClothingProducts = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.adminClothing);

  useEffect(() => {
    dispatch(fetchAdminClothingProducts());
  }, [dispatch]);

  const getGenderIcon = (subCategory) => {
    switch (subCategory) {
      case 'Men': return '👨';
      case 'Women': return '👩';
      case 'Kids': return '👶';
      default: return '👕';
    }
  };

  const getGenderColor = (subCategory) => {
    switch (subCategory) {
      case 'Men': return 'bg-blue-100 text-blue-800';
      case 'Women': return 'bg-pink-100 text-pink-800';
      case 'Kids': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clothing Products</h1>
          <p className="text-gray-600 mt-1">Manage your clothing inventory</p>
        </div>
        <Link
          to="/admin/clothing/create"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Clothing Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👕</div>
            <div>
              <p className="text-sm text-gray-600">Total Clothing</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👨</div>
            <div>
              <p className="text-sm text-gray-600">Men's Items</p>
              <p className="text-2xl font-bold text-blue-600">
                {products.filter(p => p.subCategory === 'Men').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👩</div>
            <div>
              <p className="text-sm text-gray-600">Women's Items</p>
              <p className="text-2xl font-bold text-pink-600">
                {products.filter(p => p.subCategory === 'Women').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👶</div>
            <div>
              <p className="text-sm text-gray-600">Kids Items</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.subCategory === 'Kids').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Clothing Products</h2>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👕</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No clothing products yet</h3>
            <p className="text-gray-600 mb-6">Start by adding your first clothing product</p>
            <Link
              to="/admin/clothing/create"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add First Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={product.images[0]}
                          alt={product.name}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getGenderIcon(product.subCategory)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.category}</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGenderColor(product.subCategory)}`}>
                            {product.subCategory}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{product.finalPrice || product.price}</div>
                      {product.discount > 0 && (
                        <div className="text-sm text-gray-500 line-through">₹{product.price}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock} units
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClothingProducts;