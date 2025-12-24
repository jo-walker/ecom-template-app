import React, { useEffect, useState } from "react";
import { getProducts, getCategories } from "../services/api";
import { Product, Category } from "../types";
import * as XLSX from "xlsx";

type StockStatus = "all" | "in-stock" | "low-stock" | "out-of-stock";

interface ItemReportData extends Product {
  initialQuantity?: number; // For future implementation
  soldQuantity?: number; // For future implementation
  leftoverQuantity: number;
  categoryName?: string;
  styleName?: string;
  colorName?: string;
  sizeName?: string;
  profitMargin?: number;
  totalValue: number;
  daysInInventory?: number;
}

export const ItemReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reportData, setReportData] = useState<ItemReportData[]>([]);
  const [filteredData, setFilteredData] = useState<ItemReportData[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus>("all");
  const [sortBy, setSortBy] = useState<keyof ItemReportData>("barcode");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      processReportData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, categories]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reportData,
    searchTerm,
    selectedCategory,
    selectedVendor,
    stockStatus,
    sortBy,
    sortOrder,
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch inventory data");
    } finally {
      setLoading(false);
    }
  };

  const processReportData = () => {
    const data: ItemReportData[] = products.map((product) => {
      const retailPrice =
        typeof product.retail_price === "number"
          ? product.retail_price
          : parseFloat(product.retail_price as any);
      const costPrice =
        typeof product.cost_price === "number"
          ? product.cost_price
          : parseFloat((product.cost_price as any) || 0);

      const profitMargin =
        retailPrice > 0 ? ((retailPrice - costPrice) / retailPrice) * 100 : 0;

      const totalValue = retailPrice * product.stock_quantity;

      const daysInInventory = product.createdAt
        ? Math.floor(
            (new Date().getTime() - new Date(product.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : undefined;

      return {
        ...product,
        leftoverQuantity: product.stock_quantity,
        categoryName: product.Category?.name || product.category_code,
        colorName: product.Color?.name || product.color_code,
        sizeName: product.Size?.name || product.size_code,
        profitMargin,
        totalValue,
        daysInInventory,
        initialQuantity: product.initial_quantity,
        soldQuantity: product.initial_quantity > 0
          ? product.initial_quantity - product.stock_quantity
          : undefined,
      };
    });

    setReportData(data);
  };

  const applyFilters = () => {
    let filtered = [...reportData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.barcode.toLowerCase().includes(term) ||
          item.categoryName?.toLowerCase().includes(term) ||
          item.vendor_name?.toLowerCase().includes(term) ||
          item.vendor_sku?.toLowerCase().includes(term) ||
          item.notes?.toLowerCase().includes(term)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => item.category_code === selectedCategory
      );
    }

    if (selectedVendor) {
      filtered = filtered.filter((item) => item.vendor_name === selectedVendor);
    }

    if (stockStatus !== "all") {
      filtered = filtered.filter((item) => {
        if (stockStatus === "in-stock") return item.stock_quantity >= 5;
        if (stockStatus === "low-stock")
          return item.stock_quantity > 0 && item.stock_quantity < 5;
        if (stockStatus === "out-of-stock") return item.stock_quantity === 0;
        return true;
      });
    }

    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    setFilteredData(filtered);
  };

  const handleSort = (column: keyof ItemReportData) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const exportToExcel = () => {
    const exportData = filteredData.map((item) => ({
      Barcode: item.barcode,
      Category: item.categoryName,
      Style: item.style_number,
      Size: item.sizeName,
      Color: item.colorName,
      Vendor: item.vendor_name || "N/A",
      "Vendor SKU": item.vendor_sku || "N/A",
      "Cost Price": item.cost_price,
      "Retail Price": item.retail_price,
      "Current Stock": item.leftoverQuantity,
      "Initial Qty": item.initialQuantity || "N/A",
      "Sold Qty": item.soldQuantity || "N/A",
      "Total Value": item.totalValue.toFixed(2),
      "Profit Margin %": item.profitMargin?.toFixed(2) || "N/A",
      "Days in Inventory": item.daysInInventory || "N/A",
      "Added Date": item.createdAt
        ? new Date(item.createdAt).toLocaleDateString()
        : "N/A",
      Notes: item.notes || "",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Item Report");

    const maxWidth = 50;
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.min(
        maxWidth,
        Math.max(
          key.length,
          ...exportData.map(
            (row) => String(row[key as keyof typeof row]).length
          )
        )
      ),
    }));
    ws["!cols"] = colWidths;

    XLSX.writeFile(
      wb,
      `Item_Report_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  const uniqueVendors = Array.from(
    new Set(products.map((p) => p.vendor_name).filter(Boolean))
  ).sort();

  const totalStats = {
    totalItems: filteredData.length,
    totalQuantity: filteredData.reduce(
      (sum, item) => sum + item.leftoverQuantity,
      0
    ),
    totalValue: filteredData.reduce((sum, item) => sum + item.totalValue, 0),
    grossSales: filteredData.reduce((sum, item) => {
      const retailPrice =
        typeof item.retail_price === "number"
          ? item.retail_price
          : parseFloat(item.retail_price as any);
      const soldQty = item.soldQuantity || 0;
      return sum + (retailPrice * soldQty);
    }, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span>📦</span> Item Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Detailed inventory report with product information
          </p>
        </div>
        <button onClick={exportToExcel} className="btn-success">
          <span>📥</span> Export to Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Items"
          value={totalStats.totalItems}
          icon="📦"
          color="blue"
        />
        <SummaryCard
          title="Total Quantity"
          value={totalStats.totalQuantity}
          icon="🔢"
          color="green"
        />
        <SummaryCard
          title="Total Value"
          value={`$${totalStats.totalValue.toFixed(2)}`}
          icon="💰"
          color="purple"
        />
        <SummaryCard
          title="Gross Sales"
          value={`$${totalStats.grossSales.toFixed(2)}`}
          icon="📊"
          color="orange"
        />
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Barcode, category, vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.code} value={cat.code}>
                  {cat.name} ({cat.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Vendor</label>
            <select
              className="form-select"
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
            >
              <option value="">All Vendors</option>
              {uniqueVendors.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Stock Status</label>
            <select
              className="form-select"
              value={stockStatus}
              onChange={(e) => setStockStatus(e.target.value as StockStatus)}
            >
              <option value="all">All Stock Levels</option>
              <option value="in-stock">In Stock (≥5)</option>
              <option value="low-stock">Low Stock (&lt;5)</option>
              <option value="out-of-stock">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            Showing {filteredData.length} of {reportData.length} items
          </h2>
          <div className="text-sm text-gray-500">
            Click column headers to sort
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <SortableHeader
                  label="Barcode"
                  sortKey="barcode"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Category"
                  sortKey="categoryName"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Style"
                  sortKey="style_number"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <th>Size</th>
                <th>Color</th>
                <SortableHeader
                  label="Vendor"
                  sortKey="vendor_name"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <th>Vendor SKU</th>
                <SortableHeader
                  label="Initial Qty"
                  sortKey="initialQuantity"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Sold Qty"
                  sortKey="soldQuantity"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Current Stock"
                  sortKey="leftoverQuantity"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Cost Price"
                  sortKey="cost_price"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Retail Price"
                  sortKey="retail_price"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Total Value"
                  sortKey="totalValue"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Margin %"
                  sortKey="profitMargin"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
                <SortableHeader
                  label="Days in Stock"
                  sortKey="daysInInventory"
                  currentSort={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr key={item.barcode}>
                  <td className="font-mono font-semibold">{item.barcode}</td>
                  <td>{item.categoryName}</td>
                  <td>{item.style_number}</td>
                  <td>{item.sizeName}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {item.Color?.hex_value && (
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: item.Color.hex_value }}
                        />
                      )}
                      {item.colorName}
                    </div>
                  </td>
                  <td>{item.vendor_name || "-"}</td>
                  <td className="font-mono text-xs">
                    {item.vendor_sku || "-"}
                  </td>
                  <td className="text-center">
                    {item.initialQuantity !== undefined && item.initialQuantity > 0 ? (
                      <span className="badge-primary">{item.initialQuantity}</span>
                    ) : (
                      <span className="badge-gray">-</span>
                    )}
                  </td>
                  <td className="text-center">
                    {item.soldQuantity !== undefined ? (
                      <span className={item.soldQuantity > 0 ? "badge-success" : "badge-gray"}>
                        {item.soldQuantity}
                      </span>
                    ) : (
                      <span className="badge-gray">-</span>
                    )}
                  </td>
                  <td className="text-center">
                    <StockBadge quantity={item.leftoverQuantity} />
                  </td>
                  <td>
                    $
                    {typeof item.cost_price === "number"
                      ? item.cost_price.toFixed(2)
                      : item.cost_price
                      ? parseFloat(item.cost_price as any).toFixed(2)
                      : "0.00"}
                  </td>
                  <td className="font-semibold">
                    $
                    {typeof item.retail_price === "number"
                      ? item.retail_price.toFixed(2)
                      : parseFloat(item.retail_price as any).toFixed(2)}
                  </td>
                  <td className="font-semibold text-purple-600">
                    ${item.totalValue.toFixed(2)}
                  </td>
                  <td>
                    {item.profitMargin !== undefined ? (
                      <span
                        className={
                          item.profitMargin > 50
                            ? "badge-success"
                            : item.profitMargin > 30
                            ? "badge-primary"
                            : "badge-warning"
                        }
                      >
                        {item.profitMargin.toFixed(1)}%
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{item.daysInInventory || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No items found matching your filters
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStockStatus("all");
                setSelectedCategory("");
                setSelectedVendor("");
              }}
              className="btn-secondary mt-4"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="alert-info">
        <p className="font-semibold mb-2">📝 About quantity tracking:</p>
        <p className="text-sm">
          <strong>Initial Quantity</strong> shows the quantity entered when the product was first added.
          <strong> Sold Quantity</strong> is calculated as: Initial Qty - Current Stock.
        </p>
        <p className="text-sm mt-2">
          <strong>Note:</strong> This calculation assumes no restocking has occurred. For more accurate
          sales tracking, you'll need to implement a proper sales transaction system that records each sale.
        </p>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: "blue" | "green" | "purple" | "orange";
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-xl shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  sortKey: keyof ItemReportData;
  currentSort: keyof ItemReportData;
  sortOrder: "asc" | "desc";
  onSort: (key: keyof ItemReportData) => void;
}

function SortableHeader({
  label,
  sortKey,
  currentSort,
  sortOrder,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSort === sortKey;

  return (
    <th
      className="cursor-pointer hover:bg-gray-100 transition-colors select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        {isActive && (
          <span className="text-blue-600">
            {sortOrder === "asc" ? "↑" : "↓"}
          </span>
        )}
        {!isActive && <span className="text-gray-300">↕</span>}
      </div>
    </th>
  );
}

function StockBadge({ quantity }: { quantity: number }) {
  if (quantity === 0) {
    return <span className="badge-danger">{quantity}</span>;
  }
  if (quantity < 5) {
    return <span className="badge-warning">{quantity}</span>;
  }
  return <span className="badge-success">{quantity}</span>;
}
