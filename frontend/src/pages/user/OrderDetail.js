import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../../store/slices/orderSlice';
import Loading from '../../components/common/Loading';

const OrderDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentOrder: order, isLoading } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'Confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'Shipped':
        return 'text-purple-600 bg-purple-100';
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading || !order) {
    return <Loading text="Loading order details..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link to="/orders" className="text-primary-600 hover:text-primary-700">
          ← Back to Orders
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Order Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order._id.slice(-8)}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => {
              // Safety check - skip items with null products
              if (!item.product || !item.product.images) {
                return null;
              }
              
              return (
              <div key={item.product._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <img
                  src={item.product.images[0] || '/placeholder.jpg'}
                  alt={item.product.name || 'Product'}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div className="flex-1">
                  <Link
                    to={`/products/${item.product._id}`}
                    className="text-lg font-medium text-gray-900 hover:text-primary-600"
                  >
                    {item.product.name || 'Unknown Product'}
                  </Link>
                  <p className="text-gray-600 mt-1">{item.product.description || 'No description'}</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                    <span className="text-sm text-gray-600">Price: ₹{(item.price || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">
                    ₹{((item.price || 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Shipping Address */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{order.shippingAddress.name}</p>
            <p className="text-gray-600">{order.shippingAddress.phone}</p>
            <p className="text-gray-600 mt-2">
              {order.shippingAddress.address}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({order.items.length} items)</span>
              <span>₹{order.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="flex justify-between text-lg font-semibold border-t pt-2">
              <span>Total</span>
              <span>₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Payment Method</p>
                <p className="text-gray-600">Cash on Delivery</p>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.paymentStatus === 'Completed' 
                    ? 'text-green-600 bg-green-100' 
                    : 'text-yellow-600 bg-yellow-100'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Tracking */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Order Tracking</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-4"></div>
            <div>
              <p className="font-medium">Order Placed</p>
              <p className="text-gray-600 text-sm">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-4 ${
              ['Confirmed', 'Shipped', 'Delivered'].includes(order.status) 
                ? 'bg-green-500' 
                : 'bg-gray-300'
            }`}></div>
            <div>
              <p className="font-medium">Order Confirmed</p>
              <p className="text-gray-600 text-sm">
                {['Confirmed', 'Shipped', 'Delivered'].includes(order.status) 
                  ? 'Confirmed' 
                  : 'Pending confirmation'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-4 ${
              ['Shipped', 'Delivered'].includes(order.status) 
                ? 'bg-green-500' 
                : 'bg-gray-300'
            }`}></div>
            <div>
              <p className="font-medium">Shipped</p>
              <p className="text-gray-600 text-sm">
                {['Shipped', 'Delivered'].includes(order.status) 
                  ? 'Your order is on the way' 
                  : 'Not shipped yet'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-4 ${
              order.status === 'Delivered' 
                ? 'bg-green-500' 
                : 'bg-gray-300'
            }`}></div>
            <div>
              <p className="font-medium">Delivered</p>
              <p className="text-gray-600 text-sm">
                {order.status === 'Delivered' 
                  ? 'Order delivered successfully' 
                  : 'Not delivered yet'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;