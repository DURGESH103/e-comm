import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { fetchCart, calculateTotals } from '../../store/slices/cartSlice';
import { fetchCategories } from '../../store/slices/productSlice';

const categoryIcons = {
  Electronics: '📱', Clothing: '👕', Books: '📚',
  Home: '🏠', Sports: '⚽', Beauty: '💄', Toys: '🧸'
};

const getCategoryPath = (category) =>
  category.toLowerCase() === 'clothing'
    ? '/clothing'
    : `/category/${category.toLowerCase()}`;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lastScrollY = useRef(0);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items, totalItems } = useSelector((state) => state.cart);
  const { categories } = useSelector((state) => state.products);
  const location = useLocation();

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    setScrolled(currentY > 60);
    lastScrollY.current = currentY;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    dispatch(calculateTotals());
  }, [items, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">ShopEasy</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="w-full">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    navigate(`/products?search=${e.target.value}`);
                  }
                }}
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-gray-700 hover:text-primary-600">
              Products
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative text-gray-700 hover:text-primary-600">
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <Link to="/wishlist" className="text-gray-700 hover:text-primary-600">
                  Wishlist
                </Link>
                <Link to="/orders" className="text-gray-700 hover:text-primary-600">
                  Orders
                </Link>
                
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center text-gray-700 hover:text-primary-600"
                  >
                    <span>{user?.name}</span>
                    <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/products" className="block px-3 py-2 text-gray-700">
                Products
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/cart" className="block px-3 py-2 text-gray-700">
                    Cart ({totalItems})
                  </Link>
                  <Link to="/wishlist" className="block px-3 py-2 text-gray-700">
                    Wishlist
                  </Link>
                  <Link to="/orders" className="block px-3 py-2 text-gray-700">
                    Orders
                  </Link>
                  <Link to="/profile" className="block px-3 py-2 text-gray-700">
                    Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="block px-3 py-2 text-gray-700">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 text-gray-700">
                    Login
                  </Link>
                  <Link to="/register" className="block px-3 py-2 text-gray-700">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Category Nav Bar */}
      <div
        className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t border-slate-200 overflow-hidden"
        style={{
          boxShadow: '0 2px 8px 0 rgba(99,102,241,0.06)',
          transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), padding 0.35s cubic-bezier(0.4,0,0.2,1)',
          maxHeight: scrolled ? '44px' : '90px',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between md:justify-center overflow-x-auto scrollbar-hide gap-1"
            style={{
              transition: 'padding 0.35s cubic-bezier(0.4,0,0.2,1)',
              padding: scrolled ? '6px 0' : '8px 0',
            }}
          >
            {categories.map((category) => {
              const href = getCategoryPath(category);
              const active = location.pathname === href;
              return (
                <Link
                  key={category}
                  to={href}
                  className={`group flex-shrink-0 flex items-center rounded-2xl transition-all duration-300
                    ${ active
                      ? 'bg-indigo-50 shadow-md shadow-indigo-100'
                      : 'hover:bg-white hover:shadow-md hover:shadow-slate-200'
                    }`}
                  style={{
                    flexDirection: scrolled ? 'row' : 'column',
                    gap: scrolled ? '6px' : '6px',
                    padding: scrolled ? '4px 12px' : '8px 16px',
                    transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                  }}
                >
                  <div
                    className={`rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                      ${ active
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-200'
                        : 'bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-indigo-100 group-hover:to-purple-100'
                      }`}
                    style={{
                      width: scrolled ? '26px' : '44px',
                      height: scrolled ? '26px' : '44px',
                      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  >
                    <span
                      className="leading-none transition-all duration-300"
                      style={{ fontSize: scrolled ? '13px' : '20px' }}
                    >
                      {categoryIcons[category] || '📦'}
                    </span>
                  </div>
                  <span
                    className={`font-semibold whitespace-nowrap tracking-wide transition-all duration-300
                      ${active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-600'}`}
                    style={{ fontSize: scrolled ? '11px' : '11px' }}
                  >
                    {category}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;