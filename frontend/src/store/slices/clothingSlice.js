import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Fetch all clothing products
export const fetchClothingProducts = createAsyncThunk(
  'clothing/fetchClothingProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/clothing');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch men's clothing
export const fetchMenClothing = createAsyncThunk(
  'clothing/fetchMenClothing',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/clothing/men');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch women's clothing
export const fetchWomenClothing = createAsyncThunk(
  'clothing/fetchWomenClothing',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/clothing/women');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Fetch kids clothing
export const fetchKidsClothing = createAsyncThunk(
  'clothing/fetchKidsClothing',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/clothing/kids');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const clothingSlice = createSlice({
  name: 'clothing',
  initialState: {
    products: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
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
      });
  }
});

export const { clearError } = clothingSlice.actions;
export default clothingSlice.reducer;