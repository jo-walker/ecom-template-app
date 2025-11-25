import React, { useState, useEffect } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/api";
import { Category } from "../types";

export const ManageCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete category ${code}?`)) {
      return;
    }

    try {
      await deleteCategory(code);
      alert("✅ Category deleted successfully!");
      loadCategories();
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
          <h1 className="text-2xl font-bold text-gray-900">
            Manage Categories
          </h1>
          <p className="text-gray-600 mt-1">
            Add and organize product categories
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          ➕ Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Total Categories</div>
          <div className="text-3xl font-bold text-blue-600">
            {categories.length}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.code}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {category.code}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {category.name}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(category.code)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <CategoryModal
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            try {
              await createCategory(data);
              alert("✅ Category created successfully!");
              setShowAddModal(false);
              loadCategories();
            } catch (error: any) {
              alert(
                `❌ Error: ${error.response?.data?.error || error.message}`
              );
            }
          }}
        />
      )}

      {/* Edit Modal */}
      {editingCategory && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={async (data) => {
            try {
              await updateCategory(editingCategory.code, data);
              alert("✅ Category updated successfully!");
              setEditingCategory(null);
              loadCategories();
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

// Category Modal
interface CategoryModalProps {
  category?: Category;
  onClose: () => void;
  onSave: (data: Partial<Category>) => void;
}

function CategoryModal({ category, onClose, onSave }: CategoryModalProps) {
  const [code, setCode] = useState(category?.code || "");
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      alert("Code and name are required");
      return;
    }
    onSave({ code: code.toUpperCase(), name, description });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">
          {category ? "Edit Category" : "Add Category"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">
              Code (e.g., CR, TP) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="form-input"
              maxLength={10}
              required
              disabled={!!category}
              placeholder="CR"
            />
          </div>

          <div>
            <label className="form-label">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              required
              placeholder="Cardigan"
            />
          </div>

          <div>
            <label className="form-label">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Optional description"
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
