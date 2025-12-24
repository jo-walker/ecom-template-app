import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { ProductEntry } from "./pages/ProductEntry";
import { InventoryList } from "./pages/InventoryList";
import { ManageCategories } from "./pages/ManageCategories";
import { ManageStyles } from "./pages/ManageStyles";
import { ManageColors } from "./pages/ManageColors";
import { ManageSizes } from "./pages/ManageSizes";
import { CloverExport } from "./pages/CloverExport";
import { SalesReports } from "./pages/SalesReports";
import { ItemReports } from "./pages/ItemReports";
import { SalesRegister } from "./pages/SalesRegister";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuthStore } from "./stores/authStore";

function AppContent() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name: string | null, username: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white shadow-2xl transition-all duration-300 flex-shrink-0 fixed left-0 top-0 h-screen overflow-y-auto`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Inventory Pro
              </h1>
              <p className="text-xs text-gray-400 mt-1">Back Office System</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          <NavItem
            to="/"
            icon="📊"
            label="Dashboard"
            active={isActive("/")}
            collapsed={!sidebarOpen}
          />
          <NavItem
            to="/product-entry"
            icon="➕"
            label="Add Product"
            active={isActive("/product-entry")}
            collapsed={!sidebarOpen}
          />
          <NavItem
            to="/inventory"
            icon="📦"
            label="Inventory"
            active={isActive("/inventory")}
            collapsed={!sidebarOpen}
          />

          {sidebarOpen && <NavSection title="Manage" />}

          <NavItem
            to="/categories"
            icon="🏷️"
            label="Categories"
            active={isActive("/categories")}
            collapsed={!sidebarOpen}
          />
          <NavItem
            to="/styles"
            icon="👔"
            label="Styles"
            active={isActive("/styles")}
            collapsed={!sidebarOpen}
          />
          <NavItem
            to="/colors"
            icon="🎨"
            label="Colors"
            active={isActive("/colors")}
            collapsed={!sidebarOpen}
          />
          <NavItem
            to="/sizes"
            icon="📏"
            label="Sizes"
            active={isActive("/sizes")}
            collapsed={!sidebarOpen}
          />

          {/* {sidebarOpen && <NavSection title="Export" />} */}

          {/* <NavItem to="/clover-export" icon="📥" label="Clover Export" active={isActive('/clover-export')} collapsed={!sidebarOpen} /> */}

          {sidebarOpen && <NavSection title="Sales" />}

          <NavItem
            to="/sales-register"
            icon="💳"
            label="Register Sale"
            active={isActive("/sales-register")}
            collapsed={!sidebarOpen}
          />

          {sidebarOpen && <NavSection title="Reports" />}

          <NavItem
            to="/reports"
            icon="📊"
            label="Sales Reports"
            active={isActive("/reports")}
            collapsed={!sidebarOpen}
          />
          <NavItem
            to="/item-reports"
            icon="📋"
            label="Item Reports"
            active={isActive("/item-reports")}
            collapsed={!sidebarOpen}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-x-hidden transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {getPageTitle(location.pathname)}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {getPageDescription(location.pathname)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {user?.fullName || user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'Administrator' : 'Staff'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold hover:from-blue-600 hover:to-blue-700 transition-all cursor-pointer"
                title="Logout"
              >
                {user && getInitials(user.fullName, user.username)}
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/product-entry"
              element={
                <ProtectedRoute>
                  <ProductEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <InventoryList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <ManageCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/styles"
              element={
                <ProtectedRoute>
                  <ManageStyles />
                </ProtectedRoute>
              }
            />
            <Route
              path="/colors"
              element={
                <ProtectedRoute>
                  <ManageColors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sizes"
              element={
                <ProtectedRoute>
                  <ManageSizes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clover-export"
              element={
                <ProtectedRoute>
                  <CloverExport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales-register"
              element={
                <ProtectedRoute>
                  <SalesRegister />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <SalesReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/item-reports"
              element={
                <ProtectedRoute>
                  <ItemReports />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}

// Navigation Item Component
function NavItem({
  to,
  icon,
  label,
  active,
  collapsed,
}: {
  to: string;
  icon: string;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all group ${
        active
          ? "bg-blue-600 text-white shadow-lg"
          : "text-gray-300 hover:bg-gray-800 hover:text-white"
      }`}
      title={collapsed ? label : ""}
    >
      <span className="text-xl">{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
      {!collapsed && active && (
        <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
      )}
    </Link>
  );
}

// Navigation Section Header
function NavSection({ title }: { title: string }) {
  return (
    <div className="px-4 py-2 mt-6 mb-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </p>
    </div>
  );
}

// Page Title Helper
function getPageTitle(pathname: string): string {
  const titles: { [key: string]: string } = {
    "/": "Dashboard",
    "/product-entry": "Add New Product",
    "/inventory": "Inventory List",
    "/categories": "Manage Categories",
    "/styles": "Manage Styles",
    "/colors": "Manage Colors",
    "/sizes": "Manage Sizes",
    "/clover-export": "Clover Export",
    "/sales-register": "Register Sale",
    "/reports": "Sales Reports",
    "/item-reports": "Item Reports",
  };
  return titles[pathname] || "Inventory Management";
}

// Page Description Helper
function getPageDescription(pathname: string): string {
  const descriptions: { [key: string]: string } = {
    "/": "Overview of your inventory system",
    "/product-entry": "Create new products with barcode generation",
    "/inventory": "View and manage all products",
    "/categories": "Add and edit product categories",
    "/styles": "Manage product styles",
    "/colors": "Manage color options",
    "/sizes": "Manage size options",
    "/clover-export": "Generate Clover POS import files",
    "/sales-register": "Record sales and update inventory automatically",
    "/reports": "Analyze inventory value and trends",
    "/item-reports": "Detailed product inventory report",
  };
  return descriptions[pathname] || "";
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
