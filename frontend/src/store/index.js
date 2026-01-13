import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import productSlice from './slices/productSlice';
import adminSlice from './slices/adminSlice';
import adminClothingSlice from './slices/adminClothingSlice';
import cartSlice from './slices/cartSlice';
import wishlistSlice from './slices/wishlistSlice';
import orderSlice from './slices/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productSlice,
    admin: adminSlice,
    adminClothing: adminClothingSlice,
    cart: cartSlice,
    wishlist: wishlistSlice,
    orders: orderSlice,
  },
});

export default store;