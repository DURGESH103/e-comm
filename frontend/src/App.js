import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import store from './store';
import { loadUser } from './store/slices/authSlice';
import { patchOrderStatus } from './store/slices/orderSlice';
import { onOrderStatusUpdated, onOrderCreated } from './services/socket';

import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Products from './pages/product/Products';
import ProductDetail from './pages/product/ProductDetail';
import Cart from './pages/cart/Cart';
import Checkout from './pages/cart/Checkout';
import Orders from './pages/user/Orders';
import OrderDetail from './pages/user/OrderDetail';
import Wishlist from './pages/user/Wishlist';
import Profile from './pages/user/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AddProduct from './pages/admin/AddProduct';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminClothingProducts from './pages/admin/AdminClothingProducts';
import CreateClothingProduct from './pages/admin/CreateClothingProduct';
import CategoryPage from './pages/CategoryPage';
import ClothingPage from './pages/ClothingPage';
import MenClothingPage from './pages/MenClothingPage';
import WomenClothingPage from './pages/WomenClothingPage';
import KidsClothingPage from './pages/KidsClothingPage';

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Load user session on mount
  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(loadUser());
    }
  }, [dispatch]);

  // Register real-time socket listeners once authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    onOrderStatusUpdated(({ orderId, status }) => {
      dispatch(patchOrderStatus({ orderId, status }));
      toast.info(`Order status updated to "${status}"`, {
        position: 'top-right',
        autoClose: 5000,
        toastId: `order-status-${orderId}`, // prevent duplicate toasts
      });
    });

    onOrderCreated(({ orderId, totalAmount }) => {
      toast.success(`Order placed successfully! Total: ₹${totalAmount?.toLocaleString()}`, {
        position: 'top-right',
        autoClose: 5000,
        toastId: `order-created-${orderId}`,
      });
    });
  }, [isAuthenticated, dispatch]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/clothing" element={<ClothingPage />} />
            <Route path="/clothing/men" element={<MenClothingPage />} />
            <Route path="/clothing/women" element={<WomenClothingPage />} />
            <Route path="/clothing/kids" element={<KidsClothingPage />} />
            <Route path="/category/:category" element={<CategoryPage />} />

            {/* User Routes */}
            <Route path="/user/home" element={<ProtectedRoute userOnly><Home /></ProtectedRoute>} />
            <Route path="/user/product/:id" element={<ProtectedRoute userOnly><ProductDetail /></ProtectedRoute>} />
            <Route path="/user/cart" element={<ProtectedRoute userOnly><Cart /></ProtectedRoute>} />
            <Route path="/user/wishlist" element={<ProtectedRoute userOnly><Wishlist /></ProtectedRoute>} />
            <Route path="/user/orders" element={<ProtectedRoute userOnly><Orders /></ProtectedRoute>} />

            {/* Legacy routes */}
            <Route path="/cart" element={<ProtectedRoute userOnly><Cart /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute userOnly><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute userOnly><Orders /></ProtectedRoute>} />
            <Route path="/orders/:id" element={<ProtectedRoute userOnly><OrderDetail /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute userOnly><Wishlist /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute userOnly><Profile /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/add-product" element={<ProtectedRoute adminOnly><AddProduct /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute adminOnly><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/clothing" element={<ProtectedRoute adminOnly><AdminClothingProducts /></ProtectedRoute>} />
            <Route path="/admin/clothing/create" element={<ProtectedRoute adminOnly><CreateClothingProduct /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
