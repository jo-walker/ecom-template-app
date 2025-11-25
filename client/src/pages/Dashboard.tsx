import React, { useEffect, useState } from "react";
import { getProducts, getCategories } from "../services/api";
import { Link } from "react-router-dom";
import { Product } from "../types";

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    totalItems: 0,
    averagePrice: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const products = await getProducts();
        const categories = await getCategories();

        // Calculate total value
        const totalValue = products.reduce((sum, p) => {
          const price =
            typeof p.retail_price === "number"
              ? p.retail_price
              : parseFloat(p.retail_price as any);
          return sum + price * p.stock_quantity;
        }, 0);

        // Calculate total items in stock
        const totalItems = products.reduce(
          (sum, p) => sum + p.stock_quantity,
          0
        );

        // Calculate average price
        const averagePrice =
          products.length > 0
            ? products.reduce((sum, p) => {
                const price =
                  typeof p.retail_price === "number"
                    ? p.retail_price
                    : parseFloat(p.retail_price as any);
                return sum + price;
              }, 0) / products.length
            : 0;

        // Count low stock and out of stock
        const lowStock = products.filter(
          (p) => p.stock_quantity > 0 && p.stock_quantity < 5
        ).length;
        const outOfStock = products.filter(
          (p) => p.stock_quantity === 0
        ).length;

        setStats({
          totalProducts: products.length,
          totalCategories: categories.length,
          lowStock,
          outOfStock,
          totalValue,
          totalItems,
          averagePrice,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  // Calculate dynamic percentages for progress bars
  const calculateStockPercentage = () => {
    if (stats.totalProducts === 0) return 0;
    const inStock = stats.totalProducts - stats.lowStock - stats.outOfStock;
    return Math.round((inStock / stats.totalProducts) * 100);
  };

  const calculateLowStockPercentage = () => {
    if (stats.totalProducts === 0) return 0;
    return Math.round((stats.lowStock / stats.totalProducts) * 100);
  };

  const calculateOutOfStockPercentage = () => {
    if (stats.totalProducts === 0) return 0;
    return Math.round((stats.outOfStock / stats.totalProducts) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="📦"
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          icon="🏷️"
          color="green"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          icon="⚠️"
          color="red"
          alert
        />
        <StatCard
          title="Inventory Value"
          value={`$${stats.totalValue.toFixed(2)}`}
          icon="💰"
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            to="/product-entry"
            icon="➕"
            title="Add Product"
            description="Create new inventory item"
            color="blue"
          />
          <QuickActionCard
            to="/inventory"
            icon="📋"
            title="View Inventory"
            description="Browse all products"
            color="green"
          />
          <QuickActionCard
            to="/categories"
            icon="🏷️"
            title="Categories"
            description="Manage categories"
            color="purple"
          />
          <QuickActionCard
            to="/clover-export"
            icon="📥"
            title="Export"
            description="Generate Clover file"
            color="orange"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>📊</span> Inventory Overview
          </h3>
          <div className="space-y-3">
            <ProgressBar label="Stock Level" value={85} color="green" />
            <ProgressBar label="Low Stock Items" value={15} color="red" />
            <ProgressBar label="Out of Stock" value={3} color="gray" />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>🎯</span> Quick Stats
          </h3>
          <div className="space-y-4">
            <QuickStat label="Average Price" value="$45.99" />
            <QuickStat
              label="Total SKUs"
              value={stats.totalProducts.toString()}
            />
            <QuickStat
              label="Active Categories"
              value={stats.totalCategories.toString()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Types
type StatCardColor = "blue" | "green" | "red" | "purple";
type QuickActionColor = "blue" | "green" | "purple" | "orange";
type ProgressBarColor = "green" | "red" | "gray";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  color: StatCardColor;
  trend?: string;
  alert?: boolean;
}

interface QuickActionCardProps {
  to: string;
  icon: string;
  title: string;
  description: string;
  color: QuickActionColor;
}

interface ProgressBarProps {
  label: string;
  value: number;
  color: ProgressBarColor;
}

interface QuickStatProps {
  label: string;
  value: string;
}

// Stat Card Component
function StatCard({ title, value, icon, color, trend, alert }: StatCardProps) {
  const colorClasses: Record<StatCardColor, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className={`stat-card ${alert ? "ring-2 ring-red-500" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 font-medium mt-2">
              {trend} from last month
            </p>
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

// Quick Action Card
function QuickActionCard({
  to,
  icon,
  title,
  description,
  color,
}: QuickActionCardProps) {
  const colorClasses: Record<QuickActionColor, string> = {
    blue: "from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-600",
    green:
      "from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-600",
    purple:
      "from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-600",
    orange:
      "from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-600",
  };

  return (
    <Link
      to={to}
      className={`block p-6 bg-gradient-to-br ${colorClasses[color]} rounded-xl transition-all hover:shadow-md`}
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm opacity-75">{description}</p>
    </Link>
  );
}

// Progress Bar
function ProgressBar({ label, value, color }: ProgressBarProps) {
  const colorClass: Record<ProgressBarColor, string> = {
    green: "bg-green-500",
    red: "bg-red-500",
    gray: "bg-gray-500",
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{value}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClass[color]} h-2 rounded-full transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// Quick Stat
function QuickStat({ label, value }: QuickStatProps) {
  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className="text-lg font-bold text-gray-900">{value}</span>
    </div>
  );
}
