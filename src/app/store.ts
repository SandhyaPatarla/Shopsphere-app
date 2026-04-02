import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import cartReducer from '../features/cart/cartSlice'
import categoriesReducer from '../features/catalog/categoriesSlice'
import productsReducer from '../features/catalog/productsSlice'
import checkoutReducer from '../features/checkout/checkoutSlice'
import ordersReducer from '../features/orders/ordersSlice'
import reviewsReducer from '../features/reviews/reviewsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
    checkout: checkoutReducer,
    reviews: reviewsReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
