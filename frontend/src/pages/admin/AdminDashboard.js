import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const STAT_CONFIG = [
  { key: 'products', label: 'Total Products', icon: '📦', bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
  { key: 'orders',   label: 'Total Orders',   icon: '📋', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  { key: 'users',    label: 'Total Users',    icon: '👥', bg: 'bg-violet-50',  text: 'text-violet-600',  border: 'border-violet-100' },
  { key: 'revenue',  label: 'Revenue',        icon: '💰', bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-100' },
];

const ORDER_STATUSES = [
  { status: 'Pending',   bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dot: 'bg-yellow-400' },
  { status: 'Confirmed', bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-400' },
  { status: 'Shipped',   bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-400' },
  { status: 'Delivered', bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-400' },
  { status: 'Cancelled', bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   dot: 'bg-rose-400' },
];

const QUICK_ACTIONS = [
  { to: '/admin/products',    icon: '📦', label: 'Products',    desc: 'Manage inventory',   bg: 'from-blue-500 to-blue-600' },
  { to: '/admin/add-product', icon: '➕', label: 'Add Product', desc: 'Create new listing',  bg: 'from-emerald-500 to-emerald-600' },
  { to: '/admin/orders',      icon: '📋', label: 'Orders',      desc: 'View & update orders',bg: 'from-orange-500 to-orange-600' },
  { to: '/admin/users',       icon: '👥', label: 'Users',       desc: 'Manage accounts',    bg: 'from-violet-500 to-violet-600' },
  { to: '/admin/categories',  icon: '🏷️', label: 'Categories',  desc: 'Browse categories',  bg: 'from-pink-500 to-pink-600' },
];

/* ── skeleton ── */
const StatSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-10 h-10 bg-slate-200 rounded-xl" />
      <div className="w-16 h-3 bg-slate-200 rounded-full" />
    </div>
    <div className="w-20 h-7 bg-slate-200 rounded-full mb-1" />
    <div className="w-24 h-3 bg-slate-200 rounded-full" />
  </div>
);

const TableSkeleton = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="border-t border-slate-100 animate-pulse">
        <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-200 rounded-lg flex-shrink-0" /><div className="h-4 bg-slate-200 rounded-full w-32" /></div></td>
        <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded-full w-16" /></td>
        <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded-full w-10" /></td>
        <td className="px-4 py-3"><div className="h-4 bg-slate-200 rounded-full w-20" /></td>
      </tr>
    ))}
  </>
);

const AdminDashboard = () => {
  const [stats, setStats]               = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [isLoading, setIsLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, productsRes] = await Promise.all([
          api.get('/admin/dashboard/stats'),
          api.get('/admin/products?limit=5&page=1'),
        ]);
        setStats(statsRes.data);
        setRecentProducts(productsRes.data.products || []);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const totalOrders   = stats?.orders?.reduce((s, o) => s + o.count, 0) || 0;
  const getCount      = (status) => stats?.orders?.find((o) => o._id === status)?.count || 0;

  const statValues = {
    products: stats?.totalProducts ?? 0,
    orders:   totalOrders,
    users:    stats?.totalUsers ?? 0,
    revenue:  `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back — here's what's happening today.</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : STAT_CONFIG.map(({ key, label, icon, bg, text, border }) => (
            <div key={key} className={`bg-white rounded-2xl border ${border} p-5 hover:shadow-md transition-shadow duration-200`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center text-xl`}>
                  {icon}
                </div>
                <span className={`text-xs font-semibold ${text} ${bg} px-2 py-1 rounded-full`}>
                  {label}
                </span>
              </div>
              <p className={`text-2xl font-black ${text}`}>{statValues[key]}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))
        }
      </div>

      {/* ── Order status + Quick actions (side by side on lg) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Order Status Breakdown — 3 cols */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">Order Status</h2>
            <Link to="/admin/orders" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {ORDER_STATUSES.map(({ status, bg, text, border, dot }) => (
              <div key={status} className={`${bg} border ${border} rounded-xl p-3 text-center`}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                </div>
                <p className={`text-xl font-black ${text}`}>
                  {isLoading ? '—' : getCount(status)}
                </p>
                <p className={`text-[11px] font-semibold ${text} mt-0.5`}>{status}</p>
              </div>
            ))}
          </div>

          {/* Revenue highlight */}
          <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl px-4 py-3">
            <div>
              <p className="text-xs font-semibold text-emerald-600">Delivered Revenue</p>
              <p className="text-lg font-black text-emerald-700">
                {isLoading ? '—' : `₹${(stats?.totalRevenue || 0).toLocaleString()}`}
              </p>
            </div>
            <span className="text-2xl">💰</span>
          </div>
        </div>

        {/* Quick Actions — 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {QUICK_ACTIONS.map(({ to, icon, label, desc, bg }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${bg} text-white hover:opacity-90 hover:shadow-md transition-all duration-200 group`}
              >
                <span className="text-xl w-8 text-center flex-shrink-0">{icon}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight">{label}</p>
                  <p className="text-[11px] text-white/75 truncate">{desc}</p>
                </div>
                <svg className="w-4 h-4 ml-auto flex-shrink-0 opacity-60 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Products ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Recent Products</h2>
          <Link to="/admin/products" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Product', 'Price', 'Stock', 'Category'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeleton />
              ) : recentProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <div className="text-3xl mb-2">📦</div>
                    <p className="text-slate-400 text-sm">No products yet</p>
                  </td>
                </tr>
              ) : (
                recentProducts.map((p) => (
                  <tr key={p._id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images?.[0] || '/placeholder.jpg'} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-100 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate max-w-[160px]">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      ₹{(p.finalPrice || p.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${p.stock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                        {p.category}
                      </span>
                    </td>
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
