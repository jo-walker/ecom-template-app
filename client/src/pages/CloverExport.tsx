import React, { useState, useEffect } from "react";
import {
  getPendingExportProducts,
  getAllExportProducts,
  markProductsAsExported,
  resetExportStatus,
} from "../services/api";
import { Product } from "../types";
import { generateCloverExport, downloadCSV } from "../services/cloverExport";

type ExportFilter = "pending" | "all";

export const CloverExport: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<ExportFilter>("pending");
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [filter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data =
        filter === "pending"
          ? await getPendingExportProducts()
          : await getAllExportProducts();
      setProducts(data);
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error loading products:", error);
      alert("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p) => p.barcode));
    }
  };

  const handleSelectProduct = (barcode: string) => {
    setSelectedProducts((prev) =>
      prev.includes(barcode)
        ? prev.filter((b) => b !== barcode)
        : [...prev, barcode]
    );
  };

  const handleExportExcel = () => {
    const productsToExport =
      selectedProducts.length > 0
        ? products.filter((p) => selectedProducts.includes(p.barcode))
        : products;

    if (productsToExport.length === 0) {
      alert("No products selected for export");
      return;
    }

    generateCloverExport(productsToExport);
    alert(`✅ Exported ${productsToExport.length} products to Excel`);
  };

  const handleExportCSV = () => {
    const productsToExport =
      selectedProducts.length > 0
        ? products.filter((p) => selectedProducts.includes(p.barcode))
        : products;

    if (productsToExport.length === 0) {
      alert("No products selected for export");
      return;
    }

    downloadCSV(productsToExport);
    alert(`✅ Exported ${productsToExport.length} products to CSV`);
  };

  const handleMarkAsExported = async () => {
    const productsToMark =
      selectedProducts.length > 0
        ? selectedProducts
        : products.map((p) => p.barcode);

    if (productsToMark.length === 0) {
      alert("No products to mark as exported");
      return;
    }

    if (
      !window.confirm(
        `Mark ${productsToMark.length} products as exported to Clover?`
      )
    ) {
      return;
    }

    try {
      await markProductsAsExported(productsToMark);
      alert(`✅ Marked ${productsToMark.length} products as exported`);
      loadProducts();
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleResetStatus = async () => {
    if (!window.confirm("Reset export status for selected products?")) {
      return;
    }

    try {
      await resetExportStatus(
        selectedProducts.length > 0 ? selectedProducts : undefined
      );
      alert("✅ Export status reset");
      loadProducts();
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const calculateTotalValue = () => {
    const productsToCalc =
      selectedProducts.length > 0
        ? products.filter((p) => selectedProducts.includes(p.barcode))
        : products;

    return productsToCalc.reduce((sum, p) => {
      const price =
        typeof p.retail_price === "number"
          ? p.retail_price
          : parseFloat(p.retail_price as any);
      return sum + price * p.stock_quantity;
    }, 0);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clover Export</h1>
          <p className="text-gray-600 mt-1">
            Generate import files for Clover POS system
          </p>
        </div>
        <button
          onClick={() => setShowInstructions(true)}
          className="btn-secondary"
        >
          ❓ How to Use
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Ready for Export</div>
          <div className="text-3xl font-bold text-blue-600">
            {filter === "pending"
              ? products.length
              : products.filter((p) => !p.exported_to_clover).length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Selected</div>
          <div className="text-3xl font-bold text-green-600">
            {selectedProducts.length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Total Items</div>
          <div className="text-3xl font-bold text-purple-600">
            {(selectedProducts.length > 0
              ? products.filter((p) => selectedProducts.includes(p.barcode))
              : products
            ).reduce((sum, p) => sum + p.stock_quantity, 0)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Total Value</div>
          <div className="text-3xl font-bold text-orange-600">
            ${calculateTotalValue().toFixed(2)}
          </div>
        </div>
      </div>

      {/* Filter & Actions */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Filter Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("pending")}
              className={filter === "pending" ? "btn-primary" : "btn-secondary"}
            >
              📋 New Products Only
            </button>
            <button
              onClick={() => setFilter("all")}
              className={filter === "all" ? "btn-primary" : "btn-secondary"}
            >
              📦 All Products
            </button>
          </div>

          <div className="flex-1"></div>

          {/* Export Actions */}
          <button
            onClick={handleExportExcel}
            className="btn-success"
            disabled={products.length === 0}
          >
            📥 Export Excel
          </button>
          <button
            onClick={handleExportCSV}
            className="btn-success"
            disabled={products.length === 0}
          >
            📄 Export CSV
          </button>
          <button
            onClick={handleMarkAsExported}
            className="btn-primary"
            disabled={products.length === 0}
          >
            ✅ Mark as Exported
          </button>
          <button
            onClick={handleResetStatus}
            className="btn-secondary"
            disabled={selectedProducts.length === 0}
          >
            🔄 Reset Status
          </button>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                📌 How to Use Clover Export
              </h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <ol className="space-y-3 ml-5 list-decimal text-gray-700">
              <li>
                <strong>New Products Only:</strong> Shows products not yet
                exported to Clover
              </li>
              <li>
                <strong>Select products:</strong> Check items you want to export
                (or export all)
              </li>
              <li>
                <strong>Export:</strong> Download Excel/CSV file in Clover
                import format
              </li>
              <li>
                <strong>Import to Clover:</strong> Upload the file in your
                Clover dashboard
              </li>
              <li>
                <strong>Mark as Exported:</strong> Prevents duplicates on next
                export
              </li>
            </ol>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInstructions(false)}
                className="btn-primary"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {filter === "pending" ? "No New Products" : "No Products"}
          </h3>
          <p className="text-gray-600 mb-4">
            {filter === "pending"
              ? "All products have been exported to Clover"
              : "Create products first to export them"}
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length === products.length &&
                        products.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th>Barcode</th>
                  <th>Category</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Last Exported</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.barcode}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.barcode)}
                        onChange={() => handleSelectProduct(product.barcode)}
                        className="w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="font-mono font-semibold text-blue-600">
                      {product.barcode}
                    </td>
                    <td>{product.Category?.name || product.category_code}</td>
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
                    <td className="font-semibold">
                      $
                      {typeof product.retail_price === "number"
                        ? product.retail_price.toFixed(2)
                        : parseFloat(product.retail_price as any).toFixed(2)}
                    </td>
                    <td className="font-semibold">{product.stock_quantity}</td>
                    <td>
                      {product.exported_to_clover ? (
                        <span className="badge-success">Exported</span>
                      ) : (
                        <span className="badge-warning">Pending</span>
                      )}
                    </td>
                    <td className="text-sm text-gray-600">
                      {product.last_exported_at
                        ? new Date(
                            product.last_exported_at
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
