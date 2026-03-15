import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAddresses = createAsyncThunk(
  'address/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/address');
      return data.addresses;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

export const addAddress = createAsyncThunk(
  'address/add',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/address', payload);
      return data.address;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to add address');
    }
  }
);

export const updateAddress = createAsyncThunk(
  'address/update',
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/address/${id}`, payload);
      return data.address;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'address/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/address/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete address');
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'address/setDefault',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/address/${id}/default`);
      return data.addresses; // backend returns full refreshed list
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to set default');
    }
  }
);

const addressSlice = createSlice({
  name: 'address',
  initialState: {
    addresses: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearAddressError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending  = (state)         => { state.isLoading = true;  state.error = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      .addCase(fetchAddresses.pending,   pending)
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected,  rejected)

      .addCase(addAddress.pending,   pending)
      .addCase(addAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses.unshift(action.payload);
      })
      .addCase(addAddress.rejected,  rejected)

      .addCase(updateAddress.pending,   pending)
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.addresses.findIndex((a) => a._id === action.payload._id);
        if (idx !== -1) state.addresses[idx] = action.payload;
      })
      .addCase(updateAddress.rejected,  rejected)

      .addCase(deleteAddress.pending,   pending)
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = state.addresses.filter((a) => a._id !== action.payload);
      })
      .addCase(deleteAddress.rejected,  rejected)

      .addCase(setDefaultAddress.pending,   pending)
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addresses = action.payload; // replace with refreshed sorted list
      })
      .addCase(setDefaultAddress.rejected,  rejected);
  },
});

export const { clearAddressError } = addressSlice.actions;
export default addressSlice.reducer;
