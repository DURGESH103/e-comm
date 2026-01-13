import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch Products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch Single Product
export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch Categories
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    currentProduct: null,
    categories: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      category: '',
      minPrice: '',
      maxPrice: ''
    },
    pagination: {
      current: 1,
      pages: 1,
      total: 0
    }
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload.product;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
      });
  }
});

export const { clearError, setFilters } = productSlice.actions;
export default productSlice.reducer;