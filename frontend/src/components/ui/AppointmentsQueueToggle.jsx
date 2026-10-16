import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

const AppointmentsQueueToggle = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Active state based on current URL path
  const isQueue = location.pathname.startsWith('/clinic/queue');
  const isAppointments = !isQueue && location.pathname.startsWith('/clinic/appointments');

  return (
    <div className={cn("flex items-center", className)}>
      <div className="grid grid-cols-2 sm:inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/90 shadow-2xs w-full sm:w-auto">
        {/* Appointments Tab */}
        <button
          type="button"
          onClick={() => navigate('/clinic/appointments')}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none",
            isAppointments
              ? "bg-blue-600 text-white font-bold shadow-xs ring-1 ring-blue-700/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          )}
          aria-current={isAppointments ? 'page' : undefined}
        >
          <Calendar
            size={16}
            className={cn(
              "shrink-0 transition-colors",
              isAppointments ? "text-white" : "text-slate-500"
            )}
          />
          <span>Appointments</span>
        </button>

        {/* Queue Tab */}
        <button
          type="button"
          onClick={() => navigate('/clinic/queue')}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer select-none",
            isQueue
              ? "bg-blue-600 text-white font-bold shadow-xs ring-1 ring-blue-700/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
          )}
          aria-current={isQueue ? 'page' : undefined}
        >
          <Users
            size={16}
            className={cn(
              "shrink-0 transition-colors",
              isQueue ? "text-white" : "text-slate-500"
            )}
          />
          <span>Queue</span>
        </button>
      </div>
    </div>
  );
};

export default AppointmentsQueueToggle;
export { AppointmentsQueueToggle };
