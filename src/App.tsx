import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Layout from './components/Layout'

function App() {
  return (
    <>
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index  element={<Home />}/>
        <Route path="/productdetail" element={<ProductDetail />}/>
      </Route>
    </Routes>
    </>
  )
}

export default App
