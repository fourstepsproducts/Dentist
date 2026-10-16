import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import AppointmentsQueueToggle from '../../../components/ui/AppointmentsQueueToggle';
import { showToast } from '../../../utils/toast';
import {
  Clock, UserCheck, Stethoscope, RefreshCw, Phone,
  Calendar, MessageSquare, Filter, User, AlertCircle, ArrowRight
} from 'lucide-react';
import { cn } from '../../../lib/utils';

// Helper for formatted time (e.g. "10:00 AM")
const formatTimeOnly = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Helper for formatted date (e.g. "Oct 16, 2026")
const formatDateShort = (dateString) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const PatientQueue = () => {
  const navigate = useNavigate();

  // State
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState({ total: 0, scheduled: 0, missed: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('all');
  const [doctorsList, setDoctorsList] = useState([]);
  const [checkingInId, setCheckingInId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Polling ref
  const pollingTimerRef = useRef(null);

  // Fetch doctors for filter
  const fetchDoctors = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/doctors', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctorsList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  }, []);

  // Fetch eligible appointments in queue order
  const fetchQueue = useCallback(async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const token = localStorage.getItem('token');
      const docParam = selectedDoctorFilter && selectedDoctorFilter !== 'all' ? `?doctorId=${selectedDoctorFilter}` : '';
      const res = await api.get(`/queue${docParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setQueue(res.data.queue || []);
      setStats(res.data.stats || { total: 0, scheduled: 0, missed: 0 });
    } catch (err) {
      console.error('Failed to fetch queue:', err);
      showToast.error('Failed to refresh queue data.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [selectedDoctorFilter]);

  // Initial load & doctor list
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  useEffect(() => {
    fetchQueue(true);
  }, [fetchQueue]);

  // Auto-refresh every 20 seconds to keep synchronized
  useEffect(() => {
    pollingTimerRef.current = setInterval(() => {
      fetchQueue(false);
    }, 20000);

    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [fetchQueue]);

  // Check In Patient
  const handleCheckIn = async (appointmentId) => {
    try {
      setCheckingInId(appointmentId);
      const token = localStorage.getItem('token');
      await api.put(
        `/appointments/${appointmentId}/status`,
        { status: 'Checked In' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast.success('Patient checked in successfully.');
      fetchQueue(false);
    } catch (err) {
      console.error('Failed to check in patient:', err);
      showToast.error(err.response?.data?.message || 'Failed to check in patient.');
    } finally {
      setCheckingInId(null);
    }
  };

  // Manual Status Change
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setUpdatingId(appointmentId);
      const token = localStorage.getItem('token');
      await api.put(
        `/appointments/${appointmentId}/status`,
        { status: newStatus, isManualOverride: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast.success(`Appointment status updated to "${newStatus}".`);
      fetchQueue(false);
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast.error('Failed to update appointment status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Queue Management</h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Desk
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Clinic Portal / Queue prioritization of eligible appointments based on patient registration order.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchQueue(true)}
            disabled={loading}
            className="text-xs text-slate-600 bg-white"
          >
            <RefreshCw size={13} className={cn("mr-1.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Appointments / Queue Toggle Switcher */}
      <AppointmentsQueueToggle />

      {/* Doctor Filter & Compact Inline Status Bar */}
      <Card className="p-3.5 bg-slate-50/70 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Compact Status Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Queue Status:</span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
            <span>Total Waiting to Check In:</span>
            <strong className="font-extrabold text-slate-900">{stats.total}</strong>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 shadow-2xs">
            <Clock size={13} className="text-blue-600" />
            <span>Scheduled:</span>
            <strong className="font-extrabold text-blue-900">{stats.scheduled}</strong>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 shadow-2xs">
            <AlertCircle size={13} className="text-rose-600" />
            <span>Missed:</span>
            <strong className="font-extrabold text-rose-900">{stats.missed}</strong>
          </span>
        </div>

        {/* Doctor Queue Filter */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0 hidden sm:inline">Doctor Filter:</span>
          <div className="w-full sm:w-64">
            <Select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Doctors (Combined Queue Overview)' },
                ...doctorsList.map((doc) => ({
                  value: doc._id,
                  label: `Dr. ${doc.name} (${doc.specialization || 'Dentist'})`,
                })),
              ]}
              className="text-xs font-medium"
            />
          </div>
          {selectedDoctorFilter !== 'all' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedDoctorFilter('all')}
              className="text-xs text-slate-500 hover:text-slate-800 shrink-0 h-8 px-2.5"
            >
              Clear Filter
            </Button>
          )}
        </div>
      </Card>

      {/* Eligible Appointments Queue Table */}
      <Card className="p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-4 gap-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-blue-600" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Active Patient Queue
            </h2>
            <span className="ml-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
              {queue.length} Eligible Appointments
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> #1 Next Up
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Scheduled
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Missed
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse text-sm">
            Loading patient queue...
          </div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic text-sm border border-dashed border-slate-200 rounded-xl">
            No pending Scheduled or Missed appointments waiting in the queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50/70">
                  <th className="py-3 px-3">S.No.</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-3">Patient ID</th>
                  <th className="py-3 px-4">Appointment Date</th>
                  <th className="py-3 px-4">Appointment Time</th>
                  <th className="py-3 px-4">Doctor</th>
                  <th className="py-3 px-4">Chief Complaint</th>
                  <th className="py-3 px-4">Appointment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {queue.map((item) => {
                  const patient = item.patient;
                  const docName = item.doctorName || item.doctor?.name || 'Unassigned';
                  const apptDate = formatDateShort(item.date);
                  const apptTime = formatTimeOnly(item.date);
                  const isTopPriority = item.serialNumber === 1;
                  const isMissed = item.status === 'Missed';

                  return (
                    <tr
                      key={item._id}
                      className={cn(
                        "transition-colors hover:bg-slate-50/80",
                        isTopPriority ? "bg-amber-50/20" : isMissed ? "bg-rose-50/10" : ""
                      )}
                    >
                      {/* 1. S.No. */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase border inline-flex items-center gap-1",
                              isTopPriority
                                ? "bg-amber-100 text-amber-900 border-amber-300 shadow-2xs ring-1 ring-amber-400 font-extrabold"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            )}
                          >
                            #{item.serialNumber}
                            {isTopPriority && (
                              <span className="text-[10px] font-extrabold text-amber-800 bg-amber-200/80 px-1 py-0.2 rounded ml-1 tracking-wide">
                                NEXT
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* 2. Patient Name */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {patient?.name || '—'}
                        </span>
                      </td>

                      {/* 3. Phone Number */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                        {patient?.phone ? (
                          <div className="flex items-center gap-1.5 font-medium">
                            <Phone size={12} className="text-slate-400 shrink-0" />
                            <span>{patient.phone}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* 4. Patient ID */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {patient?.patientId || '—'}
                        </span>
                      </td>

                      {/* 5. Appointment Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-800 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>{apptDate}</span>
                        </div>
                      </td>

                      {/* 6. Appointment Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-900 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-blue-500 shrink-0" />
                          <span>{apptTime}</span>
                        </div>
                      </td>

                      {/* 7. Doctor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope size={13} className="text-blue-500 shrink-0" />
                          <span className="font-semibold text-slate-800 text-xs">{docName}</span>
                        </div>
                      </td>

                      {/* 8. Chief Complaint */}
                      <td className="py-3.5 px-4 max-w-[200px]">
                        {item.chiefComplaint?.trim() ? (
                          <div
                            className="text-xs text-slate-700 truncate bg-slate-50 border border-slate-200 rounded px-2.5 py-1"
                            title={item.chiefComplaint}
                          >
                            {item.chiefComplaint}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No complaint</span>
                        )}
                      </td>

                      {/* 9. Appointment Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="w-[145px]">
                          <Select
                            value={item.status}
                            disabled={updatingId === item._id}
                            onChange={(e) => handleStatusChange(item._id, e.target.value)}
                            options={[
                              { value: 'Scheduled', label: 'Scheduled', dot: 'blue' },
                              { value: 'Checked In', label: 'Checked In', dot: 'green' },
                              { value: 'Missed', label: 'Missed', dot: 'red' },
                            ]}
                            size="sm"
                            className="w-full"
                          />
                        </div>
                      </td>

                      {/* 10. Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleCheckIn(item._id)}
                            disabled={checkingInId === item._id}
                            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 shadow-2xs"
                            title="Check in this patient"
                          >
                            <UserCheck size={13} className="mr-1" />
                            {checkingInId === item._id ? 'Checking In...' : 'Check In'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PatientQueue;
