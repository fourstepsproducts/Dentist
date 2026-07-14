import toast from 'react-hot-toast';

export const showToast = {
  success: (msg) => toast.success(msg, {
    style: {
      border: '1px solid #10B981',
      padding: '16px',
      color: '#065F46',
      background: '#ECFDF5',
      fontWeight: '600'
    },
    iconTheme: {
      primary: '#10B981',
      secondary: '#FFFAEE',
    },
  }),
  error: (msg) => toast.error(msg, {
    style: {
      border: '1px solid #EF4444',
      padding: '16px',
      color: '#991B1B',
      background: '#FEF2F2',
      fontWeight: '600'
    },
    iconTheme: {
      primary: '#EF4444',
      secondary: '#FFFAEE',
    },
  }),
  warning: (msg) => toast(msg, {
    icon: '⚠️',
    style: {
      border: '1px solid #F59E0B',
      padding: '16px',
      color: '#92400E',
      background: '#FEF3C7',
      fontWeight: '600'
    },
  }),
  info: (msg) => toast(msg, {
    icon: 'ℹ️',
    style: {
      border: '1px solid #3B82F6',
      padding: '16px',
      color: '#1E40AF',
      background: '#EFF6FF',
      fontWeight: '600'
    },
  }),
};
