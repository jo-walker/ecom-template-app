import React, { useState, useEffect } from "react";
import { getProducts, deleteProduct, updateProduct } from "../services/api";
import { Product } from "../types";
import { useNavigate } from "react-router-dom";

export const InventoryList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState<"all" | "low" | "out">("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterCategory, filterStock]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);

      // Extract unique categories
      const categorySet = new Set<string>();
      data.forEach((p) => categorySet.add(p.category_code));
      const uniqueCategories = Array.from(categorySet);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter((p) => p.category_code === filterCategory);
    }

    // Stock filter
    if (filterStock === "low") {
      filtered = filtered.filter(
        (p) => p.stock_quantity > 0 && p.stock_quantity < 5
      );
    } else if (filterStock === "out") {
      filtered = filtered.filter((p) => p.stock_quantity === 0);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (barcode: string) => {
    if (
      !window.confirm(`Are you sure you want to delete product ${barcode}?`)
    ) {
      return;
    }

    try {
      await deleteProduct(barcode);
      alert("✅ Product deleted successfully!");
      loadProducts();
    } catch (error: any) {
      alert(
        `❌ Error deleting product: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      await updateProduct(editingProduct.barcode, {
        retail_price: editingProduct.retail_price,
        stock_quantity: editingProduct.stock_quantity,
        vendor_name: editingProduct.vendor_name,
        notes: editingProduct.notes,
      });
      alert("✅ Product updated successfully!");
      setEditingProduct(null);
      loadProducts();
    } catch (error: any) {
      alert(
        `❌ Error updating product: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <span className="badge-danger">Out of Stock</span>;
    } else if (quantity < 5) {
      return <span className="badge-warning">Low Stock</span>;
    } else {
      return <span className="badge-success">In Stock</span>;
    }
  };

  const calculateTotalValue = () => {
    return filteredProducts.reduce(
      (sum, p) => sum + p.retail_price * p.stock_quantity,
      0
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Total Products</div>
          <div className="text-2xl font-bold text-blue-600">
            {filteredProducts.length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Total Items</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredProducts.reduce((sum, p) => sum + p.stock_quantity, 0)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Low Stock Items</div>
          <div className="text-2xl font-bold text-orange-600">
            {
              filteredProducts.filter(
                (p) => p.stock_quantity > 0 && p.stock_quantity < 5
              ).length
            }
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-purple-600">
            ${calculateTotalValue().toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="🔍 Search by barcode, category, vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>

          {/* Category Filter */}
          <div className="w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="w-48">
            <select
              value={filterStock}
              onChange={(e) => setFilterStock(e.target.value as any)}
              className="form-select"
            >
              <option value="all">All Stock Levels</option>
              <option value="low">Low Stock (&lt; 5)</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          {/* Add Product Button */}
          <button
            onClick={() => navigate("/product-entry")}
            className="btn-primary"
          >
            ➕ Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No products found</p>
            <button
              onClick={() => navigate("/product-entry")}
              className="btn-primary"
            >
              ➕ Add Your First Product
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Barcode</th>
                  <th>Category</th>
                  <th>Style</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Vendor</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.barcode}>
                    <td className="font-mono font-semibold text-blue-600">
                      {product.barcode}
                    </td>
                    <td>{product.Category?.name || product.category_code}</td>
                    <td>{product.style_number}</td>
                    <td>{product.Size?.name || product.size_code}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {product.Color?.hex_value && (
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: product.Color.hex_value }}
                          />
                        )}
                        <span>{product.Color?.name || product.color_code}</span>
                      </div>
                    </td>
                    <td>{product.vendor_name || "-"}</td>
                    <td className="font-semibold">
                      $
                      {typeof product.retail_price === "number"
                        ? product.retail_price.toFixed(2)
                        : parseFloat(product.retail_price as any).toFixed(2)}
                    </td>
                    <td className="font-semibold">{product.stock_quantity}</td>
                    <td>{getStockBadge(product.stock_quantity)}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(product.barcode)}
                          className="text-red-600 hover:text-red-800 font-medium text-sm"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Edit Modal */}
      {editingProduct && (
        <EditModal
          product={editingProduct}
          onSave={handleSaveEdit}
          onCancel={() => setEditingProduct(null)}
          onChange={setEditingProduct}
        />
      )}
    </div>
  );
};

// Edit Modal Component
interface EditModalProps {
  product: Product;
  onSave: () => void;
  onCancel: () => void;
  onChange: (product: Product) => void;
}

function EditModal({ product, onSave, onCancel, onChange }: EditModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">Edit Product</h2>

        <div className="space-y-4">
          <div>
            <label className="form-label">Barcode</label>
            <input
              type="text"
              value={product.barcode}
              disabled
              className="form-input bg-gray-100"
            />
          </div>

          <div>
            <label className="form-label">Retail Price</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                value={product.retail_price}
                onChange={(e) =>
                  onChange({
                    ...product,
                    retail_price: parseFloat(e.target.value),
                  })
                }
                className="form-input pl-8"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Stock Quantity</label>
            <input
              type="number"
              value={product.stock_quantity}
              onChange={(e) =>
                onChange({
                  ...product,
                  stock_quantity: parseInt(e.target.value),
                })
              }
              className="form-input"
              min="0"
            />
          </div>

          <div>
            <label className="form-label">Vendor</label>
            <input
              type="text"
              value={product.vendor_name || ""}
              onChange={(e) =>
                onChange({ ...product, vendor_name: e.target.value })
              }
              className="form-input"
              placeholder="Vendor name"
            />
          </div>

          <div>
            <label className="form-label">Notes</label>
            <textarea
              value={product.notes || ""}
              onChange={(e) => onChange({ ...product, notes: e.target.value })}
              className="form-textarea"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onSave} className="btn-primary flex-1">
            💾 Save Changes
          </button>
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
