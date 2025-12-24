import React, { useState, useEffect, useRef } from "react";
import {
  getProductByBarcode,
  recordSale,
  getAllSales,
  deleteSale,
} from "../services/api";
import { Product, Sale, RecordSaleResponse } from "../types";

export const SalesRegister: React.FC = () => {
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRecentSales();
  }, []);

  const fetchRecentSales = async () => {
    try {
      const sales = await getAllSales();
      setRecentSales(sales.slice(0, 10)); // Show last 10 sales
    } catch (err) {
      console.error("Error fetching recent sales:", err);
    }
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const foundProduct = await getProductByBarcode(barcode.trim());
      setProduct(foundProduct);
      setQuantity(1);
    } catch (err: any) {
      setError(err.response?.data?.error || "Product not found");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordSale = async () => {
    if (!product) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const saleData = {
        barcode: product.barcode,
        quantity_sold: quantity,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      };

      const response: RecordSaleResponse = await recordSale(saleData);

      setSuccess(
        `Sale recorded! ${quantity} item(s) sold. Stock updated: ${response.updated_stock} remaining.`
      );

      // Reset form
      setBarcode("");
      setProduct(null);
      setQuantity(1);
      setNotes("");
      setPaymentMethod("cash");

      // Refresh recent sales
      fetchRecentSales();

      // Focus back on barcode input for next scan
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error recording sale");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSale = async (saleId: number) => {
    if (!window.confirm("Delete this sale and restore inventory?")) return;

    try {
      await deleteSale(saleId);
      setSuccess("Sale deleted and inventory restored");
      fetchRecentSales();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error deleting sale");
    }
  };

  const handleClearProduct = () => {
    setProduct(null);
    setBarcode("");
    setQuantity(1);
    setNotes("");
    setError("");
    setSuccess("");
    barcodeInputRef.current?.focus();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Status Messages */}
      {error && (
        <div className="alert-error">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}

      {success && (
        <div className="alert-success">
          <span className="font-semibold">Success:</span> {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Sale Registration */}
        <div className="space-y-6">
          {/* Barcode Scanner */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Scan or Enter Barcode
            </h2>

            <form onSubmit={handleBarcodeSubmit}>
              <div className="flex gap-2">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  className="form-input flex-1 text-lg font-mono"
                  placeholder="Scan barcode or type..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn-primary px-6"
                  disabled={loading || !barcode.trim()}
                >
                  {loading ? "..." : "Lookup"}
                </button>
              </div>
            </form>

            <p className="text-sm text-gray-500 mt-2">
              Tip: Use a barcode scanner for faster checkout
            </p>
          </div>

          {/* Product Details */}
          {product && (
            <div className="card bg-blue-50 border-2 border-blue-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Product Found
                  </h3>
                  <p className="text-sm font-mono text-gray-600">
                    {product.barcode}
                  </p>
                </div>
                <button
                  onClick={handleClearProduct}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Category</p>
                    <p className="font-semibold">
                      {product.Category?.name || product.category_code}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Style</p>
                    <p className="font-semibold">{product.style_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Size</p>
                    <p className="font-semibold">
                      {product.Size?.name || product.size_code}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Color</p>
                    <p className="font-semibold flex items-center gap-2">
                      {product.Color?.hex_value && (
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: product.Color.hex_value }}
                        />
                      )}
                      {product.Color?.name || product.color_code}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Retail Price:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      $
                      {typeof product.retail_price === "number"
                        ? product.retail_price.toFixed(2)
                        : parseFloat(product.retail_price as any).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Available Stock:</span>
                    <span
                      className={`text-lg font-bold ${
                        product.stock_quantity === 0
                          ? "text-red-600"
                          : product.stock_quantity < 5
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {product.stock_quantity} units
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sale Details Form */}
          {product && (
            <div className="card">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Sale Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    max={product.stock_quantity}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                  />
                  {quantity > product.stock_quantity && (
                    <p className="text-sm text-red-600 mt-1">
                      Insufficient stock! Only {product.stock_quantity}{" "}
                      available.
                    </p>
                  )}
                </div>

                <div>
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="mobile">Mobile Payment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Add transaction notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-gray-800">
                      Total Amount:
                    </span>
                    <span className="text-3xl font-bold text-green-600">
                      $
                      {(
                        (typeof product.retail_price === "number"
                          ? product.retail_price
                          : parseFloat(product.retail_price as any)) * quantity
                      ).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleRecordSale}
                    className="btn-primary w-full text-lg py-3"
                    disabled={
                      loading ||
                      quantity > product.stock_quantity ||
                      quantity < 1
                    }
                  >
                    {loading ? "Processing..." : "Complete Sale"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recent Sales */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Sales</h2>
            <button
              onClick={fetchRecentSales}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3 max-h-[800px] overflow-y-auto">
            {recentSales.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">No sales recorded yet</p>
                <p className="text-sm mt-2">
                  Start scanning products to record sales
                </p>
              </div>
            ) : (
              recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm bg-white px-2 py-1 rounded border border-gray-300">
                          {sale.barcode}
                        </span>
                        {sale.payment_method && (
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {sale.payment_method}
                          </span>
                        )}
                      </div>

                      {sale.Product && (
                        <div className="text-sm text-gray-600 mb-1">
                          {sale.Product.Category?.name} •{" "}
                          {sale.Product.style_number} •{" "}
                          {sale.Product.Size?.name} •{" "}
                          {sale.Product.Color?.name}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">
                          Qty: <strong>{sale.quantity_sold}</strong>
                        </span>
                        <span className="text-gray-600">
                          Unit: <strong>${sale.unit_price}</strong>
                        </span>
                        <span className="font-bold text-green-600">
                          Total: ${sale.total_amount}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(sale.sale_date).toLocaleString()}
                      </div>

                      {sale.notes && (
                        <div className="text-xs text-gray-600 mt-1 italic">
                          "{sale.notes}"
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteSale(sale.id)}
                      className="text-red-600 hover:text-red-700 text-sm ml-2"
                      title="Delete sale and restore inventory"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
