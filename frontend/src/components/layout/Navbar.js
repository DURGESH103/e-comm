import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../store/slices/authSlice';
import { fetchCart, calculateTotals } from '../../../store/slices/cartSlice';
import Button from '../../ui/buttons/Button';
import Badge from '../../ui/feedback/Badge';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items, totalItems } = useSelector((state) => state.cart);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    dispatch(calculateTotals());
  }, [items, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-slate-900 hidden sm:block">ShopEasy</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products, brands and more..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors duration-200">
              Products
            </Link>
            
            {isAuthenticated ? (
              <>
                {/* Wishlist */}
                <Link to="/wishlist" className="relative p-2 text-slate-600 hover:text-indigo-600 transition-colors duration-200">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative p-2 text-slate-600 hover:text-indigo-600 transition-colors duration-200">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {totalItems > 0 && (
                    <div className="absolute -top-1 -right-1">
                      <Badge variant="danger" size="sm">{totalItems}</Badge>
                    </div>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                        <p className="text-sm text-slate-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        My Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors duration-200"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-2 border-slate-100" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-50 transition-colors duration-200"
          >
            <svg className="h-6 w-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-4 space-y-2">
            <Link
              to="/products"
              className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  className="flex items-center justify-between px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>Cart</span>
                  {totalItems > 0 && <Badge variant="danger" size="sm">{totalItems}</Badge>}
                </Link>
                <Link
                  to="/wishlist"
                  className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <Link
                  to="/orders"
                  className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-xl transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;