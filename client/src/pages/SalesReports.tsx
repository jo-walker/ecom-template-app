import React, { useEffect, useState } from "react";
import { getProducts, getCategories } from "../services/api";
import { Product, Category } from "../types";

type DateRange = "7days" | "30days" | "90days" | "custom";

interface ReportStats {
  currentValue: number;
  previousValue: number;
  totalProducts: number;
  totalItems: number;
  valueChange: number;
  valueChangePercent: number;
}

interface CategoryPerformance {
  categoryCode: string;
  categoryName: string;
  productCount: number;
  totalValue: number;
  totalItems: number;
  percentage: number;
}

export const SalesReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>("30days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [stats, setStats] = useState<ReportStats>({
    currentValue: 0,
    previousValue: 0,
    totalProducts: 0,
    totalItems: 0,
    valueChange: 0,
    valueChangePercent: 0,
  });
  const [categoryPerformance, setCategoryPerformance] = useState<
    CategoryPerformance[]
  >([]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (products.length > 0 && categories.length > 0) {
      calculateStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, categories, dateRange, customStartDate, customEndDate]);

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
      alert("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeBoundaries = () => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start = new Date(now);

    if (dateRange === "custom") {
      if (customStartDate && customEndDate) {
        start = new Date(customStartDate);
        return {
          start,
          end: new Date(customEndDate),
          previousStart: new Date(
            start.getTime() -
              (new Date(customEndDate).getTime() - start.getTime())
          ),
          previousEnd: new Date(start),
        };
      }
      start.setDate(now.getDate() - 30);
    } else if (dateRange === "7days") {
      start.setDate(now.getDate() - 7);
    } else if (dateRange === "30days") {
      start.setDate(now.getDate() - 30);
    } else if (dateRange === "90days") {
      start.setDate(now.getDate() - 90);
    }

    start.setHours(0, 0, 0, 0);

    const daysDiff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const previousStart = new Date(start);
    previousStart.setDate(start.getDate() - daysDiff);
    const previousEnd = new Date(start);

    return { start, end, previousStart, previousEnd };
  };

  const calculateStats = () => {
    const { previousStart, previousEnd } = getDateRangeBoundaries();

    const previousProducts = products.filter((p) => {
      const createdAt = new Date(p.createdAt || 0);
      return createdAt >= previousStart && createdAt <= previousEnd;
    });

    const currentValue = products.reduce((sum, p) => {
      const price =
        typeof p.retail_price === "number"
          ? p.retail_price
          : parseFloat(p.retail_price as any);
      return sum + price * p.stock_quantity;
    }, 0);

    const previousValue = previousProducts.reduce((sum, p) => {
      const price =
        typeof p.retail_price === "number"
          ? p.retail_price
          : parseFloat(p.retail_price as any);
      return sum + price * p.stock_quantity;
    }, 0);

    const valueChange = currentValue - previousValue;
    const valueChangePercent =
      previousValue > 0 ? (valueChange / previousValue) * 100 : 0;

    const totalItems = products.reduce((sum, p) => sum + p.stock_quantity, 0);

    setStats({
      currentValue,
      previousValue,
      totalProducts: products.length,
      totalItems,
      valueChange,
      valueChangePercent,
    });

    const categoryMap = new Map<string, CategoryPerformance>();

    products.forEach((p) => {
      const categoryCode = p.category_code;
      const category = categories.find((c) => c.code === categoryCode);
      const categoryName = category?.name || categoryCode;

      const price =
        typeof p.retail_price === "number"
          ? p.retail_price
          : parseFloat(p.retail_price as any);
      const value = price * p.stock_quantity;

      if (!categoryMap.has(categoryCode)) {
        categoryMap.set(categoryCode, {
          categoryCode,
          categoryName,
          productCount: 0,
          totalValue: 0,
          totalItems: 0,
          percentage: 0,
        });
      }

      const catPerf = categoryMap.get(categoryCode)!;
      catPerf.productCount += 1;
      catPerf.totalValue += value;
      catPerf.totalItems += p.stock_quantity;
    });

    const categoryPerf = Array.from(categoryMap.values())
      .map((c) => ({
        ...c,
        percentage: currentValue > 0 ? (c.totalValue / currentValue) * 100 : 0,
      }))
      .sort((a, b) => b.totalValue - a.totalValue);

    setCategoryPerformance(categoryPerf);
  };

  const getDateRangeLabel = () => {
    if (dateRange === "custom" && customStartDate && customEndDate) {
      return `${new Date(customStartDate).toLocaleDateString()} - ${new Date(
        customEndDate
      ).toLocaleDateString()}`;
    }
    const labels: Record<DateRange, string> = {
      "7days": "Last 7 Days",
      "30days": "Last 30 Days",
      "90days": "Last 90 Days",
      custom: "Custom Range",
    };
    return labels[dateRange];
  };

  const handleExport = () => {
    alert("Excel export functionality - Coming soon!");
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span>📊</span> Sales Reports
          </h1>
          <p className="text-gray-500 mt-1">
            Analyze inventory value and trends over time
          </p>
        </div>
        <button onClick={handleExport} className="btn-primary">
          <span>📥</span> Export to Excel
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="form-label">Date Range</label>
            <select
              className="form-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === "custom" && (
            <>
              <div className="flex-1 min-w-[200px]">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex-shrink-0">
            <button onClick={calculateStats} className="btn-primary">
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Inventory Value"
          value={`$${stats.currentValue.toFixed(2)}`}
          icon="💰"
          color="purple"
          subtitle={getDateRangeLabel()}
        />
        <StatCard
          title="Value Change"
          value={`${stats.valueChangePercent >= 0 ? "+" : ""}${stats.valueChangePercent.toFixed(1)}%`}
          icon={stats.valueChangePercent >= 0 ? "📈" : "📉"}
          color={stats.valueChangePercent >= 0 ? "green" : "red"}
          subtitle={`$${Math.abs(stats.valueChange).toFixed(2)} vs previous period`}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="📦"
          color="blue"
          subtitle={`${categoryPerformance.length} categories`}
        />
        <StatCard
          title="Total Stock Items"
          value={stats.totalItems}
          icon="📊"
          color="orange"
          subtitle="Units in inventory"
        />
      </div>

      {/* Inventory Value Trend Chart */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>📈</span> Inventory Value Trend
        </h2>
        <div className="space-y-4">
          <TrendBar
            label="Current Period"
            value={stats.currentValue}
            maxValue={Math.max(stats.currentValue, stats.previousValue)}
            color="blue"
          />
          <TrendBar
            label="Previous Period"
            value={stats.previousValue}
            maxValue={Math.max(stats.currentValue, stats.previousValue)}
            color="gray"
          />
        </div>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">
              {stats.valueChangePercent >= 0 ? "Increase" : "Decrease"}:
            </span>{" "}
            Your inventory value has{" "}
            {stats.valueChangePercent >= 0 ? "increased" : "decreased"} by $
            {Math.abs(stats.valueChange).toFixed(2)} (
            {Math.abs(stats.valueChangePercent).toFixed(1)}%) compared to the
            previous period.
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>🏷️</span> Category Performance
        </h2>
        <div className="space-y-4">
          {categoryPerformance.map((cat) => (
            <CategoryBar
              key={cat.categoryCode}
              category={cat}
              maxValue={stats.currentValue}
            />
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>📋</span> Category Details
        </h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th>Total Items</th>
                <th>Total Value</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              {categoryPerformance.map((cat) => (
                <tr key={cat.categoryCode}>
                  <td>
                    <div className="font-semibold">{cat.categoryName}</div>
                    <div className="text-xs text-gray-500">
                      {cat.categoryCode}
                    </div>
                  </td>
                  <td>{cat.productCount}</td>
                  <td>{cat.totalItems}</td>
                  <td className="font-semibold">
                    ${cat.totalValue.toFixed(2)}
                  </td>
                  <td>
                    <span className="badge-primary">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Types
type StatCardColor = "blue" | "green" | "red" | "purple" | "orange";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: StatCardColor;
  subtitle?: string;
}

interface TrendBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: "blue" | "gray";
}

interface CategoryBarProps {
  category: CategoryPerformance;
  maxValue: number;
}

// Stat Card Component
function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const colorClasses: Record<StatCardColor, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-2xl shadow-lg`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// Trend Bar Component
function TrendBar({ label, value, maxValue, color }: TrendBarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const colorClass = color === "blue" ? "bg-blue-500" : "bg-gray-400";

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-gray-900">${value.toFixed(2)}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
        <div
          className={`${colorClass} h-8 rounded-full transition-all duration-500 flex items-center justify-end px-3`}
          style={{ width: `${percentage}%` }}
        >
          {percentage > 15 && (
            <span className="text-white text-xs font-semibold">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Category Bar Component
function CategoryBar({ category, maxValue }: CategoryBarProps) {
  const colors = [
    "bg-gradient-to-r from-blue-500 to-blue-600",
    "bg-gradient-to-r from-green-500 to-green-600",
    "bg-gradient-to-r from-purple-500 to-purple-600",
    "bg-gradient-to-r from-orange-500 to-orange-600",
    "bg-gradient-to-r from-pink-500 to-pink-600",
    "bg-gradient-to-r from-indigo-500 to-indigo-600",
  ];

  const colorIndex =
    category.categoryCode.charCodeAt(0) % colors.length;
  const colorClass = colors[colorIndex];
  const percentage = maxValue > 0 ? (category.totalValue / maxValue) * 100 : 0;

  return (
    <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="font-semibold text-gray-900">
            {category.categoryName}
          </span>
          <span className="text-sm text-gray-500 ml-2">
            ({category.productCount} products)
          </span>
        </div>
        <div className="text-right">
          <div className="font-bold text-gray-900">
            ${category.totalValue.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500">
            {category.totalItems} items
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
        <div
          className={`${colorClass} h-6 rounded-full transition-all duration-500 flex items-center justify-end px-3`}
          style={{ width: `${percentage}%` }}
        >
          {percentage > 10 && (
            <span className="text-white text-xs font-bold">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
