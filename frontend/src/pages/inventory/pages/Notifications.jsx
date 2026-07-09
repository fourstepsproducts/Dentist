import React, { useContext, useState } from 'react';
import { InventoryContext } from '../../../context/InventoryContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { 
  Bell, AlertTriangle, Info, AlertCircle, 
  CheckCheck, Trash2, ShieldAlert 
} from 'lucide-react';

const Notifications = () => {
  const { notifications } = useContext(InventoryContext);

  const [activeTab, setActiveTab] = useState('All');
  const [clearedIds, setClearedIds] = useState([]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger': return <AlertCircle className="text-rose-600" size={18} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  const getAlertBg = (type) => {
    switch (type) {
      case 'danger': return 'bg-red-50 border-red-100 text-red-900';
      case 'warning': return 'bg-amber-50/50 border-amber-100 text-amber-900';
      default: return 'bg-blue-50/50 border-blue-100 text-blue-900';
    }
  };

  const categories = ['All', 'Low Stock', 'Payments', 'Purchase Orders', 'Material Requests'];

  const visibleNotifications = notifications
    .filter(n => !clearedIds.includes(n.id))
    .filter(n => activeTab === 'All' ? true : n.category === activeTab);

  const handleClear = (id) => {
    setClearedIds(prev => [...prev, id]);
  };

  const handleClearAll = () => {
    setClearedIds(notifications.map(n => n.id));
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">Notifications</h1>
          <p className="text-textSecondary text-sm mt-1">Alerts for critical stock counts, overdue payment timelines, and active doctor requests.</p>
        </div>

        {visibleNotifications.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearAll} className="text-rose-600 hover:bg-rose-50 border-rose-200">
            <Trash2 size={14} className="mr-1.5" /> Clear All
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit text-xs font-bold">
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveTab(cat)} 
            className={`px-3 py-2 rounded-lg transition-all ${
              activeTab === cat ? 'bg-white text-textPrimary shadow-sm' : 'text-textSecondary hover:text-textPrimary'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {visibleNotifications.map((notif) => (
          <Card 
            key={notif.id} 
            className={`p-4 flex items-start gap-4 border border-l-4 transition-all hover:translate-x-0.5 ${getAlertBg(notif.type)} ${
              notif.type === 'danger' ? 'border-l-red-600' :
              notif.type === 'warning' ? 'border-l-amber-500' :
              'border-l-blue-600'
            }`}
          >
            <div className="p-1 rounded-lg bg-white shadow-sm shrink-0">
              {getAlertIcon(notif.type)}
            </div>
            
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-textSecondary">{notif.category}</span>
                <span className="text-[10px] text-textSecondary font-semibold">Just Now</span>
              </div>
              <p className="text-sm font-semibold text-textPrimary leading-relaxed">{notif.message}</p>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleClear(notif.id)}
              className="h-8 w-8 text-textSecondary hover:text-textPrimary"
              title="Dismiss"
            >
              <CheckCheck size={16} />
            </Button>
          </Card>
        ))}

        {visibleNotifications.length === 0 && (
          <Card className="p-8 text-center text-slate-500 border border-slate-200 bg-slate-50/50">
            <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 mb-3">
              <Bell size={20} />
            </div>
            <h3 className="font-bold text-textPrimary text-base">All clear!</h3>
            <p className="text-xs text-textSecondary mt-1">No alerts or notifications at this time.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Notifications;
