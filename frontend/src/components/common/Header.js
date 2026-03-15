import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { fetchCart, calculateTotals } from '../../store/slices/cartSlice';
import { fetchCategories } from '../../store/slices/productSlice';

const categoryIcons = {
  Electronics: '📱', Clothing: '👕', Books: '📚',
  Home: '🏠', Sports: '⚽', Beauty: '💄', Toys: '🧸',
};

const getCategoryPath = (category) =>
  category.toLowerCase() === 'clothing'
    ? '/clothing'
    : `/category/${category.toLowerCase()}`;

/* ── tiny reusable icon components ── */
const IconSearch = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const IconHeart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const IconCart = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
const IconOrders = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const IconChevron = ({ open }) => (
  <svg
    className="w-3.5 h-3.5 transition-transform duration-200"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
  </svg>
);
const IconMenu = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const IconClose = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/* ── Badge ── */
const Badge = ({ count }) =>
  count > 0 ? (
    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
      {count > 99 ? '99+' : count}
    </span>
  ) : null;

/* ── NavIconBtn ── */
const NavIconBtn = ({ to, label, icon, badge = 0 }) => (
  <Link
    to={to}
    className="relative flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 group"
  >
    <span className="relative">
      {icon}
      <Badge count={badge} />
    </span>
    <span className="text-[10px] font-medium whitespace-nowrap group-hover:text-indigo-600 transition-colors duration-200">
      {label}
    </span>
  </Link>
);

const EASE = 'cubic-bezier(0.4,0,0.2,1)';

const Header = () => {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled]       = useState(false);

  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const profileRef = useRef(null);
  const lastScrollY = useRef(0);

  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const { items, totalItems }     = useSelector((s) => s.cart);
  const { categories }            = useSelector((s) => s.products);

  /* scroll detection */
  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    setScrolled(y > 60);
    lastScrollY.current = y;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* close profile dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);
  useEffect(() => { if (isAuthenticated) dispatch(fetchCart()); }, [dispatch, isAuthenticated]);
  useEffect(() => { dispatch(calculateTotals()); }, [items, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate('/');
  };

  const avatar = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <header className="sticky top-0 z-50 bg-white" style={{ boxShadow: '0 1px 0 0 #e2e8f0, 0 4px 16px 0 rgba(15,23,42,0.06)' }}>

      {/* ── TOP BAR ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
              <span className="text-white font-black text-sm">S</span>
            </div>
            <span className="hidden sm:block text-xl font-black tracking-tight text-slate-900">
              Shop<span className="text-indigo-600">Easy</span>
            </span>
          </Link>

          {/* Search — desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-2xl mx-auto"
          >
            <div className="relative w-full group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-200">
                <IconSearch />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands and categories…"
                className="w-full pl-11 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-4 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-2xl transition-colors duration-200"
              >
                <IconSearch />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">

            {isAuthenticated ? (
              <>
                <NavIconBtn to="/wishlist" label="Wishlist" icon={<IconHeart />} />
                <NavIconBtn to="/cart"     label="Cart"     icon={<IconCart />}  badge={totalItems} />
                <NavIconBtn to="/orders"   label="Orders"   icon={<IconOrders />} />

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((o) => !o)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0">
                      <span className="text-white text-sm font-bold">{avatar}</span>
                    </div>
                    <div className="hidden lg:flex flex-col items-start leading-tight">
                      <span className="text-[10px] text-slate-400 font-medium">Hello,</span>
                      <span className="text-xs font-semibold text-slate-800 max-w-[80px] truncate">{user?.name}</span>
                    </div>
                    <span className="hidden lg:block text-slate-400 group-hover:text-slate-600 transition-colors">
                      <IconChevron open={profileOpen} />
                    </span>
                  </button>

                  {/* Dropdown panel */}
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-100 py-2 z-50"
                    style={{
                      boxShadow: '0 8px 32px rgba(15,23,42,0.12)',
                      transition: `opacity 0.18s ${EASE}, transform 0.18s ${EASE}`,
                      opacity: profileOpen ? 1 : 0,
                      transform: profileOpen ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.97)',
                      pointerEvents: profileOpen ? 'auto' : 'none',
                    }}
                  >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100 mb-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    {[
                      { to: '/profile', label: 'My Profile',  emoji: '👤' },
                      { to: '/orders',  label: 'My Orders',   emoji: '📦' },
                      { to: '/wishlist',label: 'Wishlist',    emoji: '❤️' },
                    ].map(({ to, label, emoji }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                      >
                        <span className="text-base">{emoji}</span>
                        {label}
                      </Link>
                    ))}

                    {user?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                      >
                        <span className="text-base">⚙️</span>
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors duration-150"
                      >
                        <span className="text-base">🚪</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="hidden sm:block px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-200 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors duration-200 ml-1"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>

        {/* Search — mobile */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <IconSearch />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all duration-200"
            />
          </form>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <div
        className="md:hidden overflow-hidden border-t border-slate-100"
        style={{
          maxHeight: mobileOpen ? '420px' : '0px',
          transition: `max-height 0.3s ${EASE}`,
        }}
      >
        <div className="px-4 py-3 space-y-1 bg-white">
          {isAuthenticated ? (
            <>
              {/* User info strip */}
              <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-indigo-50 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>

              {[
                { to: '/profile',  label: 'My Profile',  emoji: '👤' },
                { to: '/orders',   label: 'My Orders',   emoji: '📦' },
                { to: '/wishlist', label: 'Wishlist',    emoji: '❤️' },
                { to: '/cart',     label: `Cart (${totalItems})`, emoji: '🛒' },
              ].map(({ to, label, emoji }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                >
                  <span>{emoji}</span>{label}
                </Link>
              ))}

              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                >
                  <span>⚙️</span> Admin Dashboard
                </Link>
              )}

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors duration-150"
                >
                  <span>🚪</span> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2 py-2">
              <Link to="/login"    className="px-4 py-2.5 text-center text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors duration-150">Sign In</Link>
              <Link to="/register" className="px-4 py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors duration-150">Sign Up</Link>
            </div>
          )}
        </div>
      </div>

      {/* ── CATEGORY BAR ── */}
      <div
        className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border-t border-slate-100 overflow-hidden"
        style={{
          boxShadow: '0 2px 8px 0 rgba(99,102,241,0.05)',
          maxHeight: scrolled ? '42px' : '88px',
          transition: `max-height 0.35s ${EASE}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="flex items-center justify-between md:justify-center overflow-x-auto scrollbar-hide gap-0.5"
            style={{
              padding: scrolled ? '5px 0' : '8px 0',
              transition: `padding 0.35s ${EASE}`,
            }}
          >
            {categories.map((category) => {
              const href   = getCategoryPath(category);
              const active = location.pathname === href;
              return (
                <Link
                  key={category}
                  to={href}
                  className={`group flex-shrink-0 flex items-center rounded-2xl transition-all duration-300
                    ${active
                      ? 'bg-indigo-50 shadow-sm shadow-indigo-100'
                      : 'hover:bg-white hover:shadow-md hover:shadow-slate-200 hover:-translate-y-px'
                    }`}
                  style={{
                    flexDirection: scrolled ? 'row' : 'column',
                    gap:           scrolled ? '5px' : '5px',
                    padding:       scrolled ? '4px 10px' : '6px 14px',
                    transition:    `all 0.35s ${EASE}`,
                  }}
                >
                  {/* Icon bubble */}
                  <div
                    className={`rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
                      ${active
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md shadow-indigo-200'
                        : 'bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-indigo-100 group-hover:to-purple-100'
                      }`}
                    style={{
                      width:      scrolled ? '24px' : '42px',
                      height:     scrolled ? '24px' : '42px',
                      transition: `all 0.35s ${EASE}`,
                    }}
                  >
                    <span
                      className="leading-none transition-all duration-300 group-hover:scale-110"
                      style={{ fontSize: scrolled ? '12px' : '19px' }}
                    >
                      {categoryIcons[category] ?? '📦'}
                    </span>
                  </div>

                  {/* Label */}
                  <span
                    className={`font-semibold whitespace-nowrap tracking-wide transition-colors duration-200
                      ${active ? 'text-indigo-600' : 'text-slate-500 group-hover:text-indigo-600'}`}
                    style={{ fontSize: '11px' }}
                  >
                    {category}
                  </span>

                  {/* Active underline (expanded only) */}
                  {!scrolled && active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-500 rounded-full" />
                  )}
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
