import React, { useState, useEffect } from 'react';
import { 
  getCategories, 
  getStyles, 
  getColors, 
  getSizes,
  createProduct,
  createCategory,
  createStyle,
  createColor,
  createSize
} from '../services/api';
import { Category, Style, Color, Size } from '../types';
import { generateBarcode } from '../services/barcodeGenerator';
import { QuickAddModal } from '../components/QuickAddModal';

type ModalType = 'category' | 'style' | 'color' | 'size' | null;

export const ProductEntry: React.FC = () => {
  // Dropdown options
  const [categories, setCategories] = useState<Category[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  // Form state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  // Product details
  const [vendorName, setVendorName] = useState('');
  const [vendorSku, setVendorSku] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // UI state
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState<ModalType>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadColors();
    loadSizes();
  }, []);

  // Load styles when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadStyles(selectedCategory);
    } else {
      setStyles([]);
      setSelectedStyle('');
    }
  }, [selectedCategory]);

  // Generate barcode when all parts are selected
  useEffect(() => {
    if (selectedCategory && selectedStyle && selectedSize && selectedColor) {
      const generated = generateBarcode(
        selectedCategory,
        selectedStyle,
        selectedSize,
        selectedColor
      );
      setBarcode(generated);
    } else {
      setBarcode('');
    }
  }, [selectedCategory, selectedStyle, selectedSize, selectedColor]);

  // Load functions
  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadStyles = async (categoryCode: string) => {
    try {
      const data = await getStyles(categoryCode);
      setStyles(data);
    } catch (error) {
      console.error('Error loading styles:', error);
    }
  };

  const loadColors = async () => {
    try {
      const data = await getColors();
      setColors(data);
    } catch (error) {
      console.error('Error loading colors:', error);
    }
  };

  const loadSizes = async () => {
    try {
      const data = await getSizes();
      setSizes(data);
    } catch (error) {
      console.error('Error loading sizes:', error);
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedCategory) errors.category = 'Category is required';
    if (!selectedStyle) errors.style = 'Style is required';
    if (!selectedSize) errors.size = 'Size is required';
    if (!selectedColor) errors.color = 'Color is required';
    if (!retailPrice) errors.retailPrice = 'Retail price is required';
    if (retailPrice && parseFloat(retailPrice) <= 0) errors.retailPrice = 'Price must be greater than 0';
    if (quantity <= 0) errors.quantity = 'Quantity must be at least 1';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const product = {
      barcode,
      category_code: selectedCategory,
      style_number: selectedStyle,
      size_code: selectedSize,
      color_code: selectedColor,
      vendor_name: vendorName || undefined,
      vendor_sku: vendorSku || undefined,
      cost_price: costPrice ? parseFloat(costPrice) : undefined,
      retail_price: parseFloat(retailPrice),
      initial_quantity: quantity,
      stock_quantity: quantity,
      notes: notes || undefined,
    };

    try {
      await createProduct(product);
      alert(`✅ Product created successfully!\nBarcode: ${barcode}`);
      resetForm();
    } catch (error: any) {
      alert(`❌ Error creating product: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory('');
    setSelectedStyle('');
    setSelectedSize('');
    setSelectedColor('');
    setVendorName('');
    setVendorSku('');
    setCostPrice('');
    setRetailPrice('');
    setQuantity(1);
    setNotes('');
    setBarcode('');
    setFormErrors({});
  };

  // Quick add handlers
  const handleQuickAddCategory = async (code: string, name: string, description: string) => {
    try {
      await createCategory({ code: code.toUpperCase(), name, description });
      await loadCategories();
      setSelectedCategory(code.toUpperCase());
      setModalOpen(null);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleQuickAddStyle = async (styleNumber: string, description: string) => {
    if (!selectedCategory) {
      alert('Please select a category first');
      return;
    }
    try {
      await createStyle({ category_code: selectedCategory, style_number: styleNumber, description });
      await loadStyles(selectedCategory);
      setSelectedStyle(styleNumber);
      setModalOpen(null);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleQuickAddColor = async (code: string, name: string, hexValue: string) => {
    try {
      await createColor({ code, name, hex_value: hexValue || undefined });
      await loadColors();
      setSelectedColor(code);
      setModalOpen(null);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleQuickAddSize = async (code: string, name: string, sortOrder: number) => {
    try {
      await createSize({ code, name, sort_order: sortOrder });
      await loadSizes();
      setSelectedSize(code);
      setModalOpen(null);
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Product</h1>
          <p className="text-gray-600">Create a new inventory item with automatic barcode generation</p>
        </div>

        {/* Generated Barcode Display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8 mb-8 text-center">
          <p className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Generated Barcode</p>
          <div className="bg-white rounded-lg py-4 px-6 inline-block shadow-sm">
            <p className="text-5xl font-bold text-blue-600 font-mono tracking-wider">
              {barcode || '- - - - - - - -'}
            </p>
          </div>
          {barcode && (
            <p className="text-xs text-gray-500 mt-3">
              {selectedCategory} + {selectedStyle} + {selectedSize} + {selectedColor}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Barcode Components Section */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏷️</span> Barcode Components
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="form-group">
                <label className="form-label">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`form-select flex-1 ${formErrors.category ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.code} value={cat.code}>
                        {cat.code} - {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setModalOpen('category')}
                    className="btn-success"
                    title="Add new category"
                  >
                    ➕
                  </button>
                </div>
                {formErrors.category && <p className="form-error">{formErrors.category}</p>}
              </div>

              {/* Style */}
              <div className="form-group">
                <label className="form-label">
                  Style <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className={`form-select flex-1 ${formErrors.style ? 'border-red-500' : ''}`}
                    disabled={!selectedCategory}
                  >
                    <option value="">Select Style</option>
                    {styles.map((style) => (
                      <option key={style.id} value={style.style_number}>
                        {style.style_number} - {style.description}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setModalOpen('style')}
                    className="btn-success"
                    disabled={!selectedCategory}
                    title="Add new style"
                  >
                    ➕
                  </button>
                </div>
                {formErrors.style && <p className="form-error">{formErrors.style}</p>}
              </div>

              {/* Size */}
              <div className="form-group">
                <label className="form-label">
                  Size <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className={`form-select flex-1 ${formErrors.size ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Size</option>
                    {sizes.map((size) => (
                      <option key={size.code} value={size.code}>
                        {size.code} - {size.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setModalOpen('size')}
                    className="btn-success"
                    title="Add new size"
                  >
                    ➕
                  </button>
                </div>
                {formErrors.size && <p className="form-error">{formErrors.size}</p>}
              </div>

              {/* Color */}
              <div className="form-group">
                <label className="form-label">
                  Color <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className={`form-select flex-1 ${formErrors.color ? 'border-red-500' : ''}`}
                  >
                    <option value="">Select Color</option>
                    {colors.map((color) => (
                      <option key={color.code} value={color.code}>
                        {color.code} - {color.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setModalOpen('color')}
                    className="btn-success"
                    title="Add new color"
                  >
                    ➕
                  </button>
                </div>
                {formErrors.color && <p className="form-error">{formErrors.color}</p>}
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="bg-gray-50 rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📦</span> Product Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vendor Name */}
              <div className="form-group">
                <label className="form-label">Vendor Name</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Vendor A"
                />
              </div>

              {/* Vendor SKU */}
              <div className="form-group">
                <label className="form-label">Vendor SKU</label>
                <input
                  type="text"
                  value={vendorSku}
                  onChange={(e) => setVendorSku(e.target.value)}
                  className="form-input"
                  placeholder="Vendor's product code"
                />
              </div>

              {/* Cost Price */}
              <div className="form-group">
                <label className="form-label">Cost Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="form-input pl-8"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Retail Price */}
              <div className="form-group">
                <label className="form-label">
                  Retail Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={retailPrice}
                    onChange={(e) => setRetailPrice(e.target.value)}
                    className={`form-input pl-8 ${formErrors.retailPrice ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {formErrors.retailPrice && <p className="form-error">{formErrors.retailPrice}</p>}
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label className="form-label">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className={`form-input ${formErrors.quantity ? 'border-red-500' : ''}`}
                  min="1"
                />
                {formErrors.quantity && <p className="form-error">{formErrors.quantity}</p>}
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
                rows={3}
                placeholder="Additional product information..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !barcode}
              className="btn-primary flex-1 text-lg py-3"
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5"></div>
                  Creating...
                </>
              ) : (
                <>
                  ✅ Create Product
                  {barcode && ` (${barcode})`}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary px-8"
            >
              🔄 Reset
            </button>
          </div>
        </form>
      </div>

      {/* Quick Add Modals */}
      {modalOpen === 'category' && (
        <CategoryModal
          onClose={() => setModalOpen(null)}
          onSubmit={handleQuickAddCategory}
        />
      )}
      {modalOpen === 'style' && (
        <StyleModal
          onClose={() => setModalOpen(null)}
          onSubmit={handleQuickAddStyle}
        />
      )}
      {modalOpen === 'color' && (
        <ColorModal
          onClose={() => setModalOpen(null)}
          onSubmit={handleQuickAddColor}
        />
      )}
      {modalOpen === 'size' && (
        <SizeModal
          onClose={() => setModalOpen(null)}
          onSubmit={handleQuickAddSize}
        />
      )}
    </div>
  );
};

// Quick Add Modals
function CategoryModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (code: string, name: string, description: string) => void }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && name) {
      onSubmit(code, name, description);
    }
  };

  return (
    <QuickAddModal isOpen={true} onClose={onClose} title="Add New Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Code (e.g., CR, TP) *</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="form-input"
            maxLength={10}
            required
            placeholder="CR"
          />
        </div>
        <div>
          <label className="form-label">Name *</label>
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
            className="form-input"
            rows={2}
            placeholder="Optional description"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn-primary flex-1">Add Category</button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </QuickAddModal>
  );
}

function StyleModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (styleNumber: string, description: string) => void }) {
  const [styleNumber, setStyleNumber] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (styleNumber) {
      onSubmit(styleNumber, description);
    }
  };

  return (
    <QuickAddModal isOpen={true} onClose={onClose} title="Add New Style">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Style Number (e.g., 001) *</label>
          <input
            type="text"
            value={styleNumber}
            onChange={(e) => setStyleNumber(e.target.value)}
            className="form-input"
            required
            placeholder="001"
          />
        </div>
        <div>
          <label className="form-label">Description *</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
            required
            placeholder="Classic button cardigan"
          />
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn-primary flex-1">Add Style</button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </QuickAddModal>
  );
}

function ColorModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (code: string, name: string, hexValue: string) => void }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [hexValue, setHexValue] = useState('#000000');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && name) {
      onSubmit(code, name, hexValue);
    }
  };

  return (
    <QuickAddModal isOpen={true} onClose={onClose} title="Add New Color">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Code (e.g., 01, 02) *</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="form-input"
            required
            placeholder="01"
          />
        </div>
        <div>
          <label className="form-label">Name *</label>
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
          <label className="form-label">Hex Color (optional)</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={hexValue}
              onChange={(e) => setHexValue(e.target.value)}
              className="w-16 h-10 rounded border"
            />
            <input
              type="text"
              value={hexValue}
              onChange={(e) => setHexValue(e.target.value)}
              className="form-input flex-1"
              placeholder="#000000"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn-primary flex-1">Add Color</button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </QuickAddModal>
  );
}

function SizeModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (code: string, name: string, sortOrder: number) => void }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code && name) {
      onSubmit(code, name, sortOrder);
    }
  };

  return (
    <QuickAddModal isOpen={true} onClose={onClose} title="Add New Size">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Code (e.g., 0, 1, 2) *</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="form-input"
            required
            placeholder="0"
          />
        </div>
        <div>
          <label className="form-label">Name *</label>
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
          <p className="text-xs text-gray-500 mt-1">0 = Free Size, 1 = XS, 2 = S, etc.</p>
        </div>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="btn-primary flex-1">Add Size</button>
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </QuickAddModal>
  );
}