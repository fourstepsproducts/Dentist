import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../../api';
import { Card } from '../../../components/ui/Card';
import { PatientSelector } from '../../../components/ui/PatientSelector';
import DoctorSelector from '../../../components/ui/DoctorSelector';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Plus, HelpCircle, Calendar, Clock, Stethoscope, UserCheck, CheckCircle2, ArrowRight, Phone, User, MessageSquare, FileText } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { showToast } from '../../../utils/toast';
import AppointmentsQueueToggle from '../../../components/ui/AppointmentsQueueToggle';

const STATUS_OPTIONS = [
  'Scheduled',
  'Checked In',
  'Missed',
];

const STATUS_BADGE_STYLE = {
  'Scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
  'Checked In': 'bg-amber-50 text-amber-700 border-amber-200',
  'Missed': 'bg-red-50 text-red-700 border-red-200',
};

const normalizeStatus = (status) => {
  if (status === 'No Show' || status === 'Cancelled') return 'Missed';
  if (status === 'Confirmed') return 'Scheduled';
  if (status === 'Completed') return 'Checked In';
  return status || 'Scheduled';
};

const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

const Appointments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Upcoming appointments state (when no patient selected)
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);

  // Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
  const [status, setStatus] = useState('Scheduled');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [checkingInId, setCheckingInId] = useState(null);

  const handleQuickCheckInToQueue = async (appointment, e) => {
    if (e) e.stopPropagation();
    try {
      setCheckingInId(appointment._id);
      const token = localStorage.getItem('token');
      const res = await api.post(
        '/queue/checkin',
        {
          appointmentId: appointment._id,
          patientId: appointment.patient?._id || appointment.patient,
          doctorId: appointment.doctor?._id || appointment.doctor || null,
          doctorName: appointment.doctorName || appointment.doctor?.name || '',
          chiefComplaint: appointment.chiefComplaint || '',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast.success(res.data.message || 'Patient checked in! Token issued.');
      if (selectedPatient?._id) {
        fetchAppointments(selectedPatient._id);
      } else {
        fetchUpcomingAppointments();
      }
    } catch (err) {
      console.error('Check-in failed:', err);
      showToast.error(err.response?.data?.message || 'Failed to check in patient.');
    } finally {
      setCheckingInId(null);
    }
  };

  const fetchAppointments = useCallback(async (patientId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get(`/appointments?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      showToast.error('Failed to load patient appointment history.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUpcomingAppointments = useCallback(async () => {
    try {
      setLoadingUpcoming(true);
      const token = localStorage.getItem('token');
      const res = await api.get('/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const upcoming = (res.data || [])
        .filter((appt) => {
          if (!appt.date) return false;
          const apptDate = new Date(appt.date);
          return apptDate >= startOfToday;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setUpcomingAppointments(upcoming);
    } catch (err) {
      console.error('Failed to fetch upcoming appointments:', err);
      showToast.error('Failed to load upcoming appointments.');
      setUpcomingAppointments([]);
    } finally {
      setLoadingUpcoming(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedPatient) {
      fetchUpcomingAppointments();
    }
  }, [selectedPatient, fetchUpcomingAppointments]);

  const groupAppointmentsByDate = (appts) => {
    const groups = {};
    const todayStr = new Date().toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();

    appts.forEach((appt) => {
      const d = new Date(appt.date);
      const dateStr = d.toDateString();

      let label = '';
      const formattedMonthDay = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }).toUpperCase();

      if (dateStr === todayStr) {
        label = `TODAY · ${formattedMonthDay}`;
      } else if (dateStr === tomorrowStr) {
        label = `TOMORROW · ${formattedMonthDay}`;
      } else {
        label = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).toUpperCase();
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(appt);
    });

    return groups;
  };

  const handlePatientChange = useCallback((patient) => {
    setSelectedPatient(patient);
    setDate('');
    setTime('');
    setSelectedDoctorId('');
    setSelectedDoctorName('');
    setStatus('Scheduled');
    setChiefComplaint('');
    if (patient?._id) {
      fetchAppointments(patient._id);
    } else {
      setAppointments([]);
    }
  }, [fetchAppointments]);

  const lastHandledPatientIdRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const patientIdFromParam = params.get('patientId');
    const patientFromState = location.state?.patient;

    const targetId = patientFromState?._id || patientIdFromParam;

    if (!targetId) {
      lastHandledPatientIdRef.current = null;
      return;
    }

    if (targetId === lastHandledPatientIdRef.current) return;
    lastHandledPatientIdRef.current = targetId;

    if (patientFromState && patientFromState._id === targetId) {
      handlePatientChange(patientFromState);
    } else if (patientIdFromParam) {
      const token = localStorage.getItem('token');
      api.get(`/patients/${patientIdFromParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        if (res.data) {
          handlePatientChange(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load patient from URL:', err);
      });
    }
  }, [location.search, location.state, handlePatientChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time || !selectedPatient || (!selectedDoctorId && !selectedDoctorName)) {
      showToast.warning('Patient, Date, Time, and Doctor are required.');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const dateTime = new Date(`${date}T${time}`);

      await api.post(
        '/appointments',
        {
          patient: selectedPatient._id,
          doctor: selectedDoctorId || null,
          doctorName: selectedDoctorName || '',
          date: dateTime,
          status,
          chiefComplaint: chiefComplaint.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDate('');
      setTime('');
      setSelectedDoctorId('');
      setSelectedDoctorName('');
      setStatus('Scheduled');
      setChiefComplaint('');

      fetchAppointments(selectedPatient._id);
      showToast.success('Appointment scheduled successfully.');
    } catch (err) {
      console.error('Failed to schedule appointment:', err);
      showToast.error('Failed to schedule appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      setUpdatingId(appointmentId);
      const token = localStorage.getItem('token');
      await api.put(
        `/appointments/${appointmentId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments((prev) =>
        prev.map((a) => (a._id === appointmentId ? { ...a, status: newStatus } : a))
      );
      showToast.success(`Appointment status updated to "${newStatus}".`);
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast.error('Failed to update appointment status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCheckInAndCreateVisit = async (appointment) => {
    try {
      if (appointment.status !== 'Checked In' && appointment.status !== 'Completed') {
        const token = localStorage.getItem('token');
        await api.put(
          `/appointments/${appointment._id}/status`,
          { status: 'Checked In' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      showToast.success('Patient checked in! Navigating to Clinical Visits...');
      navigate(`/clinic/diagnosis-treatment?patientId=${selectedPatient._id}&appointmentId=${appointment._id}`);
    } catch (err) {
      console.error('Failed to check in patient:', err);
      navigate(`/clinic/diagnosis-treatment?patientId=${selectedPatient._id}&appointmentId=${appointment._id}`);
    }
  };

  const formatDateTime = (dateString) => {
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      time: d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const patientAge = calculateAge(selectedPatient?.dateOfBirth);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
        <p className="text-slate-500 text-sm mt-1">Clinic Portal / Schedule future bookings and manage arrival status.</p>
      </div>

      {/* Appointments / Queue Toggle Switcher */}
      <AppointmentsQueueToggle />

      {/* Patient Selection Header */}
      <Card className="p-4 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PatientSelector
          value={selectedPatient?._id || ''}
          selectedPatient={selectedPatient}
          onChange={handlePatientChange}
        />
        {selectedPatient && (
          <div className="flex items-center gap-3 flex-wrap bg-white p-2.5 px-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Phone size={13} className="text-blue-600 shrink-0" />
              <span>Mobile:</span>
              <strong className="text-slate-900 font-semibold">{selectedPatient.phone || '—'}</strong>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Calendar size={13} className="text-blue-600 shrink-0" />
              <span>Age:</span>
              <strong className="text-slate-900 font-semibold">
                {patientAge !== null ? `${patientAge} yrs` : '—'}
              </strong>
            </div>
            {selectedPatient.gender && (
              <>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <User size={13} className="text-blue-600 shrink-0" />
                  <span>Gender:</span>
                  <strong className="text-slate-900 font-semibold">{selectedPatient.gender}</strong>
                </div>
              </>
            )}
            <div className="h-4 w-px bg-slate-200" />
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-xs">
              ID: {selectedPatient.patientId}
            </span>
          </div>
        )}
      </Card>

      {!selectedPatient ? (
        <Card className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Upcoming Appointments
              </h2>
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs">
                {upcomingAppointments.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchUpcomingAppointments}
              disabled={loadingUpcoming}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Refresh
            </Button>
          </div>

          {loadingUpcoming ? (
            <div className="p-12 text-center text-slate-400 animate-pulse text-sm">
              Loading upcoming appointments...
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic text-sm border border-dashed border-slate-200 rounded-xl">
              No upcoming appointments scheduled across the clinic.
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupAppointmentsByDate(upcomingAppointments)).map(([groupLabel, apptGroup]) => (
                <div key={groupLabel} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      {groupLabel}
                    </span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <div className="divide-y divide-slate-100 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                    {apptGroup.map((appt) => {
                      const dt = formatDateTime(appt.date);
                      const patientObj = appt.patient;
                      const patientName = patientObj?.name || 'Unknown Patient';
                      const patientId = patientObj?.patientId || '—';
                      const docName = appt.doctorName || appt.doctor?.name || '—';
                      const apptStatus = normalizeStatus(appt.status);

                      return (
                        <div
                          key={appt._id}
                          onClick={() => patientObj && handlePatientChange(patientObj)}
                          className="p-3.5 sm:p-4 hover:bg-slate-50/90 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                        >
                          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                            {/* Time Slot */}
                            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm min-w-[90px]">
                              <Clock size={15} className="text-blue-600 shrink-0" />
                              <span>{dt.time}</span>
                            </div>

                            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                            {/* Patient Info */}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                                  {patientName}
                                </span>
                                <span className="px-2 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded">
                                  ID: {patientId}
                                </span>
                              </div>

                              {docName !== '—' && (
                                <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                  <Stethoscope size={13} className="text-slate-400" />
                                  Doctor: <strong className="text-slate-700">{docName}</strong>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Middle Gap: Complaint or No Complaint */}
                          <div className="flex-1 min-w-0 sm:px-4">
                            {appt.chiefComplaint?.trim() ? (
                              <div className="text-xs text-slate-700 flex items-center gap-1.5 bg-amber-50/80 border border-amber-200/70 rounded-md px-2.5 py-1.5 w-fit max-w-full">
                                <MessageSquare size={13} className="text-amber-600 shrink-0" />
                                <span className="font-semibold text-amber-900 shrink-0">Complaint:</span>
                                <span className="truncate text-slate-800" title={appt.chiefComplaint}>
                                  {appt.chiefComplaint}
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-400 italic flex items-center gap-1.5">
                                <MessageSquare size={13} className="text-slate-300 shrink-0" />
                                <span>No complaint</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                            {/* Status Badge */}
                            <span
                              className={cn(
                                "px-2.5 py-1 rounded-md text-xs font-bold uppercase border",
                                STATUS_BADGE_STYLE[apptStatus] || "bg-slate-100 text-slate-700 border-slate-200"
                              )}
                            >
                              {apptStatus}
                            </span>

                            {/* Check In Action for Scheduled */}
                            {apptStatus === 'Scheduled' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleQuickCheckInToQueue(appt, e)}
                                disabled={checkingInId === appt._id}
                                className="text-xs font-semibold text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-7 px-2.5"
                                title="Check in this patient and issue queue token"
                              >
                                <UserCheck size={13} className="mr-1 text-emerald-600" />
                                {checkingInId === appt._id ? 'Checking In...' : 'Check In'}
                              </Button>
                            )}

                            {apptStatus === 'Checked In' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/clinic/queue');
                                }}
                                className="text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50 h-7 px-2"
                                title="View in live queue"
                              >
                                In Queue
                                <ArrowRight size={12} className="ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Appointment Form */}
          <Card className="p-6 h-fit lg:col-span-1">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4">Schedule Appointment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Time Slot <span className="text-red-500">*</span>
                </label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Doctor <span className="text-red-500">*</span>
                </label>
                <DoctorSelector
                  type="internal"
                  value={selectedDoctorId || selectedDoctorName}
                  selectedDoctorName={selectedDoctorName}
                  onChange={(doc) => {
                    setSelectedDoctorId(doc._id || doc.doctorId || '');
                    setSelectedDoctorName(doc.name || doc.doctorName || '');
                  }}
                  placeholder="Select Doctor"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Status
                </label>
                <div className="p-2.5 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-blue-700 flex items-center justify-between">
                  <span>Scheduled</span>
                  <span className="text-[11px] text-slate-400 font-normal">Auto-assigned</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Chief Complaint
                </label>
                <textarea
                  rows={3}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Describe patient symptoms, concerns, or reason for visit..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 resize-y"
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                <Plus size={16} className="mr-1.5" />
                {submitting ? 'Scheduling...' : 'Schedule Appointment'}
              </Button>
            </form>
          </Card>

          {/* Appointments List */}
          <Card className="p-6 lg:col-span-2 overflow-hidden">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar size={16} className="text-blue-500" />
                Patient Appointment Logs ({appointments.length})
              </span>
            </h3>

            {loading ? (
              <div className="p-8 text-center text-slate-400 animate-pulse text-sm">
                Loading appointments...
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-sm border border-dashed border-slate-200 rounded-xl">
                No appointments booked for this patient yet.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {appointments.map((appt) => {
                  const dt = formatDateTime(appt.date);
                  const docName = appt.doctorName || appt.doctor?.name || '—';
                  const isUpdating = updatingId === appt._id;
                  const apptStatus = normalizeStatus(appt.status);

                  return (
                    <div
                      key={appt._id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <Calendar size={15} className="text-blue-600" />
                              {dt.date}
                            </span>
                            <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                              <Clock size={15} className="text-slate-400" />
                              {dt.time}
                            </span>
                          </div>

                          {docName !== '—' && (
                            <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                              <Stethoscope size={13} className="text-slate-400" />
                              Doctor: <strong className="text-slate-800">{docName}</strong>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-[145px]">
                            <Select
                              value={apptStatus}
                              disabled={isUpdating}
                              onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                              options={[
                                { value: 'Scheduled', label: 'Scheduled', dot: 'blue' },
                                { value: 'Checked In', label: 'Checked In', dot: 'green' },
                                { value: 'Missed', label: 'Missed', dot: 'red' },
                              ]}
                              size="sm"
                              className="w-full text-xs"
                            />
                          </div>

                          {/* Quick Check In to Queue for Scheduled */}
                          {apptStatus === 'Scheduled' && (
                            <Button
                              size="sm"
                              onClick={() => handleQuickCheckInToQueue(appt)}
                              disabled={checkingInId === appt._id}
                              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <UserCheck size={14} className="mr-1" />
                              {checkingInId === appt._id ? 'Checking In...' : 'Check In to Queue'}
                            </Button>
                          )}

                          {/* Check In for Returning Missed Patient */}
                          {apptStatus === 'Missed' && (
                            <Button
                              size="sm"
                              onClick={() => handleQuickCheckInToQueue(appt)}
                              disabled={checkingInId === appt._id}
                              className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-2xs"
                              title="Register arrival of patient who missed their previous appointment"
                            >
                              <UserCheck size={14} className="mr-1" />
                              {checkingInId === appt._id ? 'Checking In...' : 'Check In (Returning Patient)'}
                            </Button>
                          )}

                          {apptStatus === 'Checked In' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate('/clinic/queue')}
                              className="text-xs font-semibold text-blue-700 border-blue-200 hover:bg-blue-50"
                            >
                              In Live Queue
                              <ArrowRight size={13} className="ml-1" />
                            </Button>
                          )}

                          {/* Check In / Create Visit Quick Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCheckInAndCreateVisit(appt)}
                            className="text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50"
                          >
                            <UserCheck size={14} className="mr-1 text-blue-600" />
                            Clinical Visit
                            <ArrowRight size={13} className="ml-1" />
                          </Button>
                        </div>
                      </div>

                      {/* Chief Complaint Display */}
                      {appt.chiefComplaint && (
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-950 flex items-start gap-2.5">
                          <MessageSquare size={15} className="text-amber-600 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-amber-900 block mb-0.5">Chief Complaint</span>
                            <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                              {appt.chiefComplaint}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Patient Details Footer Row */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-xs flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3 flex-wrap text-slate-600">
                          <div className="flex items-center gap-1">
                            <Phone size={13} className="text-slate-400" />
                            <span className="font-medium">Mobile:</span>
                            <strong className="text-slate-800">{selectedPatient?.phone || '—'}</strong>
                          </div>
                          <div className="h-3 w-px bg-slate-200" />
                          <div className="flex items-center gap-1">
                            <Calendar size={13} className="text-slate-400" />
                            <span className="font-medium">Age:</span>
                            <strong className="text-slate-800">
                              {patientAge !== null ? `${patientAge} yrs` : '—'}
                            </strong>
                          </div>
                          {selectedPatient?.gender && (
                            <>
                              <div className="h-3 w-px bg-slate-200" />
                              <div className="flex items-center gap-1">
                                <User size={13} className="text-slate-400" />
                                <span className="font-medium">Gender:</span>
                                <strong className="text-slate-800">{selectedPatient.gender}</strong>
                              </div>
                            </>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">
                          Patient ID: <strong className="text-slate-700">{selectedPatient?.patientId}</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default Appointments;
