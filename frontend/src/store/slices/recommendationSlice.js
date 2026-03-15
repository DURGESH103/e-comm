import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Recently-viewed IDs are stored in localStorage (max 10, newest first)
const RV_KEY  = 'rv_products';
const RV_MAX  = 10;

export const getRecentlyViewedIds = () => {
  try { return JSON.parse(localStorage.getItem(RV_KEY) || '[]'); }
  catch { return []; }
};

export const trackProductView = (productId) => {
  const ids = getRecentlyViewedIds().filter((id) => id !== productId);
  ids.unshift(productId);
  localStorage.setItem(RV_KEY, JSON.stringify(ids.slice(0, RV_MAX)));
};

export const fetchRecommendations = createAsyncThunk(
  'recommendations/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const viewed = getRecentlyViewedIds().join(',');
      const { data } = await api.get(`/recommendations${viewed ? `?viewed=${viewed}` : ''}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to load recommendations');
    }
  }
);

const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState: {
    sections: {
      recommended:          [],
      recentlyViewed:       [],
      trending:             [],
      popularInCategories:  [],
    },
    topCategories: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchRecommendations.fulfilled, (state, action) => {
        state.isLoading    = false;
        state.sections     = action.payload.sections;
        state.topCategories = action.payload.topCategories;
      })
      .addCase(fetchRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload;
      });
  },
});

export default recommendationSlice.reducer;
