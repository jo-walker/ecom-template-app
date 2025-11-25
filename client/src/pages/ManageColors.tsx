import React, { useState, useEffect } from "react";
import {
  getColors,
  createColor,
  updateColor,
  deleteColor,
} from "../services/api";
import { Color } from "../types";

export const ManageColors: React.FC = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    try {
      setLoading(true);
      const data = await getColors();
      setColors(data);
    } catch (error) {
      console.error("Error loading colors:", error);
      alert("Failed to load colors");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (code: string) => {
    if (!window.confirm(`Are you sure you want to delete color ${code}?`)) {
      return;
    }

    try {
      await deleteColor(code);
      alert("✅ Color deleted successfully!");
      loadColors();
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Colors</h1>
          <p className="text-gray-600 mt-1">Add and organize color options</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          ➕ Add Color
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-sm text-gray-500 mb-1">Total Colors</div>
          <div className="text-3xl font-bold text-blue-600">
            {colors.length}
          </div>
        </div>
      </div>

      {/* Colors Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Preview</th>
                <th>Name</th>
                <th>Hex Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {colors.map((color) => (
                <tr key={color.code}>
                  <td className="font-mono font-semibold text-blue-600">
                    {color.code}
                  </td>
                  <td>
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: color.hex_value || "#cccccc" }}
                    />
                  </td>
                  <td className="font-semibold">{color.name}</td>
                  <td className="font-mono text-sm text-gray-600">
                    {color.hex_value || "-"}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingColor(color)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(color.code)}
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
        <ColorModal
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            try {
              await createColor(data);
              alert("✅ Color created successfully!");
              setShowAddModal(false);
              loadColors();
            } catch (error: any) {
              alert(
                `❌ Error: ${error.response?.data?.error || error.message}`
              );
            }
          }}
        />
      )}

      {/* Edit Modal */}
      {editingColor && (
        <ColorModal
          color={editingColor}
          onClose={() => setEditingColor(null)}
          onSave={async (data) => {
            try {
              await updateColor(editingColor.code, data);
              alert("✅ Color updated successfully!");
              setEditingColor(null);
              loadColors();
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

// Color Modal
interface ColorModalProps {
  color?: Color;
  onClose: () => void;
  onSave: (data: Partial<Color>) => void;
}

function ColorModal({ color, onClose, onSave }: ColorModalProps) {
  const [code, setCode] = useState(color?.code || "");
  const [name, setName] = useState(color?.name || "");
  const [hexValue, setHexValue] = useState(color?.hex_value || "#000000");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      alert("Code and name are required");
      return;
    }
    onSave({ code, name, hex_value: hexValue });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6">
          {color ? "Edit Color" : "Add Color"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">
              Code (e.g., 01, 02) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="form-input"
              maxLength={10}
              required
              disabled={!!color}
              placeholder="01"
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
              placeholder="Black"
            />
          </div>

          <div>
            <label className="form-label">Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={hexValue}
                onChange={(e) => setHexValue(e.target.value)}
                className="w-20 h-12 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={hexValue}
                onChange={(e) => setHexValue(e.target.value)}
                className="form-input flex-1 font-mono"
                placeholder="#000000"
              />
            </div>
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
