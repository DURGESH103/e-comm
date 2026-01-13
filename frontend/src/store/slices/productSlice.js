import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch Products (keep for general use)
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

// Fetch Clothing Products
export const fetchClothingProducts = createAsyncThunk(
  'products/fetchClothingProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/clothing');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch Men Clothing
export const fetchMenClothing = createAsyncThunk(
  'products/fetchMenClothing',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/clothing/men');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch Women Clothing
export const fetchWomenClothing = createAsyncThunk(
  'products/fetchWomenClothing',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/clothing/women');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch Kids Clothing
export const fetchKidsClothing = createAsyncThunk(
  'products/fetchKidsClothing',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/clothing/kids');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch SubCategories
export const fetchSubCategories = createAsyncThunk(
  'products/fetchSubCategories',
  async (category, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/categories/${category}/subcategories`);
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
    subCategories: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      category: '',
      subCategory: '',
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
    },
    clearProducts: (state) => {
      state.products = [];
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
      .addCase(fetchClothingProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClothingProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
      })
      .addCase(fetchClothingProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchMenClothing.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
      })
      .addCase(fetchWomenClothing.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
      })
      .addCase(fetchKidsClothing.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload.product;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
      })
      .addCase(fetchSubCategories.fulfilled, (state, action) => {
        state.subCategories = action.payload.subCategories;
      });
  }
});

export const { clearError, setFilters, clearProducts } = productSlice.actions;
export default productSlice.reducer;