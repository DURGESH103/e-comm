import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../store/slices/orderSlice';
import Loading from '../../components/common/Loading';

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_COLORS = {
  Pending: 'text-yellow-600 bg-yellow-100',
  Confirmed: 'text-blue-600 bg-blue-100',
  Shipped: 'text-purple-600 bg-purple-100',
  Delivered: 'text-green-600 bg-green-100',
  Cancelled: 'text-red-600 bg-red-100',
};

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.orders);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const filtered = activeTab === 'All' ? orders : orders.filter((o) => o.status === activeTab);

  if (isLoading) return <Loading text="Loading orders..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {STATUS_TABS.map((tab) => {
          const count = tab === 'All' ? orders.length : orders.filter((o) => o.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {activeTab === 'All' ? 'No orders yet' : `No ${activeTab} orders`}
          </h2>
          <p className="text-gray-500 mb-6">
            {activeTab === 'All' ? 'Start shopping to see your orders here!' : 'Nothing to show for this status.'}
          </p>
          {activeTab === 'All' && (
            <Link to="/products" className="btn-primary">Start Shopping</Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <div>
                    <span className="text-xs text-gray-400 font-mono">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status] || 'text-gray-600 bg-gray-100'}`}>
                    {order.status}
                  </span>
                </div>

                {/* Items preview */}
                <div className="flex items-center gap-3 mb-4">
                  {order.items.slice(0, 3).map((item) => {
                    if (!item.product?.images) return null;
                    return (
                      <img
                        key={item.product._id}
                        src={item.product.images[0] || '/placeholder.jpg'}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-lg border border-gray-100"
                      />
                    );
                  })}
                  {order.items.length > 3 && (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-500 font-medium">
                      +{order.items.length - 3}
                    </div>
                  )}
                  <div className="ml-2">
                    <p className="text-sm font-medium text-gray-800">
                      {order.items[0]?.product?.name || 'Product'}
                      {order.items.length > 1 && ` & ${order.items.length - 1} more`}
                    </p>
                    <p className="text-xs text-gray-400">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <p className="font-semibold text-gray-900">
                    ₹{order.totalAmount.toLocaleString()}
                  </p>
                  <Link
                    to={`/orders/${order._id}`}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
