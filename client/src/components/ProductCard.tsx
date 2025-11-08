import React from 'react';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const addItem = useCartStore(state => state.addItem);
  const [quantity, setQuantity] = React.useState(1);

  const handleAddToCart = () => {
    // Ensure price is a number when adding to cart
    const productWithNumber = {
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    };
    addItem(productWithNumber, quantity);
    alert(`Added ${quantity} ${product.name} to cart`);
  };

  // SAFE price conversion - handles strings and numbers
  const price = typeof product.price === 'string' 
    ? parseFloat(product.price) 
    : typeof product.price === 'number'
    ? product.price
    : 0;

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover rounded mb-4"
        />
      )}
      <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
      <p className="text-gray-600 text-sm mb-2">{product.description}</p>
      <p className="text-xl font-bold text-blue-600 mb-4">${price.toFixed(2)}</p>
      
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max={product.stock_quantity}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="border rounded px-2 py-1 w-16"
        />
        <button
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 flex-1"
        >
          {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        {product.stock_quantity} in stock
      </p>
    </div>
  );
};