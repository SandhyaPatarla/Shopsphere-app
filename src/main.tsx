import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'sonner/dist/styles.css'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './app/store.ts'
import { mergeGuestCartToServer } from './features/cart/cartSlice'

const boot = store.getState()
if (boot.auth.token && boot.cart.guestItems.length > 0) {
  void store.dispatch(mergeGuestCartToServer())
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store={store}>
    <App />
    </Provider>
    </BrowserRouter>
  </StrictMode>,
)
