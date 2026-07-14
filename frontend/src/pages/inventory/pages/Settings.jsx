import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { 
  Settings as SettingsIcon, Tag, Ruler, Scale, 
  FileText, Shield, HardDrive, BellRing 
} from 'lucide-react';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { showToast } from '../../../utils/toast';

const Settings = () => {
  const { settings, setSettings } = useContext(InventoryContext);

  const [activeSubTab, setActiveSubTab] = useState('categories'); // 'categories', 'tax', 'barcode', 'backup'

  // Input states for additions
  const [newCat, setNewCat] = useState('');
  const [newUnit, setNewUnit] = useState('');

  const [catDeleteConfirm, setCatDeleteConfirm] = useState({ isOpen: false, cat: null });
  const [unitDeleteConfirm, setUnitDeleteConfirm] = useState({ isOpen: false, unit: null });

  const handleAddCat = (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    if (settings.categories.includes(newCat.trim())) {
      showToast.warning('Category already exists!');
      return;
    }
    setSettings(prev => ({
      ...prev,
      categories: [...prev.categories, newCat.trim()]
    }));
    setNewCat('');
  };

  const handleRemoveCat = (cat) => {
    setCatDeleteConfirm({ isOpen: true, cat });
  };

  const executeDeleteCat = () => {
    if (catDeleteConfirm.cat) {
      setSettings(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c !== catDeleteConfirm.cat)
      }));
      showToast.success('Category deleted.');
    }
    setCatDeleteConfirm({ isOpen: false, cat: null });
  };

  const handleAddUnit = (e) => {
    e.preventDefault();
    if (!newUnit.trim()) return;
    if (settings.units.includes(newUnit.trim())) {
      showToast.warning('Unit already exists!');
      return;
    }
    setSettings(prev => ({
      ...prev,
      units: [...prev.units, newUnit.trim()]
    }));
    setNewUnit('');
  };

  const handleRemoveUnit = (unit) => {
    setUnitDeleteConfirm({ isOpen: true, unit });
  };

  const executeDeleteUnit = () => {
    if (unitDeleteConfirm.unit) {
      setSettings(prev => ({
        ...prev,
        units: prev.units.filter(u => u !== unitDeleteConfirm.unit)
      }));
      showToast.success('Unit deleted.');
    }
    setUnitDeleteConfirm({ isOpen: false, unit: null });
  };

  const handleSaveTaxBarcode = (e) => {
    e.preventDefault();
    showToast.success('Tax and Barcode settings updated successfully.');
  };

  const handleBackup = () => {
    showToast.info('Simulating Database backup... Full inventory dataset downloaded as json file.');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ settings }));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", `oasis_dental_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Settings</h1>
        <p className="text-textSecondary text-sm mt-1">Configure global inventory parameters, tax structures, barcode generators, and system backups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sub-tab navigation */}
        <Card className="p-4 space-y-2 h-fit">
          <div className="flex items-center space-x-2 text-primary border-b border-border pb-3 mb-2">
            <SettingsIcon size={18} />
            <h3 className="font-bold text-textPrimary">Configuration</h3>
          </div>

          <button 
            onClick={() => setActiveSubTab('categories')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2.5 transition-all ${
              activeSubTab === 'categories' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-slate-50 hover:text-textPrimary'
            }`}
          >
            <Tag size={16} /> Categories & Units
          </button>

          <button 
            onClick={() => setActiveSubTab('tax')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2.5 transition-all ${
              activeSubTab === 'tax' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-slate-50 hover:text-textPrimary'
            }`}
          >
            <FileText size={16} /> Tax Settings
          </button>

          <button 
            onClick={() => setActiveSubTab('barcode')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2.5 transition-all ${
              activeSubTab === 'barcode' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-slate-50 hover:text-textPrimary'
            }`}
          >
            <SettingsIcon size={16} /> Barcodes & Alerts
          </button>

          <button 
            onClick={() => setActiveSubTab('backup')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2.5 transition-all ${
              activeSubTab === 'backup' ? 'bg-primary/10 text-primary' : 'text-textSecondary hover:bg-slate-50 hover:text-textPrimary'
            }`}
          >
            <HardDrive size={16} /> Backup & Restore
          </button>
        </Card>

        {/* Content detail panels */}
        <Card className="lg:col-span-3 p-6 space-y-6">
          {activeSubTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-textPrimary">Categories & Units of Measurement</h3>
                <p className="text-xs text-textSecondary mt-0.5">Customize categories and sizing tags for item registers.</p>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Item Categories</span>
                
                <form onSubmit={handleAddCat} className="flex gap-2 max-w-md">
                  <Input 
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    placeholder="e.g. Endodontics"
                    required
                  />
                  <Button type="submit" size="sm">Add Category</Button>
                </form>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  {settings.categories.map(cat => (
                    <span 
                      key={cat}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-textPrimary"
                    >
                      {cat}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveCat(cat)}
                        className="text-textSecondary hover:text-rose-600 text-xs font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Units */}
              <div className="space-y-4 border-t border-border pt-6">
                <span className="text-xs font-bold text-textSecondary uppercase tracking-wider block">Units of Measurement</span>
                
                <form onSubmit={handleAddUnit} className="flex gap-2 max-w-md">
                  <Input 
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="e.g. Vial"
                    required
                  />
                  <Button type="submit" size="sm">Add Unit</Button>
                </form>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  {settings.units.map(unit => (
                    <span 
                      key={unit}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-textPrimary"
                    >
                      {unit}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveUnit(unit)}
                        className="text-textSecondary hover:text-rose-600 text-xs font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'tax' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-textPrimary">Tax Configuration</h3>
                <p className="text-xs text-textSecondary mt-0.5">Specify tax rules and rates to apply during Purchase Order creation.</p>
              </div>

              <form onSubmit={handleSaveTaxBarcode} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">GST / Tax Rate (%)</label>
                  <Input 
                    type="number"
                    value={settings.taxSettings.gstRate}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      taxSettings: { ...prev.taxSettings, gstRate: Number(e.target.value) }
                    }))}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input 
                    type="checkbox"
                    id="applyTax"
                    checked={settings.taxSettings.applyTaxOnPO}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      taxSettings: { ...prev.taxSettings, applyTaxOnPO: e.target.checked }
                    }))}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="applyTax" className="text-sm font-semibold text-textPrimary">
                    Apply GST / Tax calculations to newly generated Purchase Orders
                  </label>
                </div>

                <Button type="submit" size="sm" className="pt-2">Save Tax Settings</Button>
              </form>
            </div>
          )}

          {activeSubTab === 'barcode' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-textPrimary">Barcodes & Alerts Settings</h3>
                <p className="text-xs text-textSecondary mt-0.5">Configure system thresholds and label generators.</p>
              </div>

              <form onSubmit={handleSaveTaxBarcode} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Barcode Prefix</label>
                  <Input 
                    value={settings.barcodeSettings.prefix}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      barcodeSettings: { ...prev.barcodeSettings, prefix: e.target.value }
                    }))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-textPrimary">Notification Trigger Timeline (Days Before Invoice Due)</label>
                  <Input 
                    type="number"
                    value={settings.notificationSettings.daysBeforeReminder}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notificationSettings: { ...prev.notificationSettings, daysBeforeReminder: Number(e.target.value) }
                    }))}
                    required
                  />
                </div>

                <Button type="submit" size="sm" className="pt-2">Save Barcode & Alerts</Button>
              </form>
            </div>
          )}

          {activeSubTab === 'backup' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg text-textPrimary">Backup & Database Recovery</h3>
                <p className="text-xs text-textSecondary mt-0.5">Create emergency snapshot copies or restore dataset logs.</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 max-w-md">
                <div className="flex items-center space-x-2 text-textPrimary font-semibold text-sm">
                  <HardDrive size={18} className="text-primary" />
                  <span>Create System Backup</span>
                </div>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Downloads a local backup file containing all current inventory settings, suppliers lists, active order data, and payout logs.
                </p>
                <Button onClick={handleBackup} className="w-full text-xs">
                  Create Backup Snapshot
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <ConfirmModal
        isOpen={catDeleteConfirm.isOpen}
        onClose={() => setCatDeleteConfirm({ isOpen: false, cat: null })}
        onConfirm={executeDeleteCat}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${catDeleteConfirm.cat}"?`}
        confirmText="Delete Category"
      />

      <ConfirmModal
        isOpen={unitDeleteConfirm.isOpen}
        onClose={() => setUnitDeleteConfirm({ isOpen: false, unit: null })}
        onConfirm={executeDeleteUnit}
        title="Delete Unit"
        description={`Are you sure you want to delete the unit "${unitDeleteConfirm.unit}"?`}
        confirmText="Delete Unit"
      />
    </div>
  );
};

export default Settings;
