import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { Card } from '../../../components/ui/Card';
import { PatientSelector } from '../../../components/ui/PatientSelector';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Plus, HelpCircle, Calendar, Clock, BadgeAlert } from 'lucide-react';
import { cn } from '../../../lib/utils';

const Appointments = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState('Scheduled');
  const [submitting, setSubmitting] = useState(false);

  const fetchAppointments = async (patientId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get(`/appointments?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientChange = (patient) => {
    setSelectedPatient(patient);
    setDate('');
    setTime('');
    setStatus('Scheduled');
    if (patient) {
      fetchAppointments(patient._id);
    } else {
      setAppointments([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time || !selectedPatient) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      
      // Combine date and time
      const dateTime = new Date(`${date}T${time}`);

      await api.post(
        '/appointments',
        {
          patient: selectedPatient._id,
          date: dateTime,
          status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDate('');
      setTime('');
      setStatus('Scheduled');
      fetchAppointments(selectedPatient._id);
    } catch (err) {
      console.error('Failed to schedule appointment:', err);
      alert('Failed to schedule appointment');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointments</h1>
        <p className="text-slate-500 text-sm mt-1">Clinic Portal / Schedule and track patient dentist visits.</p>
      </div>

      {/* Patient Selection Header */}
      <Card className="p-4 bg-slate-50/50">
        <PatientSelector
          value={selectedPatient?._id || ''}
          onChange={handlePatientChange}
        />
      </Card>

      {!selectedPatient ? (
        <Card className="p-12 text-center text-slate-400">
          <HelpCircle size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-base font-semibold text-slate-600">No Patient Selected</p>
          <p className="text-xs text-slate-400 mt-1">Please select an active patient from the dropdown above to manage appointments.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Appointment Form */}
          <Card className="p-6 h-fit lg:col-span-1">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4">Schedule Appointment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Appointment Date *</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Time Slot *</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm bg-white"
                  required
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Waiting">Waiting</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                <Plus size={16} className="mr-1.5" />
                {submitting ? 'Scheduling...' : 'Schedule Visit'}
              </Button>
            </form>
          </Card>

          {/* Appointments List */}
          <Card className="p-6 lg:col-span-2 overflow-hidden">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Calendar size={16} className="text-blue-500" />
              Patient Appointment Logs
            </h3>
            {loading ? (
              <div className="p-8 text-center text-slate-400 animate-pulse text-sm">
                Loading appointments...
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-sm">
                No appointments booked for this patient.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Scheduled Date</th>
                      <th className="px-4 py-3 font-medium">Time Slot</th>
                      <th className="px-4 py-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.map((appt, index) => {
                      const dt = formatDateTime(appt.date);
                      return (
                        <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            {dt.date}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <Clock size={14} className="text-slate-400" />
                              {dt.time}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded text-xs font-bold uppercase",
                              appt.status === 'Completed' && "bg-green-50 text-green-700 border border-green-200",
                              appt.status === 'Scheduled' && "bg-blue-50 text-blue-700 border border-blue-200",
                              appt.status === 'Waiting' && "bg-amber-50 text-amber-700 border border-amber-200",
                              appt.status === 'Cancelled' && "bg-red-50 text-red-700 border border-red-200"
                            )}>
                              {appt.status}
                            </span>
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
      )}
    </div>
  );
};

export default Appointments;
