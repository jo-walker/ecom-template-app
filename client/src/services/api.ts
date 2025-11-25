import axios from 'axios';
import { Product, Category, Style, Color, Size, Vendor } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Categories
export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (category: Partial<Category>): Promise<Category> => {
  const response = await api.post('/categories', category);
  return response.data;
};

export const updateCategory = async (code: string, category: Partial<Category>): Promise<Category> => {
  const response = await api.put(`/categories/${code}`, category);
  return response.data;
};

export const deleteCategory = async (code: string): Promise<void> => {
  await api.delete(`/categories/${code}`);
};

// Styles
export const getStyles = async (categoryCode?: string): Promise<Style[]> => {
  const params = categoryCode ? { category_code: categoryCode } : {};
  const response = await api.get('/styles', { params });
  return response.data;
};

export const createStyle = async (style: Partial<Style>): Promise<Style> => {
  const response = await api.post('/styles', style);
  return response.data;
};

export const updateStyle = async (id: number, style: Partial<Style>): Promise<Style> => {
  const response = await api.put(`/styles/${id}`, style);
  return response.data;
};

export const deleteStyle = async (id: number): Promise<void> => {
  await api.delete(`/styles/${id}`);
};

// Colors
export const getColors = async (): Promise<Color[]> => {
  const response = await api.get('/colors');
  return response.data;
};

export const createColor = async (color: Partial<Color>): Promise<Color> => {
  const response = await api.post('/colors', color);
  return response.data;
};

export const updateColor = async (code: string, color: Partial<Color>): Promise<Color> => {
  const response = await api.put(`/colors/${code}`, color);
  return response.data;
};

export const deleteColor = async (code: string): Promise<void> => {
  await api.delete(`/colors/${code}`);
};

// Sizes
export const getSizes = async (): Promise<Size[]> => {
  const response = await api.get('/sizes');
  return response.data;
};

export const createSize = async (size: Partial<Size>): Promise<Size> => {
  const response = await api.post('/sizes', size);
  return response.data;
};

export const updateSize = async (code: string, size: Partial<Size>): Promise<Size> => {
  const response = await api.put(`/sizes/${code}`, size);
  return response.data;
};

export const deleteSize = async (code: string): Promise<void> => {
  await api.delete(`/sizes/${code}`);
};

// Products
export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductByBarcode = async (barcode: string): Promise<Product> => {
  const response = await api.get(`/products/${barcode}`);
  return response.data;
};

export const createProduct = async (product: Partial<Product>): Promise<Product> => {
  const response = await api.post('/products', product);
  return response.data;
};

export const updateProduct = async (barcode: string, product: Partial<Product>): Promise<Product> => {
  const response = await api.put(`/products/${barcode}`, product);
  return response.data;
};

export const deleteProduct = async (barcode: string): Promise<void> => {
  await api.delete(`/products/${barcode}`);
};

// Vendors
export const getVendors = async (): Promise<Vendor[]> => {
  const response = await api.get('/vendors');
  return response.data;
};

export const createVendor = async (vendor: Partial<Vendor>): Promise<Vendor> => {
  const response = await api.post('/vendors', vendor);
  return response.data;
};

export default api;