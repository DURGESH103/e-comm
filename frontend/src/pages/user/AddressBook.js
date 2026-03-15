import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../../store/slices/addressSlice';
import AddressCard from '../../components/address/AddressCard';
import AddressForm from '../../components/address/AddressForm';

const AddressBook = () => {
  const dispatch = useDispatch();
  const { addresses, isLoading } = useSelector((state) => state.address);

  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);   // address object being edited
  const [deletingId, setDeletingId] = useState(null);
  const [defaultingId, setDefaultingId] = useState(null);

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const handleAdd = async (formData) => {
    const res = await dispatch(addAddress(formData));
    if (res.type.endsWith('/fulfilled')) {
      toast.success('Address saved!');
      setShowForm(false);
    } else {
      toast.error(res.payload || 'Failed to save address');
    }
  };

  const handleUpdate = async (formData) => {
    const res = await dispatch(updateAddress({ id: editing._id, ...formData }));
    if (res.type.endsWith('/fulfilled')) {
      toast.success('Address updated!');
      setEditing(null);
    } else {
      toast.error(res.payload || 'Failed to update address');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    setDeletingId(id);
    const res = await dispatch(deleteAddress(id));
    setDeletingId(null);
    if (res.type.endsWith('/fulfilled')) {
      toast.success('Address deleted');
    } else {
      toast.error(res.payload || 'Failed to delete');
    }
  };

  const handleSetDefault = async (id) => {
    setDefaultingId(id);
    const res = await dispatch(setDefaultAddress(id));
    setDefaultingId(null);
    if (res.type.endsWith('/fulfilled')) {
      toast.success('Default address updated');
    } else {
      toast.error(res.payload || 'Failed to set default');
    }
  };

  const openEdit = (address) => {
    setEditing(address);
    setShowForm(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Addresses</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your saved delivery addresses</p>
        </div>
        {!showForm && !editing && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
                       text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add New Address
          </button>
        )}
      </div>

      {/* ── Add Form ── */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Add New Address</h2>
          <AddressForm onSubmit={handleAdd} onCancel={closeForm} isLoading={isLoading} />
        </div>
      )}

      {/* ── Edit Form ── */}
      {editing && (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-5 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Edit Address</h2>
          <AddressForm initial={editing} onSubmit={handleUpdate} onCancel={closeForm} isLoading={isLoading} />
        </div>
      )}

      {/* ── Address List ── */}
      {isLoading && addresses.length === 0 ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-36 rounded-xl" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500 text-sm">No saved addresses yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 text-blue-600 text-sm font-medium hover:underline"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <AddressCard
              key={addr._id}
              address={addr}
              onEdit={() => openEdit(addr)}
              onDelete={() => handleDelete(addr._id)}
              onSetDefault={() => handleSetDefault(addr._id)}
              isDeleting={deletingId === addr._id}
              isSettingDefault={defaultingId === addr._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressBook;
