import React, { createContext, useState, useEffect } from 'react';

export const InventoryContext = createContext();

const initialItems = [
  { id: 1, code: 'INV-001', name: 'Composite Resin', category: 'Restorative', unit: 'Syringe', brand: '3M ESPE', description: 'Light-cured nano-fill composite restorative', minStock: 15, maxStock: 60, quantity: 35, reservedQuantity: 5, supplierId: 1, costPrice: 45.00, sellingPrice: 65.00, status: 'Active', expiryDate: '2026-12-15' },
  { id: 2, code: 'INV-002', name: 'Dental Mirror #4', category: 'Instruments', unit: 'Piece', brand: 'Hu-Friedy', description: 'Stainless steel front surface dental mirror', minStock: 10, maxStock: 30, quantity: 8, reservedQuantity: 0, supplierId: 2, costPrice: 12.50, sellingPrice: 20.00, status: 'Active', expiryDate: 'N/A' },
  { id: 3, code: 'INV-003', name: 'Alginate Impression Powder', category: 'Impression', unit: 'Pack', brand: 'Dentsply Sirona', description: 'Dust-free fast set alginate impression material', minStock: 15, maxStock: 50, quantity: 12, reservedQuantity: 4, supplierId: 1, costPrice: 18.00, sellingPrice: 30.00, status: 'Active', expiryDate: '2026-10-30' },
  { id: 4, code: 'INV-004', name: 'Surgical Gloves (Size M)', category: 'Disposable', unit: 'Box', brand: 'Cranberry', description: 'Latex-free sterile examination gloves, 100pcs/box', minStock: 20, maxStock: 150, quantity: 110, reservedQuantity: 10, supplierId: 3, costPrice: 25.00, sellingPrice: 35.00, status: 'Active', expiryDate: '2028-05-10' },
  { id: 5, code: 'INV-005', name: 'Articulating Paper (Red/Blue)', category: 'Disposable', unit: 'Box', brand: 'Bausch', description: '200 microns micro-thin articulating paper', minStock: 5, maxStock: 25, quantity: 22, reservedQuantity: 2, supplierId: 1, costPrice: 15.00, sellingPrice: 22.00, status: 'Active', expiryDate: '2029-01-15' },
  { id: 6, code: 'INV-006', name: 'Lidocaine 2% w/ Epinephrine', category: 'Anesthetics', unit: 'Box', brand: 'Septodont', description: 'Local dental anesthetic carpules, 50pcs/box', minStock: 15, maxStock: 80, quantity: 14, reservedQuantity: 3, supplierId: 3, costPrice: 60.00, sellingPrice: 90.00, status: 'Active', expiryDate: '2027-02-28' },
  { id: 7, code: 'INV-007', name: 'Diamond Bur Kit', category: 'Instruments', unit: 'Set', brand: 'NSK', description: 'High-speed diamond rotation bur set, 10-piece', minStock: 5, maxStock: 15, quantity: 4, reservedQuantity: 0, supplierId: 2, costPrice: 120.00, sellingPrice: 180.00, status: 'Active', expiryDate: 'N/A' },
];

const initialSuppliers = [
  { id: 1, name: 'Dental Hub Supplies', company: 'Dental Hub Pvt Ltd', contactPerson: 'John Doe', phone: '+1 555-0199', email: 'sales@dentalhub.com', address: '123 Medical Plaza, Suite A, New York, NY 10001', gstNumber: 'GST27AAACD1234F1Z1', paymentTerms: 'Net 30', outstandingAmount: 1250.00, status: 'Active' },
  { id: 2, name: 'Elite Dental Instruments', company: 'Elite Instruments Corp', contactPerson: 'Sarah Connor', phone: '+1 555-0188', email: 'info@elitedental.com', address: '456 Steel St, Industrial District, Chicago, IL 60601', gstNumber: 'GST07AAACE5678G2Z2', paymentTerms: 'Net 15', outstandingAmount: 0.00, status: 'Active' },
  { id: 3, name: 'Global Pharma Co', company: 'Global Pharma Distributors', contactPerson: 'Robert Vance', phone: '+1 555-0177', email: 'orders@globalpharma.com', address: '789 Pharmacy Way, Boston, MA 02101', gstNumber: 'GST33AAACG9012H3Z3', paymentTerms: 'COD', outstandingAmount: 450.00, status: 'Active' },
];

const initialPurchaseOrders = [
  { id: 1, poNumber: 'PO-2026-001', supplierId: 1, orderDate: '2026-07-01', expectedDelivery: '2026-07-15', items: [{ itemId: 1, quantity: 20, costPrice: 45.00 }, { itemId: 3, quantity: 15, costPrice: 18.00 }], totalAmount: 1170.00, status: 'Pending', paymentStatus: 'Unpaid' },
  { id: 2, poNumber: 'PO-2026-002', supplierId: 3, orderDate: '2026-06-25', expectedDelivery: '2026-07-05', items: [{ itemId: 6, quantity: 10, costPrice: 60.00 }], totalAmount: 600.00, status: 'Received', paymentStatus: 'Paid' },
];

const initialGoodsReceived = [
  { id: 1, grnNumber: 'GRN-2026-001', poNumber: 'PO-2026-002', supplierId: 3, receivedDate: '2026-07-05', receivedBy: 'Alice Johnson', items: [{ itemId: 6, quantityReceived: 10, condition: 'Good', remarks: 'Sealed boxes' }], remarks: 'Delivered on time, excellent packaging.' }
];

const initialSupplies = [
  { id: 1, supplierId: 1, itemId: 1, quantity: 20, supplyDate: '2026-06-20', invoiceNumber: 'INV-9981', purchaseCost: 900.00, deliveryStatus: 'Delivered', paymentStatus: 'Paid', notes: 'Regular monthly restoration kit refill' },
  { id: 2, supplierId: 3, itemId: 4, quantity: 50, supplyDate: '2026-07-02', invoiceNumber: 'INV-1033', purchaseCost: 1250.00, deliveryStatus: 'Delivered', paymentStatus: 'Pending', notes: 'Examination gloves box restocking' }
];

const initialStockTransactions = [
  { id: 1, itemId: 6, type: 'Stock In', quantity: 10, date: '2026-07-05T10:30:00Z', reference: 'GRN-2026-001', remarks: 'Purchase Order delivery' },
  { id: 2, itemId: 1, type: 'Stock Out', quantity: -2, date: '2026-07-08T14:15:00Z', reference: 'Dr. Sarah (Restorative)', remarks: 'Used in operatory room 3' },
  { id: 3, itemId: 3, type: 'Stock Adjustment', quantity: -3, date: '2026-07-08T16:00:00Z', reference: 'Inventory Audit', remarks: 'Damaged package discarded' },
];

const initialLaboratories = [
  { id: 1, name: 'Orthodontic Lab Alpha', department: 'Orthodontics', incharge: 'Dr. Emily Stone', phone: '+1 555-0155', email: 'ortholab@oasis.com', status: 'Active' },
  { id: 2, name: 'Prosthodontics Lab Beta', department: 'Prosthodontics', incharge: 'Dr. Marcus Vance', phone: '+1 555-0166', email: 'prostholab@oasis.com', status: 'Active' },
];

const initialMaterialRequirements = [
  { id: 1, labId: 1, itemId: 1, requestedQuantity: 10, availableQuantity: 35, shortage: 0, priority: 'High', requiredDate: '2026-07-12', status: 'Pending' },
  { id: 2, labId: 2, itemId: 3, requestedQuantity: 15, availableQuantity: 12, shortage: 3, priority: 'Medium', requiredDate: '2026-07-18', status: 'Pending' },
];

const initialPayments = [
  { id: 1, supplierId: 1, invoiceNumber: 'INV-9981', amount: 900.00, paidAmount: 900.00, balance: 0.00, dueDate: '2026-07-20', paymentMethod: 'Bank Transfer', paymentStatus: 'Paid' },
  { id: 2, supplierId: 3, invoiceNumber: 'INV-1033', amount: 1250.00, paidAmount: 800.00, balance: 450.00, dueDate: '2026-07-10', paymentMethod: 'Credit Card', paymentStatus: 'Partially Paid' },
  { id: 3, supplierId: 1, invoiceNumber: 'INV-9985', amount: 1250.00, paidAmount: 0.00, balance: 1250.00, dueDate: '2026-07-15', paymentMethod: 'N/A', paymentStatus: 'Unpaid' },
];

const initialSettings = {
  categories: ['Restorative', 'Instruments', 'Impression', 'Disposable', 'Anesthetics', 'Equipment'],
  units: ['Syringe', 'Piece', 'Pack', 'Box', 'Cartridge', 'Set', 'Bottle'],
  itemTypes: ['Consumables', 'Reusable Devices', 'Emergency Meds', 'Lab Materials'],
  taxSettings: { gstRate: 18, applyTaxOnPO: true },
  barcodeSettings: { prefix: 'OASIS-', generateAuto: true },
  notificationSettings: { lowStockThreshold: true, duePaymentsReminder: true, daysBeforeReminder: 5 },
};

export const InventoryProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('inv_items');
    return saved ? JSON.parse(saved) : initialItems;
  });

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem('inv_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [purchaseOrders, setPurchaseOrders] = useState(() => {
    const saved = localStorage.getItem('inv_purchaseOrders');
    return saved ? JSON.parse(saved) : initialPurchaseOrders;
  });

  const [goodsReceived, setGoodsReceived] = useState(() => {
    const saved = localStorage.getItem('inv_goodsReceived');
    return saved ? JSON.parse(saved) : initialGoodsReceived;
  });

  const [supplies, setSupplies] = useState(() => {
    const saved = localStorage.getItem('inv_supplies');
    return saved ? JSON.parse(saved) : initialSupplies;
  });

  const [stockTransactions, setStockTransactions] = useState(() => {
    const saved = localStorage.getItem('inv_stockTransactions');
    return saved ? JSON.parse(saved) : initialStockTransactions;
  });

  const [laboratories, setLaboratories] = useState(() => {
    const saved = localStorage.getItem('inv_laboratories');
    return saved ? JSON.parse(saved) : initialLaboratories;
  });

  const [materialRequirements, setMaterialRequirements] = useState(() => {
    const saved = localStorage.getItem('inv_materialRequirements');
    return saved ? JSON.parse(saved) : initialMaterialRequirements;
  });

  const [payments, setPayments] = useState(() => {
    const saved = localStorage.getItem('inv_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('inv_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [notifications, setNotifications] = useState([]);

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('inv_items', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('inv_suppliers', JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem('inv_purchaseOrders', JSON.stringify(purchaseOrders)); }, [purchaseOrders]);
  useEffect(() => { localStorage.setItem('inv_goodsReceived', JSON.stringify(goodsReceived)); }, [goodsReceived]);
  useEffect(() => { localStorage.setItem('inv_supplies', JSON.stringify(supplies)); }, [supplies]);
  useEffect(() => { localStorage.setItem('inv_stockTransactions', JSON.stringify(stockTransactions)); }, [stockTransactions]);
  useEffect(() => { localStorage.setItem('inv_laboratories', JSON.stringify(laboratories)); }, [laboratories]);
  useEffect(() => { localStorage.setItem('inv_materialRequirements', JSON.stringify(materialRequirements)); }, [materialRequirements]);
  useEffect(() => { localStorage.setItem('inv_payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem('inv_settings', JSON.stringify(settings)); }, [settings]);

  // Generate real-time notifications on load and when state changes
  useEffect(() => {
    const alerts = [];
    
    // Low stock alerts
    items.forEach(item => {
      if (item.quantity === 0) {
        alerts.push({
          id: `low-${item.id}`,
          type: 'danger',
          message: `CRITICAL: ${item.name} (${item.code}) is completely OUT OF STOCK!`,
          date: new Date().toISOString(),
          category: 'Low Stock'
        });
      } else if (item.quantity <= item.minStock) {
        alerts.push({
          id: `low-${item.id}`,
          type: 'warning',
          message: `Low Stock: ${item.name} (${item.code}) has reached ${item.quantity} ${item.unit}(s) (Min: ${item.minStock}).`,
          date: new Date().toISOString(),
          category: 'Low Stock'
        });
      }
    });

    // Due Payment Alerts
    payments.forEach(pay => {
      if (pay.paymentStatus === 'Unpaid' || pay.paymentStatus === 'Partially Paid') {
        const dueDate = new Date(pay.dueDate);
        const diffTime = dueDate - new Date();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const supplierName = suppliers.find(s => s.id === pay.supplierId)?.name || 'Supplier';

        if (diffDays < 0) {
          alerts.push({
            id: `pay-${pay.id}`,
            type: 'danger',
            message: `OVERDUE PAYMENT: Invoice #${pay.invoiceNumber} for ${supplierName} was due on ${pay.dueDate} (Balance: $${pay.balance}).`,
            date: new Date().toISOString(),
            category: 'Payments'
          });
        } else if (diffDays <= settings.notificationSettings.daysBeforeReminder) {
          alerts.push({
            id: `pay-${pay.id}`,
            type: 'warning',
            message: `Upcoming Payment: Invoice #${pay.invoiceNumber} for ${supplierName} is due in ${diffDays} days ($${pay.balance}).`,
            date: new Date().toISOString(),
            category: 'Payments'
          });
        }
      }
    });

    // Pending POs
    const pendingPOs = purchaseOrders.filter(po => po.status === 'Pending').length;
    if (pendingPOs > 0) {
      alerts.push({
        id: 'pending-pos',
        type: 'info',
        message: `You have ${pendingPOs} pending Purchase Order(s) awaiting delivery.`,
        date: new Date().toISOString(),
        category: 'Purchase Orders'
      });
    }

    // Pending Material Requests
    const pendingReqs = materialRequirements.filter(r => r.status === 'Pending').length;
    if (pendingReqs > 0) {
      alerts.push({
        id: 'pending-reqs',
        type: 'info',
        message: `Laboratory Management has ${pendingReqs} pending material request(s) waiting for approval.`,
        date: new Date().toISOString(),
        category: 'Material Requests'
      });
    }

    setNotifications(alerts);
  }, [items, payments, purchaseOrders, materialRequirements, suppliers, settings]);

  // --- CRUD API SIMULATORS ---

  // 1. Items
  const addItem = (item) => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const code = `INV-${String(newId).padStart(3, '0')}`;
    const newItem = {
      ...item,
      id: newId,
      code,
      quantity: Number(item.quantity) || 0,
      reservedQuantity: Number(item.reservedQuantity) || 0,
      minStock: Number(item.minStock) || 0,
      maxStock: Number(item.maxStock) || 100,
      costPrice: Number(item.costPrice) || 0,
      sellingPrice: Number(item.sellingPrice) || 0,
      status: item.status || 'Active',
      expiryDate: item.expiryDate || 'N/A'
    };
    setItems(prev => [...prev, newItem]);
    
    // Log transaction
    addStockTransaction({
      itemId: newId,
      type: 'Stock In',
      quantity: newItem.quantity,
      reference: 'Initial Stock',
      remarks: 'Item added to inventory'
    });
  };

  const updateItem = (id, updatedFields) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const qtyDiff = (Number(updatedFields.quantity) || 0) - item.quantity;
        if (qtyDiff !== 0) {
          addStockTransaction({
            itemId: id,
            type: 'Stock Adjustment',
            quantity: qtyDiff,
            reference: 'Manual Update',
            remarks: 'Quantity updated via Item Edit form'
          });
        }
        return {
          ...item,
          ...updatedFields,
          quantity: Number(updatedFields.quantity) ?? item.quantity,
          minStock: Number(updatedFields.minStock) ?? item.minStock,
          maxStock: Number(updatedFields.maxStock) ?? item.maxStock,
          costPrice: Number(updatedFields.costPrice) ?? item.costPrice,
          sellingPrice: Number(updatedFields.sellingPrice) ?? item.sellingPrice,
        };
      }
      return item;
    }));
  };

  const deleteItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
    // clean transactions, etc.
  };

  // 2. Suppliers
  const addSupplier = (supplier) => {
    const newId = suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1;
    const newSupplier = {
      ...supplier,
      id: newId,
      outstandingAmount: Number(supplier.outstandingAmount) || 0,
      status: supplier.status || 'Active'
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (id, updatedFields) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields, outstandingAmount: Number(updatedFields.outstandingAmount) ?? s.outstandingAmount } : s));
  };

  const deleteSupplier = (id) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  // 3. Purchase Orders
  const addPurchaseOrder = (po) => {
    const newId = purchaseOrders.length > 0 ? Math.max(...purchaseOrders.map(p => p.id)) + 1 : 1;
    const poNumber = `PO-2026-${String(newId).padStart(3, '0')}`;
    const newPO = {
      ...po,
      id: newId,
      poNumber,
      orderDate: new Date().toISOString().split('T')[0],
      totalAmount: po.items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0),
      status: 'Pending',
      paymentStatus: 'Unpaid'
    };
    setPurchaseOrders(prev => [newPO, ...prev]);

    // Also add an unpaid invoice payment record automatically
    const newPayId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
    const newPayment = {
      id: newPayId,
      supplierId: Number(po.supplierId),
      invoiceNumber: `INV-PO-${newId}`,
      amount: newPO.totalAmount,
      paidAmount: 0.00,
      balance: newPO.totalAmount,
      dueDate: po.expectedDelivery,
      paymentMethod: 'N/A',
      paymentStatus: 'Unpaid'
    };
    setPayments(prev => [newPayment, ...prev]);

    // Increase supplier outstanding balance
    updateSupplierOutstanding(Number(po.supplierId), newPO.totalAmount);
  };

  const updateSupplierOutstanding = (supplierId, amount) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        return { ...s, outstandingAmount: s.outstandingAmount + amount };
      }
      return s;
    }));
  };

  // 4. Goods Received / Fulfill Purchase Order
  const receiveGoods = (grn) => {
    const newId = goodsReceived.length > 0 ? Math.max(...goodsReceived.map(g => g.id)) + 1 : 1;
    const grnNumber = `GRN-2026-${String(newId).padStart(3, '0')}`;
    const newGRN = {
      ...grn,
      id: newId,
      grnNumber,
      receivedDate: new Date().toISOString().split('T')[0],
    };
    setGoodsReceived(prev => [newGRN, ...prev]);

    // Update PO status to Received
    setPurchaseOrders(prev => prev.map(po => {
      if (po.poNumber === grn.poNumber) {
        return { ...po, status: 'Received' };
      }
      return po;
    }));

    // Update stock levels & log transactions for each received item
    grn.items.forEach(receivedItem => {
      const itemId = Number(receivedItem.itemId);
      const qty = Number(receivedItem.quantityReceived);

      setItems(prev => prev.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: item.quantity + qty };
        }
        return item;
      }));

      // Log transaction
      addStockTransaction({
        itemId,
        type: 'Stock In',
        quantity: qty,
        reference: grnNumber,
        remarks: `Received via PO: ${grn.poNumber}. Condition: ${receivedItem.condition}. ${receivedItem.remarks || ''}`
      });
    });
  };

  // 5. Stock Transactions (Manual Entry)
  const addStockTransaction = (tx) => {
    const newId = stockTransactions.length > 0 ? Math.max(...stockTransactions.map(t => t.id)) + 1 : 1;
    const qty = Number(tx.quantity);
    const newTx = {
      id: newId,
      itemId: Number(tx.itemId),
      type: tx.type,
      quantity: qty,
      date: new Date().toISOString(),
      reference: tx.reference || 'Manual Entry',
      remarks: tx.remarks || ''
    };
    
    setStockTransactions(prev => [newTx, ...prev]);

    // Update stock quantity for Manual Stock Operations
    if (tx.reference !== 'Initial Stock' && !tx.reference.startsWith('GRN-') && tx.reference !== 'Manual Update') {
      setItems(prev => prev.map(item => {
        if (item.id === Number(tx.itemId)) {
          // Adjust stock based on transaction type
          // If transaction is Stock Out, Damaged Stock, Stock Transfer (out), quantity is negative
          // In the forms, we pass positive numbers, so adjust based on transaction type:
          let finalQty = item.quantity;
          if (tx.type === 'Stock In' || tx.type === 'Returned Stock') {
            finalQty += qty;
          } else {
            // Stock Out, Damaged Stock, Stock Transfer, Stock Adjustment (which can be negative)
            finalQty += qty; // Assumes we passed negative for reductions and positive for additions
          }
          return { ...item, quantity: Math.max(0, finalQty) };
        }
        return item;
      }));
    }
  };

  // 6. Material Requirements
  const addMaterialRequirement = (req) => {
    const newId = materialRequirements.length > 0 ? Math.max(...materialRequirements.map(r => r.id)) + 1 : 1;
    const item = items.find(i => i.id === Number(req.itemId));
    const available = item ? item.quantity : 0;
    const requested = Number(req.requestedQuantity);
    const shortage = Math.max(0, requested - available);

    const newReq = {
      id: newId,
      labId: Number(req.labId),
      itemId: Number(req.itemId),
      requestedQuantity: requested,
      availableQuantity: available,
      shortage,
      priority: req.priority || 'Medium',
      requiredDate: req.requiredDate,
      status: 'Pending'
    };
    setMaterialRequirements(prev => [newReq, ...prev]);
  };

  const updateMaterialRequirementStatus = (id, newStatus) => {
    setMaterialRequirements(prev => prev.map(req => {
      if (req.id === id) {
        // If fulfilled, deduct from stock and add transaction
        if (newStatus === 'Fulfilled' && req.status !== 'Fulfilled') {
          const item = items.find(i => i.id === req.itemId);
          const lab = laboratories.find(l => l.id === req.labId);
          if (item) {
            // Deduct stock
            setItems(prevItems => prevItems.map(i => i.id === req.itemId ? { ...i, quantity: Math.max(0, i.quantity - req.requestedQuantity) } : i));
            // Add transaction
            addStockTransaction({
              itemId: req.itemId,
              type: 'Stock Out',
              quantity: -req.requestedQuantity,
              reference: `Req-Fulfill-${id}`,
              remarks: `Fulfilled material request for ${lab?.name || 'Lab'}`
            });
          }
        }
        return { ...req, status: newStatus };
      }
      return req;
    }));
  };

  // 7. Material Supply Log (Manual Restock details)
  const addMaterialSupply = (supply) => {
    const newId = supplies.length > 0 ? Math.max(...supplies.map(s => s.id)) + 1 : 1;
    const cost = Number(supply.purchaseCost) || 0;
    const qty = Number(supply.quantity) || 0;
    
    const newSupply = {
      ...supply,
      id: newId,
      quantity: qty,
      purchaseCost: cost,
      supplyDate: supply.supplyDate || new Date().toISOString().split('T')[0],
      deliveryStatus: supply.deliveryStatus || 'Delivered',
      paymentStatus: supply.paymentStatus || 'Pending'
    };

    setSupplies(prev => [newSupply, ...prev]);

    // If delivered, automatically add to inventory
    if (newSupply.deliveryStatus === 'Delivered') {
      setItems(prev => prev.map(item => {
        if (item.id === Number(supply.itemId)) {
          return { ...item, quantity: item.quantity + qty };
        }
        return item;
      }));

      // Log transaction
      addStockTransaction({
        itemId: Number(supply.itemId),
        type: 'Stock In',
        quantity: qty,
        reference: `Supply-INV-${supply.invoiceNumber || newId}`,
        remarks: `Delivered supply log by ${suppliers.find(s => s.id === Number(supply.supplierId))?.name || 'Supplier'}`
      });
    }

    // Add invoice payment tracker if pending/unpaid
    const newPayId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
    const newPayment = {
      id: newPayId,
      supplierId: Number(supply.supplierId),
      invoiceNumber: supply.invoiceNumber || `INV-SUPPLY-${newId}`,
      amount: cost,
      paidAmount: supply.paymentStatus === 'Paid' ? cost : 0,
      balance: supply.paymentStatus === 'Paid' ? 0 : cost,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      paymentMethod: supply.paymentStatus === 'Paid' ? 'Bank Transfer' : 'N/A',
      paymentStatus: supply.paymentStatus
    };
    setPayments(prev => [newPayment, ...prev]);

    if (supply.paymentStatus !== 'Paid') {
      updateSupplierOutstanding(Number(supply.supplierId), cost);
    }
  };

  // 8. Log Supplier Payments
  const addPayment = (payment) => {
    const amt = Number(payment.amountPaid) || 0;
    
    setPayments(prev => prev.map(p => {
      if (p.invoiceNumber === payment.invoiceNumber) {
        const newPaidAmount = p.paidAmount + amt;
        const newBalance = Math.max(0, p.amount - newPaidAmount);
        let newStatus = 'Unpaid';
        if (newBalance === 0) newStatus = 'Paid';
        else if (newPaidAmount > 0) newStatus = 'Partially Paid';

        // Deduct from supplier outstanding amount
        updateSupplierOutstanding(p.supplierId, -amt);

        return {
          ...p,
          paidAmount: newPaidAmount,
          balance: newBalance,
          paymentMethod: payment.paymentMethod,
          paymentStatus: newStatus
        };
      }
      return p;
    }));
  };

  // 9. Laboratories CRUD
  const addLab = (lab) => {
    const newId = laboratories.length > 0 ? Math.max(...laboratories.map(l => l.id)) + 1 : 1;
    setLaboratories(prev => [...prev, { ...lab, id: newId, status: 'Active' }]);
  };

  const updateLab = (id, updatedFields) => {
    setLaboratories(prev => prev.map(l => l.id === id ? { ...l, ...updatedFields } : l));
  };

  const deleteLab = (id) => {
    setLaboratories(prev => prev.filter(l => l.id !== id));
  };

  return (
    <InventoryContext.Provider value={{
      items, addItem, updateItem, deleteItem,
      suppliers, addSupplier, updateSupplier, deleteSupplier,
      purchaseOrders, addPurchaseOrder,
      goodsReceived, receiveGoods,
      supplies, addMaterialSupply,
      stockTransactions, addStockTransaction,
      laboratories, addLab, updateLab, deleteLab,
      materialRequirements, addMaterialRequirement, updateMaterialRequirementStatus,
      payments, addPayment,
      settings, setSettings,
      notifications
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
