import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const StatCard = ({ label, value, color, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, productsRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/products?limit=5&page=1'),
        ]);
        setStats(statsRes.data);
        setRecentProducts(productsRes.data.products || []);
      } catch {
        // stats remain null — UI handles gracefully
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const getOrderCount = (status) =>
    stats?.orders?.find((o) => o._id === status)?.count || 0;

  const totalOrders = stats?.orders?.reduce((sum, o) => sum + o.count, 0) || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Total Products"
          value={isLoading ? '...' : stats?.totalProducts ?? 0}
          color="bg-blue-100 text-blue-600"
          icon="📦"
        />
        <StatCard
          label="Total Orders"
          value={isLoading ? '...' : totalOrders}
          color="bg-green-100 text-green-600"
          icon="🛒"
        />
        <StatCard
          label="Total Users"
          value={isLoading ? '...' : stats?.totalUsers ?? 0}
          color="bg-purple-100 text-purple-600"
          icon="👥"
        />
        <StatCard
          label="Revenue (Delivered)"
          value={isLoading ? '...' : `₹${(stats?.totalRevenue || 0).toLocaleString()}`}
          color="bg-orange-100 text-orange-600"
          icon="💰"
        />
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Order Status Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { status: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
            { status: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
            { status: 'Shipped', color: 'bg-purple-100 text-purple-700' },
            { status: 'Delivered', color: 'bg-green-100 text-green-700' },
            { status: 'Cancelled', color: 'bg-red-100 text-red-700' },
          ].map(({ status, color }) => (
            <div key={status} className={`rounded-lg p-4 text-center ${color}`}>
              <p className="text-2xl font-bold">{isLoading ? '...' : getOrderCount(status)}</p>
              <p className="text-sm font-medium mt-1">{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { to: '/admin/products', icon: '📦', label: 'Products', bg: 'bg-blue-600 hover:bg-blue-700' },
            { to: '/admin/clothing', icon: '👕', label: 'Clothing', bg: 'bg-indigo-600 hover:bg-indigo-700' },
            { to: '/admin/add-product', icon: '➕', label: 'Add Product', bg: 'bg-green-600 hover:bg-green-700' },
            { to: '/admin/categories', icon: '🏷️', label: 'Categories', bg: 'bg-purple-600 hover:bg-purple-700' },
            { to: '/admin/orders', icon: '📋', label: 'Orders', bg: 'bg-orange-600 hover:bg-orange-700' },
          ].map(({ to, icon, label, bg }) => (
            <Link
              key={to}
              to={to}
              className={`${bg} text-white p-4 rounded-lg text-center transition-colors`}
            >
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-sm font-medium">{label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Products</h2>
          <Link to="/admin/products" className="text-sm text-blue-600 hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-gray-600">Product</th>
                <th className="p-3 text-left text-gray-600">Price</th>
                <th className="p-3 text-left text-gray-600">Stock</th>
                <th className="p-3 text-left text-gray-600">Category</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t animate-pulse">
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                  </tr>
                ))
              ) : recentProducts.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-gray-400">No products found</td></tr>
              ) : (
                recentProducts.map((product) => (
                  <tr key={product._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.images?.[0] || '/placeholder.jpg'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="font-medium text-gray-800 truncate max-w-[160px]">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-700">₹{(product.finalPrice || product.price).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{product.category}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
