import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ProductsPage } from './pages/ProductsPage';
import { CartPage } from './pages/CartPage';
import { useCartStore, getTotalItems } from './store/cartStore';

function App() {
  const items = useCartStore(state => state.items);
  const totalItems = getTotalItems(items);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              E-Commerce POS
            </Link>
            <div className="flex gap-4">
              <Link to="/products" className="hover:text-blue-600">
                Products
              </Link>
              <Link to="/cart" className="hover:text-blue-600 relative">
                Cart
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;