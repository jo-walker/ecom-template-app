import axios from 'axios';
import { Product, Category, CartItem } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Products
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductBySku = async (sku: string): Promise<Product> => {
  const response = await api.get(`/products/${sku}`);
  return response.data;
};

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data;
};

// Cart
export const addToCart = async (cartItem: { product_sku: string; quantity: number }) => {
  const response = await api.post('/cart', cartItem);
  return response.data;
};

export const getCart = async (): Promise<CartItem[]> => {
  const response = await api.get('/cart');
  return response.data;
};

export const removeFromCart = async (sku: string) => {
  const response = await api.delete(`/cart/${sku}`);
  return response.data;
};

// Orders
export const createOrder = async (orderData: any) => {
  const response = await api.post('/orders', orderData);
  return response.data;
};

export default api;