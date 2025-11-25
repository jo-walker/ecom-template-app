import React from 'react';
import { Link } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600">Inventory System</h1>
        <p className="text-sm text-gray-500">Back Office</p>
      </div>
      
      <nav className="mt-6">
        <Link
          to="/"
          className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
        >
          📊 Dashboard
        </Link>
        <Link
          to="/product-entry"
          className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
        >
          ➕ Add Product
        </Link>
        <Link
          to="/inventory"
          className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
        >
          📦 Inventory List
        </Link>
        
        <div className="mt-4 px-6 py-2 text-xs font-semibold text-gray-500 uppercase">
          Manage
        </div>
        
        <Link
          to="/categories"
          className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
        >
          🏷️ Categories
        </Link>
        <Link
          to="/styles"
          className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
        >
          👔 Styles
        </Link>
        <Link
          to="/colors"
          className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
        >
          🎨 Colors
        </Link>
        <Link
          to="/sizes"
          className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
        >
          📏 Sizes
        </Link>
        
        <div className="mt-4 px-6 py-2 text-xs font-semibold text-gray-500 uppercase">
          Export
        </div>
        
        <Link
          to="/clover-export"
          className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-l-4 border-transparent hover:border-blue-600"
        >
          📥 Clover Export
        </Link>
      </nav>
    </aside>
  );
};