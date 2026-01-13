import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Create clothing product
export const createClothingProduct = createAsyncThunk(
  'adminClothing/createClothingProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/clothing', productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch admin clothing products
export const fetchAdminClothingProducts = createAsyncThunk(
  'adminClothing/fetchAdminClothingProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/admin/clothing');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const adminClothingSlice = createSlice({
  name: 'adminClothing',
  initialState: {
    products: [],
    loading: false,
    error: null,
    createSuccess: false
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCreateSuccess: (state) => {
      state.createSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createClothingProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createClothingProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.createSuccess = true;
        state.products.unshift(action.payload.product);
      })
      .addCase(createClothingProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAdminClothingProducts.fulfilled, (state, action) => {
        state.products = action.payload.products;
      });
  }
});

export const { clearError, clearCreateSuccess } = adminClothingSlice.actions;
export default adminClothingSlice.reducer;