import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1 }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/add', { productId, quantity });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put('/cart/update', { productId, quantity });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/cart/clear');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const initialState = {
  items: [],
  isLoading: false,
  error: null,
  totalItems: 0,
  totalAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    calculateTotals: (state) => {
      // Filter out items with null/undefined products
      const validItems = state.items.filter(item => item.product && item.product.price != null);
      
      state.totalItems = validItems.reduce((total, item) => total + item.quantity, 0);
      state.totalAmount = validItems.reduce(
        (total, item) => total + (item.product.price * item.quantity),
        0
      );
      
      // DON'T modify state.items here - it causes infinite loops
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        // Filter out items with null products immediately
        const items = action.payload.cart.items || [];
        state.items = items.filter(item => item.product && item.product.price != null);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to Cart
      .addCase(addToCart.fulfilled, (state, action) => {
        const items = action.payload.cart.items || [];
        state.items = items.filter(item => item.product && item.product.price != null);
      })
      // Update Cart Item
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const items = action.payload.cart.items || [];
        state.items = items.filter(item => item.product && item.product.price != null);
      })
      // Remove from Cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const items = action.payload.cart.items || [];
        state.items = items.filter(item => item.product && item.product.price != null);
      })
      // Clear Cart
      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { calculateTotals } = cartSlice.actions;
export default cartSlice.reducer;