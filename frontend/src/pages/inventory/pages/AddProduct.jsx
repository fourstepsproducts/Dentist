import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { InventoryContext } from '../../../context/InventoryContext';
import { Card } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import { 
  PackagePlus, CheckCircle2, AlertCircle, RefreshCw, 
  Info, Calendar, Tag, ShieldAlert, ShoppingCart, Truck, Layers
} from 'lucide-react';

const PREDEFINED_UNITS = [
  'Piece', 'Box', 'Pack', 'Tube', 'Bottle', 
  'Roll', 'Set', 'Packet', 'Carton', 'Vial', 
  'Syringe', 'Strip', 'Ampoule', 'Jar', 'Custom'
];

const PREDEFINED_CATEGORIES = [
  'Restorative', 'Disposable', 'Anesthetics', 'Impression', 
  'Instruments', 'Preventive', 'Surgical', 'Orthodontic', 
  'Prosthodontics', 'Consumables', 'Emergency Meds', 'Equipment', 'General'
];

const AddProduct = () => {
  const navigate = useNavigate();
  const { items, addItem, suppliers } = useContext(InventoryContext);

  // Auto-generator for Product ID
  const generateUniqueProductId = () => {
    const existingIds = new Set(items.map(i => i.code || i.productId));
    let randomId = '';
    do {
      const num = Math.floor(1000 + Math.random() * 9000);
      randomId = `PRD-${num}`;
    } while (existingIds.has(randomId));
    return randomId;
  };

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    productId: '',
    category: 'Consumables',
    customCategory: '',
    brand: '',
    description: '',
    
    // Stock & Measurement
    initialQuantity: '10',
    unit: 'Box',
    customUnit: '',
    itemsPerUnit: '10',
    
    // Price
    purchasePrice: '',
    purchasePriceType: 'per_unit', // 'per_unit' | 'per_item'
    sellingPrice: '',
    sellingPriceType: 'per_unit', // 'per_unit' | 'per_item'

    // Purchase Info
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: '',
    customSupplier: '',
    invoiceNumber: '',

    // Expiry & Batch
    batchNumber: '',
    expiryDate: '',

    // Usage
    usageType: 'Clinic Use', // 'Clinic Use' | 'For Sale' | 'Both'
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);

  // Initialize Product ID on mount
  useEffect(() => {
    setFormData(prev => ({ ...prev, productId: generateUniqueProductId() }));
  }, []);

  const handleRegenerateId = () => {
    setFormData(prev => ({ ...prev, productId: generateUniqueProductId() }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Dynamic calculations
  const effectiveUnit = formData.unit === 'Custom' ? (formData.customUnit.trim() || 'Unit') : formData.unit;
  const quantityNum = Math.max(0, Number(formData.initialQuantity) || 0);
  const itemsPerUnitNum = Math.max(1, Number(formData.itemsPerUnit) || 1);
  const totalQuantity = quantityNum * itemsPerUnitNum;

  // Base item label (e.g. Pieces, Items, or Unit name)
  const baseItemLabel = itemsPerUnitNum === 1 ? effectiveUnit : (effectiveUnit === 'Box' ? 'Pieces' : 'Items');

  // Pricing calculations
  const purchasePriceNum = Number(formData.purchasePrice) || 0;
  const sellingPriceNum = Number(formData.sellingPrice) || 0;

  let totalPurchaseValue = 0;
  let pricePerItem = 0;

  if (formData.purchasePriceType === 'per_unit') {
    totalPurchaseValue = quantityNum * purchasePriceNum;
    pricePerItem = itemsPerUnitNum > 0 ? purchasePriceNum / itemsPerUnitNum : 0;
  } else {
    // per item
    pricePerItem = purchasePriceNum;
    totalPurchaseValue = totalQuantity * purchasePriceNum;
  }

  // Selling calculations
  let pricePerItemSelling = 0;
  if (sellingPriceNum > 0) {
    if (formData.sellingPriceType === 'per_unit') {
      pricePerItemSelling = itemsPerUnitNum > 0 ? sellingPriceNum / itemsPerUnitNum : 0;
    } else {
      pricePerItemSelling = sellingPriceNum;
    }
  }

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product Name is required.';
    }

    if (!formData.productId.trim()) {
      newErrors.productId = 'Product ID is required.';
    } else {
      const isDuplicate = items.some(i => (i.code || i.productId) === formData.productId.trim());
      if (isDuplicate) {
        newErrors.productId = 'Product ID must be unique. Click regenerate for a new ID.';
      }
    }

    if (!formData.initialQuantity || Number(formData.initialQuantity) <= 0) {
      newErrors.initialQuantity = 'Initial Quantity must be greater than 0.';
    }

    if (!formData.itemsPerUnit || Number(formData.itemsPerUnit) <= 0) {
      newErrors.itemsPerUnit = 'Items per Unit must be greater than 0.';
    }

    if (formData.unit === 'Custom' && !formData.customUnit.trim()) {
      newErrors.unit = 'Please specify custom unit.';
    }

    if (formData.purchasePrice && Number(formData.purchasePrice) < 0) {
      newErrors.purchasePrice = 'Purchase price cannot be negative.';
    }

    if (formData.sellingPrice && Number(formData.sellingPrice) < 0) {
      newErrors.sellingPrice = 'Selling price cannot be negative.';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Date of purchase is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage(null);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const selectedCategory = formData.category === 'Custom' ? formData.customCategory : formData.category;
    const selectedSupplier = formData.supplier === 'Custom' ? formData.customSupplier : formData.supplier;

    const newProductData = {
      name: formData.name.trim(),
      productId: formData.productId.trim(),
      category: selectedCategory || 'General',
      brand: formData.brand.trim(),
      description: formData.description.trim(),
      
      initialQuantity: quantityNum,
      unit: effectiveUnit,
      itemsPerUnit: itemsPerUnitNum,
      quantity: totalQuantity,
      baseQuantity: totalQuantity,

      purchasePrice: purchasePriceNum,
      purchasePriceType: formData.purchasePriceType,
      costPrice: purchasePriceNum,
      sellingPrice: sellingPriceNum,
      sellingPriceType: formData.sellingPriceType,

      purchaseDate: formData.purchaseDate,
      supplier: selectedSupplier,
      invoiceNumber: formData.invoiceNumber.trim(),

      batchNumber: formData.batchNumber.trim(),
      expiryDate: formData.expiryDate || 'N/A',

      usageType: formData.usageType,
    };

    const createdItem = addItem(newProductData);

    const createdId = createdItem?.code || formData.productId;
    setSuccessMessage(`Product added successfully! Product ID: ${createdId}`);
    
    // Reset Form
    const nextId = generateUniqueProductId();
    setFormData({
      name: '',
      productId: nextId,
      category: 'Consumables',
      customCategory: '',
      brand: '',
      description: '',
      initialQuantity: '10',
      unit: 'Box',
      customUnit: '',
      itemsPerUnit: '10',
      purchasePrice: '',
      purchasePriceType: 'per_unit',
      sellingPrice: '',
      sellingPriceType: 'per_unit',
      purchaseDate: new Date().toISOString().split('T')[0],
      supplier: '',
      customSupplier: '',
      invoiceNumber: '',
      batchNumber: '',
      expiryDate: '',
      usageType: 'Clinic Use',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    navigate('/inventory/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight flex items-center gap-2.5">
          <PackagePlus className="w-7 h-7 text-primary" />
          Add Product
        </h1>
        <p className="text-textSecondary text-sm mt-1">
          Register new materials, equipment, and consumables into the clinical inventory system.
        </p>
      </div>

      {/* Success Alert Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">{successMessage}</p>
              <p className="text-xs text-emerald-700 mt-0.5">The product has been saved and is ready for inventory tracking.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold px-2 py-1 rounded-md hover:bg-emerald-100/50"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Global Validation Error Banner */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-5 py-4 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Please correct the highlighted fields before submitting:</p>
            <ul className="list-disc list-inside text-xs mt-1.5 space-y-1 text-rose-700">
              {Object.values(errors).filter(Boolean).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* -------------------------------------------------- */}
        {/* PRODUCT INFORMATION */}
        {/* -------------------------------------------------- */}
        <Card className="p-6 space-y-5 border-t-4 border-t-primary shadow-sm">
          <div className="border-b border-border pb-3 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-textPrimary">Product Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Product Name * */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter product name (e.g. Latex Examination Gloves, Composite Resin)"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  errors.name ? 'border-rose-500 bg-rose-50/30' : 'border-border bg-white focus:border-primary'
                }`}
              />
              {errors.name && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.name}</p>}
            </div>

            {/* Product ID * */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider flex items-center justify-between">
                <span>Product ID <span className="text-rose-500">*</span></span>
                <span className="text-[10px] text-textSecondary font-normal lowercase">(Unique identifier)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="PRD-1001"
                  value={formData.productId}
                  onChange={(e) => handleInputChange('productId', e.target.value)}
                  className={`flex-1 px-3.5 py-2.5 rounded-lg border text-sm font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.productId ? 'border-rose-500 bg-rose-50/30' : 'border-border bg-slate-50 font-semibold focus:border-primary'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleRegenerateId}
                  title="Generate unique Product ID"
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Auto
                </button>
              </div>
              {errors.productId && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.productId}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Category
              </label>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                options={[
                  ...PREDEFINED_CATEGORIES.map(cat => ({ value: cat, label: cat })),
                  { value: 'Custom', label: '+ Custom Category...' }
                ]}
              />

              {formData.category === 'Custom' && (
                <input
                  type="text"
                  placeholder="Enter custom category name"
                  value={formData.customCategory}
                  onChange={(e) => handleInputChange('customCategory', e.target.value)}
                  className="w-full mt-2 px-3.5 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              )}
            </div>

            {/* Brand */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Brand
              </label>
              <input
                type="text"
                placeholder="e.g. 3M ESPE, Dentsply Sirona, Cranberry"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Description <span className="text-textSecondary font-normal lowercase">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Product specifications, dental usage instructions, or material details..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </Card>

        {/* -------------------------------------------------- */}
        {/* STOCK / MEASUREMENT */}
        {/* -------------------------------------------------- */}
        <Card className="p-6 space-y-5 border-t-4 border-t-emerald-500 shadow-sm">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-textPrimary">Stock & Measurement</h2>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-200">
              Dynamic Quantity Calculation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Initial Quantity * */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Initial Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="10"
                value={formData.initialQuantity}
                onChange={(e) => handleInputChange('initialQuantity', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  errors.initialQuantity ? 'border-rose-500 bg-rose-50/30' : 'border-border bg-white focus:border-emerald-500'
                }`}
              />
              {errors.initialQuantity && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.initialQuantity}</p>}
            </div>

            {/* Unit * */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Unit <span className="text-rose-500">*</span>
              </label>
              <Select
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                options={PREDEFINED_UNITS.map(u => ({ value: u, label: u }))}
              />

              {formData.unit === 'Custom' && (
                <input
                  type="text"
                  placeholder="e.g. ml, g, Roll, Pack"
                  value={formData.customUnit}
                  onChange={(e) => handleInputChange('customUnit', e.target.value)}
                  className="w-full mt-2 px-3.5 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              )}
            </div>

            {/* Items per Unit */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Items per Unit <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="1"
                value={formData.itemsPerUnit}
                onChange={(e) => handleInputChange('itemsPerUnit', e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                  errors.itemsPerUnit ? 'border-rose-500 bg-rose-50/30' : 'border-border bg-white focus:border-emerald-500'
                }`}
              />
              {errors.itemsPerUnit && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.itemsPerUnit}</p>}
            </div>
          </div>

          {/* Explanation Box & Examples */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                <strong>How many individual items are contained in one selected unit?</strong>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md shadow-2xs font-mono">
                Piece → 1
              </span>
              <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md shadow-2xs font-mono">
                Box of 10 toothbrushes → 10
              </span>
              <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md shadow-2xs font-mono">
                Box of 100 gloves → 100
              </span>
              <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md shadow-2xs font-mono">
                Pack of 50 masks → 50
              </span>
            </div>
          </div>

          {/* Total Quantity Dynamic Calculation Box */}
          <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                Calculated Total Quantity
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {quantityNum} {effectiveUnit}{quantityNum !== 1 ? 's' : ''} × {itemsPerUnitNum} {itemsPerUnitNum === 1 ? 'Item' : 'Items'} per {effectiveUnit}
              </p>
            </div>
            <div className="bg-white px-5 py-3 rounded-lg border border-emerald-200 text-right shadow-sm shrink-0">
              <span className="text-2xl font-extrabold text-emerald-700 block tracking-tight">
                {totalQuantity} <span className="text-base font-semibold text-emerald-800">{baseItemLabel}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                Total Base Quantity Stored
              </span>
            </div>
          </div>
        </Card>

        {/* -------------------------------------------------- */}
        {/* PRICING */}
        {/* -------------------------------------------------- */}
        <Card className="p-6 space-y-5 border-t-4 border-t-amber-500 shadow-sm">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-textPrimary">Pricing Information</h2>
            </div>
            <span className="text-xs text-textSecondary font-medium">Currency in ₹ (INR)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Purchase Price */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Purchase Price</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-textSecondary block">Purchase Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-textSecondary text-sm font-semibold">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="500"
                      value={formData.purchasePrice}
                      onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                      className={`w-full pl-7 pr-3 py-2 rounded-lg border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                        errors.purchasePrice ? 'border-rose-500' : 'border-border bg-white focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-textSecondary block">Price Type / Unit</label>
                  <Select
                    value={formData.purchasePriceType}
                    onChange={(e) => handleInputChange('purchasePriceType', e.target.value)}
                    options={[
                      { value: 'per_unit', label: `Per ${effectiveUnit} (Unit)` },
                      { value: 'per_item', label: 'Per Individual Item' }
                    ]}
                  />
                </div>
              </div>

              {/* Purchase Calculation Summary */}
              {purchasePriceNum > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-1 text-xs text-slate-700">
                  <div className="flex justify-between font-semibold">
                    <span>Total Purchase Value:</span>
                    <span className="text-amber-700 font-bold">₹{totalPurchaseValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  {itemsPerUnitNum > 1 && (
                    <div className="flex justify-between text-[11px] text-textSecondary">
                      <span>Calculated Price Per Item:</span>
                      <span className="font-semibold text-slate-800">₹{pricePerItem.toFixed(2)} / item</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selling Price */}
            <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
              <h3 className="text-xs font-bold text-textPrimary uppercase tracking-wider">
                Selling Price <span className="text-textSecondary font-normal lowercase">(if sold to patients)</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-textSecondary block">Selling Price (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-textSecondary text-sm font-semibold">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                      value={formData.sellingPrice}
                      onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                      className={`w-full pl-7 pr-3 py-2 rounded-lg border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                        errors.sellingPrice ? 'border-rose-500' : 'border-border bg-white focus:border-amber-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-textSecondary block">Selling Based On</label>
                  <Select
                    value={formData.sellingPriceType}
                    onChange={(e) => handleInputChange('sellingPriceType', e.target.value)}
                    options={[
                      { value: 'per_unit', label: `Per ${effectiveUnit} (Unit)` },
                      { value: 'per_item', label: 'Per Individual Item' }
                    ]}
                  />
                </div>
              </div>

              {/* Selling Calculation Summary */}
              {sellingPriceNum > 0 && (
                <div className="pt-3 border-t border-slate-200 space-y-1 text-xs text-slate-700">
                  <div className="flex justify-between font-semibold">
                    <span>Effective Selling Price per Item:</span>
                    <span className="text-emerald-700 font-bold">₹{pricePerItemSelling.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* -------------------------------------------------- */}
        {/* PURCHASE INFORMATION */}
        {/* -------------------------------------------------- */}
        <Card className="p-6 space-y-5 border-t-4 border-t-indigo-500 shadow-sm">
          <div className="border-b border-border pb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-textPrimary">Purchase Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Date of Purchase * */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Date of Purchase <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                    errors.purchaseDate ? 'border-rose-500' : 'border-border bg-white focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.purchaseDate && <p className="text-xs text-rose-600 mt-1 font-medium">{errors.purchaseDate}</p>}
            </div>

            {/* Purchased From / Supplier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Purchased From / Supplier
              </label>
              <Select
                value={formData.supplier}
                onChange={(e) => handleInputChange('supplier', e.target.value)}
                placeholder="-- Select or Search Supplier --"
                options={[
                  { value: '', label: '-- Select or Search Supplier --' },
                  ...suppliers.map(s => ({ value: s.name, label: `${s.name} (${s.company || 'Vendor'})` })),
                  { value: 'Custom', label: '+ Enter New Supplier...' }
                ]}
              />

              {formData.supplier === 'Custom' && (
                <input
                  type="text"
                  placeholder="Enter supplier/vendor name"
                  value={formData.customSupplier}
                  onChange={(e) => handleInputChange('customSupplier', e.target.value)}
                  className="w-full mt-2 px-3.5 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              )}
            </div>

            {/* Reference / Invoice Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Reference / Invoice Number <span className="text-textSecondary font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. INV-9981 or PO-2026-004"
                value={formData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </Card>

        {/* -------------------------------------------------- */}
        {/* BATCH & EXPIRY */}
        {/* -------------------------------------------------- */}
        <Card className="p-6 space-y-5 border-t-4 border-t-rose-400 shadow-sm">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-bold text-textPrimary">Batch & Expiry Details</h2>
            </div>
            <span className="text-xs text-textSecondary font-medium">Optional for Non-Consumable Equipment</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Batch Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Batch Number <span className="text-textSecondary font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. BATCH-2026-X89"
                value={formData.batchNumber}
                onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400"
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Expiry Date <span className="text-textSecondary font-normal lowercase">(optional)</span>
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400"
              />
            </div>
          </div>
        </Card>

        {/* -------------------------------------------------- */}
        {/* PRODUCT USAGE TYPE */}
        {/* -------------------------------------------------- */}
        <Card className="p-6 space-y-5 border-t-4 border-t-purple-500 shadow-sm">
          <div className="border-b border-border pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-bold text-textPrimary">Product Usage Type</h2>
            </div>
            <span className="text-xs text-textSecondary font-medium">Used for staff stock usage & patient billing</span>
          </div>

          <div className="space-y-4">
            <div className="max-w-md space-y-1.5">
              <label className="text-xs font-semibold text-textPrimary uppercase tracking-wider block">
                Product Usage
              </label>
              <Select
                value={formData.usageType}
                onChange={(e) => handleInputChange('usageType', e.target.value)}
                options={[
                  { value: 'Clinic Use', label: 'Clinic Use (Internal consumption by staff/dentists)' },
                  { value: 'For Sale', label: 'For Sale (Direct patient sales)' },
                  { value: 'Both', label: 'Both (Used in procedures and sold to patients)' }
                ]}
              />
            </div>

            {/* Example Badges */}
            <div className="flex flex-wrap gap-3 pt-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span>Gloves → Clinic Use</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Toothbrush → For Sale</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Dental Floss → Both</span>
              </div>
            </div>
          </div>
        </Card>

        {/* -------------------------------------------------- */}
        {/* BUTTONS */}
        {/* -------------------------------------------------- */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <PackagePlus className="w-4 h-4" />
            Add Product
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddProduct;
