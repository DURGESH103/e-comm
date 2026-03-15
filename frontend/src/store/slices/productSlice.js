import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

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

export const fetchProductsByTag = createAsyncThunk(
  'products/fetchProductsByTag',
  async (tag, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', { params: { tags: tag, limit: 10 } });
      return { tag, products: response.data.products };
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetches products in the same category, excludes current product client-side
export const fetchRelatedProducts = createAsyncThunk(
  'products/fetchRelatedProducts',
  async ({ category, excludeId }, { rejectWithValue }) => {
    try {
      const response = await api.get('/products', {
        params: { category, limit: 12 },
      });
      const filtered = response.data.products.filter((p) => p._id !== excludeId);
      return filtered.slice(0, 10);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message ?? 'Failed');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    currentProduct: null,
    relatedProducts: [],
    relatedLoading: false,
    categories: [],
    taggedProducts: {},
    tagLoading: {},
    loading: false,
    error: null,
    pagination: { current: 1, pages: 1, total: 0 },
  },
  reducers: {
    clearError:           (state) => { state.error = null; },
    clearRelatedProducts: (state) => { state.relatedProducts = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending,   (state)         => { state.loading = true;  state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading    = false;
        state.products   = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchProduct.fulfilled,  (state, action) => { state.currentProduct = action.payload.product; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload.categories; })
      .addCase(fetchProductsByTag.pending, (state, action) => {
        state.tagLoading[action.meta.arg] = true;
      })
      .addCase(fetchProductsByTag.fulfilled, (state, action) => {
        const { tag, products } = action.payload;
        state.taggedProducts[tag] = products;
        state.tagLoading[tag]     = false;
      })
      .addCase(fetchProductsByTag.rejected, (state, action) => {
        state.tagLoading[action.meta.arg] = false;
      })
      .addCase(fetchRelatedProducts.pending,   (state)         => { state.relatedLoading = true; })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.relatedLoading  = false;
        state.relatedProducts = action.payload;
      })
      .addCase(fetchRelatedProducts.rejected,  (state)         => { state.relatedLoading = false; });
  },
});

export const { clearError, clearRelatedProducts } = productSlice.actions;
export default productSlice.reducer;
