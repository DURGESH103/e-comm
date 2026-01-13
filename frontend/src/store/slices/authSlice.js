import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password, role, adminKey }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role, adminKey });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
  isLoading: false,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user.role;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Load User
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.user.role;
      })
      .addCase(loadUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.role = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('role');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;