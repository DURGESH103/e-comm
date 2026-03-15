import React, { useEffect, useState, useCallback, useRef } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

// ── tiny helpers ──────────────────────────────────────────────────────────────
const fmt = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtTime = (date) =>
  date ? new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never';

// ── sub-components ────────────────────────────────────────────────────────────
const Badge = ({ children, color }) => {
  const colors = {
    green:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    red:    'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
    indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    slate:  'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

const Skeleton = () => (
  <tr className="animate-pulse border-t border-slate-100">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 bg-slate-200 rounded-full" style={{ width: `${[140, 180, 90, 70, 90, 80, 100][i]}px` }} />
      </td>
    ))}
  </tr>
);

// ── Confirm Delete Modal ──────────────────────────────────────────────────────
const DeleteModal = ({ user, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
      <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Delete User</h3>
      <p className="text-sm text-slate-500 text-center mb-6">
        Are you sure you want to permanently delete <span className="font-semibold text-slate-800">{user?.name}</span>?
        This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── User Detail Drawer ────────────────────────────────────────────────────────
const UserDrawer = ({ userId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/users/${userId}`)
      .then((r) => setData(r.data.user))
      .catch(() => toast.error('Failed to load user details'))
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm h-full shadow-2xl overflow-y-auto z-10 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">User Details</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="p-6 space-y-6">
            {/* Avatar + name */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
                {data.name?.charAt(0).toUpperCase()}
              </div>
              <p className="font-bold text-slate-900 text-lg">{data.name}</p>
              <p className="text-sm text-slate-500">{data.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge color={data.role === 'admin' ? 'indigo' : 'slate'}>{data.role}</Badge>
                <Badge color={data.isBlocked ? 'red' : 'green'}>{data.isBlocked ? 'Blocked' : 'Active'}</Badge>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Orders', value: data.orderCount ?? 0 },
                { label: 'Total Spent', value: `₹${(data.totalSpent ?? 0).toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-xl font-black text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Info rows */}
            <div className="space-y-3">
              {[
                { label: 'User ID',   value: data._id },
                { label: 'Joined',    value: fmt(data.createdAt) },
                { label: 'Last Login',value: fmtTime(data.lastLogin) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">{label}</span>
                  <span className="text-sm text-slate-700 text-right break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="p-6 text-center text-slate-500">User not found.</p>
        )}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const AdminUsersPage = () => {
  const [users, setUsers]           = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading]   = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]             = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [viewUserId, setViewUserId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // userId being toggled
  const searchTimer = useRef(null);

  const load = useCallback(async (p = 1, q = search, role = roleFilter, status = statusFilter) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 15 });
      if (q)      params.set('search', q);
      if (role)   params.set('role', role);
      if (status) params.set('status', status);

      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setPagination(data.pagination);
      setPage(p);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => { load(1); }, [roleFilter, statusFilter]); // eslint-disable-line
  useEffect(() => { load(1); }, []); // eslint-disable-line

  // Debounced search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, val, roleFilter, statusFilter), 400);
  };

  const handleToggleBlock = async (user) => {
    setActionLoading(user._id);
    try {
      const { data } = await api.patch(`/admin/users/${user._id}/block`);
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, isBlocked: data.isBlocked } : u));
      toast.success(data.message);
    } catch {
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);
      toast.success('User deleted successfully');
      setDeleteTarget(null);
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalActive  = users.filter((u) => !u.isBlocked).length;
  const totalBlocked = users.filter((u) => u.isBlocked).length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pagination.total} total users · {totalActive} active · {totalBlocked} blocked
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
          />
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['User', 'Email', 'Role', 'Joined', 'Last Login', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="text-4xl mb-3">👥</div>
                    <p className="text-slate-500 font-medium">No users found</p>
                    {search && <p className="text-slate-400 text-xs mt-1">Try a different search term</p>}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    {/* User */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800 truncate max-w-[120px]">{user.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3.5 text-slate-600 truncate max-w-[180px]">{user.email}</td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <Badge color={user.role === 'admin' ? 'indigo' : 'slate'}>{user.role}</Badge>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{fmt(user.createdAt)}</td>

                    {/* Last Login */}
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{fmtTime(user.lastLogin)}</td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <Badge color={user.isBlocked ? 'red' : 'green'}>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {/* View */}
                        <button
                          onClick={() => setViewUserId(user._id)}
                          title="View details"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>

                        {/* Block / Unblock — disabled for admins */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBlock(user)}
                            disabled={actionLoading === user._id}
                            title={user.isBlocked ? 'Unblock user' : 'Block user'}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50
                              ${user.isBlocked
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                              }`}
                          >
                            {actionLoading === user._id ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : user.isBlocked ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zM10 11V7a2 2 0 114 0v4" />
                              </svg>
                            )}
                          </button>
                        )}

                        {/* Delete — disabled for admins */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => setDeleteTarget(user)}
                            title="Delete user"
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-500">
              Page {pagination.current} of {pagination.pages} · {pagination.total} users
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => load(page - 1)}
                disabled={page === 1 || isLoading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-xs text-slate-400">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => load(p)}
                      disabled={isLoading}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors
                        ${p === page
                          ? 'bg-indigo-600 text-white border border-indigo-600'
                          : 'border border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                onClick={() => load(page + 1)}
                disabled={page === pagination.pages || isLoading}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* User detail drawer */}
      {viewUserId && (
        <UserDrawer userId={viewUserId} onClose={() => setViewUserId(null)} />
      )}
    </div>
  );
};

export default AdminUsersPage;
