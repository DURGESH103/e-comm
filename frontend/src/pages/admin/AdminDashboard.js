import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../store/slices/productSlice';
import api from '../../services/api';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      setStats({
        totalProducts: products.length,
        totalOrders: 45,
        totalRevenue: 125000
      });
    }
  }, [products]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-3xl font-bold text-blue-600">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">₹{stats.totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/admin/products"
            className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
          >
            <div className="text-2xl mb-2">📦</div>
            <div>Manage Products</div>
          </Link>
          <Link
            to="/admin/clothing"
            className="bg-indigo-600 text-white p-4 rounded-lg text-center hover:bg-indigo-700 transition-colors"
          >
            <div className="text-2xl mb-2">👕</div>
            <div>Clothing Products</div>
          </Link>
          <Link
            to="/admin/add-product"
            className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors"
          >
            <div className="text-2xl mb-2">➕</div>
            <div>Add Product</div>
          </Link>
          <Link
            to="/admin/categories"
            className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
          >
            <div className="text-2xl mb-2">🏷️</div>
            <div>Categories</div>
          </Link>
          <Link
            to="/admin/orders"
            className="bg-orange-600 text-white p-4 rounded-lg text-center hover:bg-orange-700 transition-colors"
          >
            <div className="text-2xl mb-2">📋</div>
            <div>Orders</div>
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Products</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Product</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Category</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 5).map((product) => (
                <tr key={product._id} className="border-t">
                  <td className="p-3 flex items-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded mr-3"
                    />
                    {product.name}
                  </td>
                  <td className="p-3">₹{product.finalPrice || product.price}</td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3">{product.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;