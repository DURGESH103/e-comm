import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../../store/slices/orderSlice';
import { fetchCart, calculateTotals } from '../../store/slices/cartSlice';
import { fetchAddresses, addAddress } from '../../store/slices/addressSlice';
import AddressCard from '../../components/address/AddressCard';
import AddressForm from '../../components/address/AddressForm';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';

const Checkout = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const { items, totalAmount, totalItems }    = useSelector((s) => s.cart);
  const { isLoading: orderLoading }           = useSelector((s) => s.orders);
  const { addresses, isLoading: addrLoading } = useSelector((s) => s.address);

  const [selectedId, setSelectedId]   = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);

  useEffect(() => { dispatch(fetchCart()); },     [dispatch]);
  useEffect(() => { dispatch(fetchAddresses()); }, [dispatch]);
  useEffect(() => { dispatch(calculateTotals()); }, [items, dispatch]);

  // Auto-select default address once loaded
  useEffect(() => {
    if (addresses.length > 0 && !selectedId) {
      const def = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedId(def._id);
    }
  }, [addresses, selectedId]);

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items, navigate]);

  const handleAddNew = async (formData) => {
    const res = await dispatch(addAddress(formData));
    if (res.type.endsWith('/fulfilled')) {
      toast.success('Address saved!');
      setSelectedId(res.payload._id);
      setShowNewForm(false);
    } else {
      toast.error(res.payload || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedId) {
      toast.error('Please select a delivery address');
      return;
    }
    const addr = addresses.find((a) => a._id === selectedId);
    if (!addr) return;

    // Build shippingAddress in the shape the existing orderController expects
    const shippingAddress = {
      name:    addr.fullName,
      phone:   addr.phone,
      address: `${addr.houseNumber}, ${addr.street}`,
      city:    addr.city,
      state:   addr.state,
      pincode: addr.pincode,
    };

    const res = await dispatch(createOrder({ shippingAddress }));
    if (res.type.endsWith('/fulfilled')) {
      toast.success('Order placed successfully!');
      navigate(`/orders/${res.payload.order._id}`);
    } else {
      toast.error(res.payload || 'Failed to place order');
    }
  };

  if (items.length === 0) return <Loading text="Loading…" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── LEFT: Delivery Address ── */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Delivery Address</h2>
              <button
                onClick={() => setShowNewForm((v) => !v)}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                {showNewForm ? 'Cancel' : '+ Add New'}
              </button>
            </div>

            {/* Inline add-new form */}
            {showNewForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <AddressForm
                  onSubmit={handleAddNew}
                  onCancel={() => setShowNewForm(false)}
                  isLoading={addrLoading}
                />
              </div>
            )}

            {/* Saved addresses */}
            {addrLoading && addresses.length === 0 ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
              </div>
            ) : addresses.length === 0 && !showNewForm ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                <p>No saved addresses.</p>
                <button
                  onClick={() => setShowNewForm(true)}
                  className="mt-2 text-blue-600 font-medium hover:underline"
                >
                  Add an address to continue
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <AddressCard
                    key={addr._id}
                    address={addr}
                    selectable
                    selected={selectedId === addr._id}
                    onSelect={() => setSelectedId(addr._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-5">
              {items.map((item) => (
                <div key={item.product._id} className="flex items-center gap-3">
                  <img
                    src={item.product.images?.[0]}
                    alt={item.product.name}
                    className="w-14 h-14 object-contain rounded-lg border border-gray-100 bg-gray-50"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items ({totalItems})</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-3 text-gray-900">
                <span>Total</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
              <strong className="text-gray-700">Payment:</strong> Cash on Delivery
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading || !selectedId}
              className="w-full mt-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold
                         rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {orderLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Placing Order…
                </span>
              ) : 'Place Order'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
