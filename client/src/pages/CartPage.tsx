import React from 'react';
import { useCartStore, getTotalItems, getTotalPrice } from '../store/cartStore';  // Import helpers
import { useNavigate } from 'react-router-dom';

export const CartPage: React.FC = () => {
  const items = useCartStore(state => state.items);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  
  const totalItems = getTotalItems(items);
  const totalPrice = getTotalPrice(items);
  
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.product.sku} className="border rounded-lg p-4 flex items-center gap-4">
            <div className="flex-1">
              <h3 className="font-semibold">{item.product.name}</h3>
              <p className="text-gray-600">${item.product.price.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.product.sku, item.quantity - 1)}
                className="px-2 py-1 border rounded"
              >
                -
              </button>
              <span className="px-4">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product.sku, item.quantity + 1)}
                className="px-2 py-1 border rounded"
              >
                +
              </button>
            </div>
            
            <div className="font-bold">
              ${(item.product.price * item.quantity).toFixed(2)}
            </div>
            
            <button
              onClick={() => removeItem(item.product.sku)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-8 border-t pt-4">
        <div className="flex justify-between text-xl font-bold">
          <span>Total ({totalItems} items):</span>  {}
          <span>${totalPrice.toFixed(2)}</span>  {}
        </div>
        
        <button
          onClick={() => navigate('/checkout')}
          className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 text-lg font-semibold"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};