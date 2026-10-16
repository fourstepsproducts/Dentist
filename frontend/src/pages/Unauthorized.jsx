import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldAlert, LogOut, Home, UserCheck } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const goBack = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    const role = (user.role || '').toLowerCase();
    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'inventory') {
      navigate('/inventory/dashboard');
    } else {
      navigate('/clinic/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Lighting / Gradient Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8 sm:p-10 text-center relative z-10"
      >
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-100 shadow-inner">
          <ShieldAlert size={40} strokeWidth={2} />
        </div>

        <span className="inline-block px-3.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full uppercase tracking-wider mb-3">
          401 - Unauthorized
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Access Restricted
        </h1>

        <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
          You do not have permission to view this page. If you require access to this section, please contact your system administrator.
        </p>

        {user && (
          <div className="mb-8 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs flex items-center justify-between text-slate-600">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <UserCheck size={16} className="text-slate-400" /> Current Account:
            </span>
            <span className="font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-xs capitalize">
              {user.name || user.email} ({user.role})
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={goBack}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 hover:-translate-y-[1px]"
          >
            <Home size={18} />
            Return to Dashboard
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-semibold text-sm transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;
