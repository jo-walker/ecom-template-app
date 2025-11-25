import React, { useState, useEffect } from "react";
import { getSizes, createSize, updateSize, deleteSize } from "../services/api";
import { Size } from "../types";

export const ManageSizes: React.FC = () => {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadSizes();
  }, []);

  const loadSizes = async () => {
    try {
      setLoading(true);
      const data = await getSizes();
      setSizes(data);
    } catch (error) {
      console.error("Error loading sizes:", error);
      alert("Failed to load sizes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete size ${code}?`)) {
      return;
    }

    try {
      await deleteSize(code);
      alert("✅ Size deleted successfully!");
      loadSizes();
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Sizes</h1>
          <p className="text-gray-600 mt-1">Add and organize size options</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          ➕ Add Size
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Total Sizes</div>
          <div className="text-3xl font-bold text-blue-600">{sizes.length}</div>
        </div>
      </div>

      {/* Sizes Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Sort Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size.code}>
                  <td className="font-mono font-semibold text-blue-600">
                    {size.code}
                  </td>
                  <td className="font-semibold">{size.name}</td>
                  <td className="text-gray-600">{size.sort_order}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSize(size)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(size.code)}
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
        <SizeModal
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            try {
              await createSize(data);
              alert("✅ Size created successfully!");
              setShowAddModal(false);
              loadSizes();
            } catch (error: any) {
              alert(
                `❌ Error: ${error.response?.data?.error || error.message}`
              );
            }
          }}
        />
      )}

      {/* Edit Modal */}
      {editingSize && (
        <SizeModal
          size={editingSize}
          onClose={() => setEditingSize(null)}
          onSave={async (data) => {
            try {
              await updateSize(editingSize.code, data);
              alert("✅ Size updated successfully!");
              setEditingSize(null);
              loadSizes();
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

// Size Modal
interface SizeModalProps {
  size?: Size;
  onClose: () => void;
  onSave: (data: Partial<Size>) => void;
}

function SizeModal({ size, onClose, onSave }: SizeModalProps) {
  const [code, setCode] = useState(size?.code || "");
  const [name, setName] = useState(size?.name || "");
  const [sortOrder, setSortOrder] = useState(size?.sort_order || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      alert("Code and name are required");
      return;
    }
    onSave({ code, name, sort_order: sortOrder });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">
          {size ? "Edit Size" : "Add Size"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">
              Code (e.g., 0, 1, 2) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="form-input"
              maxLength={10}
              required
              disabled={!!size}
              placeholder="0"
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
              placeholder="Free Size"
            />
          </div>

          <div>
            <label className="form-label">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
              className="form-input"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              0 = Free Size, 1 = XS, 2 = S, 3 = M, etc.
            </p>
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
