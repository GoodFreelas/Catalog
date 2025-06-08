import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/organisms/Header'
import Footer from './components/organisms/Footer'
import HomePage from './pages/HomePage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/produto/:id" element={<ProductPage />} />
          <Route path="/carrinho" element={<CartPage />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  )
}

export default App
