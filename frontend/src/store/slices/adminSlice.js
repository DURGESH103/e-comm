import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Admin: Add Product
export const addProduct = createAsyncThunk(
  'admin/addProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/products', productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Admin: Add Category
export const addCategory = createAsyncThunk(
  'admin/addCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/categories', categoryData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Get Categories
export const getCategories = createAsyncThunk(
  'admin/getCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    products: [],
    categories: [],
    loading: false,
    error: null,
    success: false
  },
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.products.unshift(action.payload.product);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload.category);
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
      });
  }
});

export const { clearMessages } = adminSlice.actions;
export default adminSlice.reducer;