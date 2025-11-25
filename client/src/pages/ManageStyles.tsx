import React, { useState, useEffect } from "react";
import {
  getStyles,
  getCategories,
  createStyle,
  updateStyle,
  deleteStyle,
} from "../services/api";
import { Style, Category } from "../types";

export const ManageStyles: React.FC = () => {
  const [styles, setStyles] = useState<Style[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadCategories();
    loadStyles();
  }, []);

  useEffect(() => {
    loadStyles();
  }, [filterCategory]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadStyles = async () => {
    try {
      setLoading(true);
      const data = await getStyles(filterCategory || undefined);
      setStyles(data);
    } catch (error) {
      console.error("Error loading styles:", error);
      alert("Failed to load styles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete this style?`)) {
      return;
    }

    try {
      await deleteStyle(id);
      alert("✅ Style deleted successfully!");
      loadStyles();
    } catch (error: any) {
      alert(`❌ Error: ${error.response?.data?.error || error.message}`);
    }
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Styles</h1>
          <p className="text-gray-600 mt-1">Add and organize product styles</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          ➕ Add Style
        </button>
      </div>

      {/* Stats & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Total Styles</div>
          <div className="text-3xl font-bold text-blue-600">
            {styles.length}
          </div>
        </div>
        <div className="md:col-span-3 card">
          <label className="form-label mb-2">Filter by Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-select"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.code} value={cat.code}>
                {cat.code} - {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Styles Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Style Number</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {styles.map((style) => (
                <tr key={style.id}>
                  <td className="font-semibold text-blue-600">
                    {style.category_code}
                  </td>
                  <td className="font-mono font-semibold">
                    {style.style_number}
                  </td>
                  <td>{style.description}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingStyle(style)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(style.id)}
                        className="text-red-600 hover:text-red-800"
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
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <StyleModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            try {
              await createStyle(data);
              alert("✅ Style created successfully!");
              setShowAddModal(false);
              loadStyles();
            } catch (error: any) {
              alert(
                `❌ Error: ${error.response?.data?.error || error.message}`
              );
            }
          }}
        />
      )}

      {/* Edit Modal */}
      {editingStyle && (
        <StyleModal
          style={editingStyle}
          categories={categories}
          onClose={() => setEditingStyle(null)}
          onSave={async (data) => {
            try {
              await updateStyle(editingStyle.id, data);
              alert("✅ Style updated successfully!");
              setEditingStyle(null);
              loadStyles();
            } catch (error: any) {
              alert(
                `❌ Error: ${error.response?.data?.error || error.message}`
              );
            }
          }}
        />
      )}
    </div>
  );
};

// Style Modal
interface StyleModalProps {
  style?: Style;
  categories: Category[];
  onClose: () => void;
  onSave: (data: Partial<Style>) => void;
}

function StyleModal({ style, categories, onClose, onSave }: StyleModalProps) {
  const [categoryCode, setCategoryCode] = useState(style?.category_code || "");
  const [styleNumber, setStyleNumber] = useState(style?.style_number || "");
  const [description, setDescription] = useState(style?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryCode || !styleNumber) {
      alert("Category and style number are required");
      return;
    }
    onSave({
      category_code: categoryCode,
      style_number: styleNumber,
      description,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">
          {style ? "Edit Style" : "Add Style"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryCode}
              onChange={(e) => setCategoryCode(e.target.value)}
              className="form-select"
              required
              disabled={!!style}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.code} value={cat.code}>
                  {cat.code} - {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">
              Style Number (e.g., 001) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={styleNumber}
              onChange={(e) => setStyleNumber(e.target.value)}
              className="form-input"
              required
              disabled={!!style}
              placeholder="001"
            />
          </div>

          <div>
            <label className="form-label">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input"
              required
              placeholder="Classic button cardigan"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">
              💾 Save
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
