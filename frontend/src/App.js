import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import store from './store';
import { loadUser } from './store/slices/authSlice';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
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

function AppContent() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(loadUser());
    }
  }, []);

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
            
            {/* User Protected Routes */}
            <Route path="/cart" element={
              <ProtectedRoute userOnly>
                <Cart />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute userOnly>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute userOnly>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute userOnly>
                <OrderDetail />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute userOnly>
                <Wishlist />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute userOnly>
                <Profile />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/*" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
        
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
        />
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