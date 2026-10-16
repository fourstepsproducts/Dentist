import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../../api';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Modal } from '../../../components/ui/Modal';
import { showToast } from '../../../utils/toast';
import {
  Search, Plus, User, Phone, CalendarDays, Stethoscope,
  ClipboardList, ChevronRight, HelpCircle, Clock,
  UserCheck, Activity, MessageSquare, Gift, Loader2,
  FileText, BookOpen, IndianRupee,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

import DoctorSelector from '../../../components/ui/DoctorSelector';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const age = (dob) => {
  if (!dob) return null;
  const b = new Date(dob), t = new Date();
  let a = t.getFullYear() - b.getFullYear();
  if (t.getMonth() - b.getMonth() < 0 || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
  return `${a} yrs`;
};

const todayISO = () => new Date().toISOString().split('T')[0];
const GENDER_COLOR = { Male: '#2563EB', Female: '#EC4899', Other: '#7C3AED' };

const DEFAULT_FORM = {
  visitType: 'normal',   // 'normal' | 'specialist'
  visitDate: todayISO(),
  consultingDoctor: '',  // specialist only
  consultingDoctorId: '',
  attendingDoctor: '',
  attendingDoctorId: '',
  appointmentId: '',
  chiefComplaint: '',
  notes: '',
  incentives: '',
  consultingDoctorIncentive: '',
  attendingDoctorIncentive: '',
};

// ─── Reusable EMR sub-components ─────────────────────────────────────────────

/** Single label + value row with optional icon */
const EMRRow = ({ label, value, icon: Icon }) => {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-3.5 border-b border-gray-100 last:border-0">
      <span className="w-48 shrink-0 flex items-center gap-2 pt-0.5">
        {Icon && <Icon size={14} className="text-gray-400 shrink-0" />}
        <span className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 leading-tight">{label}</span>
      </span>
      <p className="text-[16px] text-gray-900 font-medium leading-relaxed flex-1 whitespace-pre-wrap">{value}</p>
    </div>
  );
};

/** Section divider inside a visit card */
const CardDivider = ({ title }) => (
  <div className="flex items-center gap-2 pt-1 pb-0.5">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">{title}</span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

/** Form label */
const FL = ({ children, req }) => (
  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
    {children}{req && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);

/** Textarea */
const TA = ({ name, value, onChange, placeholder, rows = 3, required }) => (
  <textarea
    name={name} value={value} onChange={onChange}
    placeholder={placeholder} rows={rows} required={required}
    className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm resize-none bg-white transition"
  />
);

/** Form section heading */
const FS = ({ title }) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
    <div className="flex-1 h-px bg-gray-100" />
  </div>
);

// ─── Visit Card — Premium Hospital EMR Card ─────────────────────────────────────
const VisitCard = ({ visit }) => {
  const isSpecialist = visit.visitType === 'specialist';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-sm font-bold">#{visit.visitNumber}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Visit #{visit.visitNumber}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <CalendarDays size={13} className="text-gray-400" />
              <span className="text-xs text-gray-500 font-medium">{fmt(visit.visitDate)}</span>
            </div>
          </div>
        </div>

        {/* Outline Badges */}
        <div>
          {isSpecialist ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border border-purple-500 text-purple-700 bg-transparent">
              <UserCheck size={13} />
              Specialist Case
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500 text-emerald-700 bg-transparent">
              <Stethoscope size={13} />
              Normal Treatment
            </span>
          )}
        </div>
      </div>

      {/* Doctor Information Section */}
      <div className="mb-6">
        <h4 className="text-[18px] font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          Doctor Information
        </h4>

        {isSpecialist ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consulting Doctor Card */}
            <div className="bg-[#F8FAFF] border border-blue-100 rounded-xl p-4">
              <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                👨‍⚕️ CONSULTING DOCTOR
              </span>
              <p className="text-[18px] font-bold text-blue-900 leading-tight">
                {visit.consultingDoctor || '—'}
              </p>
            </div>
            {/* Attending Doctor Card */}
            <div className="bg-[#F8FAFF] border border-blue-100 rounded-xl p-4">
              <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                👨‍⚕️ ATTENDING DOCTOR
              </span>
              <p className="text-[18px] font-bold text-blue-900 leading-tight">
                {visit.attendingDoctor || '—'}
              </p>
            </div>
          </div>
        ) : (
          /* Single Attending Doctor Card */
          <div className="bg-[#F8FAFF] border border-blue-100 rounded-xl p-4">
            <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
              👨‍⚕️ ATTENDING DOCTOR
            </span>
            <p className="text-[18px] font-bold text-blue-900 leading-tight">
              {visit.attendingDoctor || '—'}
            </p>
          </div>
        )}
      </div>

      {/* Clinical Assessment Section */}
      <div className="mb-6">
        <h4 className="text-[18px] font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Clinical Assessment
        </h4>
        <div className="divide-y divide-gray-100">
          <EMRRow icon={MessageSquare} label="Chief Complaint" value={visit.chiefComplaint || 'Not recorded'} />
          <EMRRow icon={Activity} label="Diagnosis" value={visit.diagnosis} />
          <EMRRow icon={ClipboardList} label="Treatment Performed" value={visit.treatmentPerformed || visit.treatmentPlan || '—'} />
        </div>
      </div>

      {/* Additional Information Section (if applicable) */}
      {(visit.notes || visit.incentives || visit.consultingDoctorIncentive > 0 || visit.attendingDoctorIncentive > 0) && (
        <div className="mb-4">
          <h4 className="text-[18px] font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Additional Information
          </h4>
          <div className="divide-y divide-gray-100">
            <EMRRow icon={BookOpen} label="Notes" value={visit.notes} />
            {isSpecialist && (visit.consultingDoctorIncentive > 0 || visit.attendingDoctorIncentive > 0) ? (
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-3.5 border-b border-gray-100 last:border-0">
                <span className="w-48 shrink-0 flex items-center gap-2 pt-0.5">
                  <Gift size={14} className="text-gray-400 shrink-0" />
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-gray-400 leading-tight">Incentives</span>
                </span>
                <div className="flex-1 space-y-1.5 text-sm">
                  <div className="flex items-center justify-between max-w-sm py-1 px-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
                    <span className="text-gray-600 text-xs font-medium">Consulting Doctor ({visit.consultingDoctor || 'Consultant'}):</span>
                    <span className="font-bold text-blue-700">₹{(visit.consultingDoctorIncentive || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between max-w-sm py-1 px-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100">
                    <span className="text-gray-600 text-xs font-medium">Attending Doctor ({visit.attendingDoctor || 'Attending'}):</span>
                    <span className="font-bold text-indigo-700">₹{(visit.attendingDoctorIncentive || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between max-w-sm pt-1 px-2.5 text-xs text-gray-500 font-semibold border-t border-gray-100">
                    <span>Total Allocated Incentive:</span>
                    <span className="text-gray-900 font-bold">₹{((visit.consultingDoctorIncentive || 0) + (visit.attendingDoctorIncentive || 0)).toLocaleString()}</span>
                  </div>
                  {visit.incentives && (
                    <p className="text-xs text-gray-500 italic pt-1">{visit.incentives}</p>
                  )}
                </div>
              </div>
            ) : (
              <EMRRow icon={Gift} label="Incentives" value={visit.incentives} />
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      {visit.createdBy?.name && (
        <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center gap-1.5 mt-4">
          <Clock size={12} />
          Recorded by
          <span className="font-semibold text-gray-600">{visit.createdBy.name}</span>
          · {fmt(visit.createdAt)}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DiagnosisTreatment = () => {
  const location = useLocation();

  const [patients, setPatients]                 = useState([]);
  const [patientsLoading, setPatientsLoading]   = useState(true);
  const [searchQuery, setSearchQuery]           = useState('');
  const [selectedPatient, setSelectedPatient]   = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [visits, setVisits]                     = useState([]);
  const [visitsLoading, setVisitsLoading]       = useState(false);
  const [isFormOpen, setIsFormOpen]             = useState(false);
  const [formData, setFormData]                 = useState(DEFAULT_FORM);
  const [saving, setSaving]                     = useState(false);

  // Fetch patient list
  const fetchPatients = useCallback(async (query = '') => {
    try {
      setPatientsLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get(`/patients?search=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setPatientsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  // Fetch patient appointments for matching complaints
  const fetchPatientAppointments = useCallback(async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/appointments?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatientAppointments(res.data.appointments || res.data || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  }, []);

  // Pre-select patient & open visit form via URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('patientId');
    const apptId = params.get('appointmentId');
    const autoCreate = params.get('createVisit') === 'true';

    if (id && patients.length > 0) {
      const found = patients.find((p) => p._id === id);
      if (found) {
        handleSelectPatient(found);

        if (autoCreate || apptId) {
          // Fetch appointments and auto-open form
          const token = localStorage.getItem('token');
          api.get(`/appointments?patientId=${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((res) => {
            const appts = res.data.appointments || res.data || [];
            setPatientAppointments(appts);
            
            const targetAppt = appts.find(a => a._id === apptId) || appts[0];
            setFormData({
              ...DEFAULT_FORM,
              visitDate: todayISO(),
              appointmentId: targetAppt ? targetAppt._id : (apptId || ''),
              chiefComplaint: targetAppt?.chiefComplaint || '',
            });
            setIsFormOpen(true);
          }).catch(console.error);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, patients]);

  // Fetch visits for selected patient
  const fetchVisits = useCallback(async (patientId) => {
    try {
      setVisitsLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get(`/diagnoses?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVisits(res.data.diagnoses || []);
    } catch (err) {
      showToast.error('Failed to load visit history.');
    } finally {
      setVisitsLoading(false);
    }
  }, []);

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setVisits([]);
    fetchVisits(patient._id);
    fetchPatientAppointments(patient._id);
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    fetchPatients(q);
  };

  const handleOpenForm = () => {
    // If patient has an appointment, auto-pick the latest one without a visit or with complaint
    const targetAppt = patientAppointments.find(a => !a.visit) || patientAppointments[0];
    setFormData({
      ...DEFAULT_FORM,
      visitDate: todayISO(),
      appointmentId: targetAppt ? targetAppt._id : '',
      chiefComplaint: targetAppt?.chiefComplaint || '',
    });
    setIsFormOpen(true);
  };

  const handleAppointmentSelectChange = (apptId) => {
    const selectedAppt = patientAppointments.find(a => a._id === apptId);
    setFormData(prev => ({
      ...prev,
      appointmentId: apptId,
      chiefComplaint: selectedAppt?.chiefComplaint || prev.chiefComplaint || '',
    }));
  };

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleVisitTypeChange = (newType) => {
    setFormData((prev) => {
      if (newType === prev.visitType) return prev;

      if (newType === 'normal') {
        return {
          ...prev,
          visitType: 'normal',
          attendingDoctorId: prev.consultingDoctorId || '',
          attendingDoctor: prev.consultingDoctor || '',
        };
      } else {
        return {
          ...prev,
          visitType: 'specialist',
          attendingDoctorId: '',
          attendingDoctor: '',
        };
      }
    });
  };

  const handleConsultingDoctorChange = (doc) => {
    const docId = doc?._id || doc?.doctorId || '';
    const docName = doc?.name || doc?.doctorName || '';

    setFormData((prev) => {
      if (prev.visitType === 'normal') {
        return {
          ...prev,
          consultingDoctorId: docId,
          consultingDoctor: docName,
          attendingDoctorId: docId,
          attendingDoctor: docName,
        };
      } else {
        return {
          ...prev,
          consultingDoctorId: docId,
          consultingDoctor: docName,
        };
      }
    });
  };

  const handleAttendingDoctorChange = (doc) => {
    const docId = doc?._id || doc?.doctorId || '';
    const docName = doc?.name || doc?.doctorName || '';

    setFormData((prev) => ({
      ...prev,
      attendingDoctorId: docId,
      attendingDoctor: docName,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await api.post(
        '/diagnoses',
        { ...formData, patientId: selectedPatient._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast.success('Visit record saved.');
      setIsFormOpen(false);
      fetchVisits(selectedPatient._id);
    } catch (err) {
      showToast.error(err.response?.data?.message || 'Failed to save visit.');
    } finally {
      setSaving(false);
    }
  };

  const isSpecialist = formData.visitType === 'specialist';
  const currentAppt = patientAppointments.find(a => a._id === formData.appointmentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical Visits</h1>
          <p className="text-slate-500 text-sm mt-1">
            Clinic Portal / Record and review patient visit history.
          </p>
        </div>
        {selectedPatient && (
          <Button onClick={handleOpenForm} className="shrink-0">
            <Plus size={16} className="mr-2" /> New Visit Record
          </Button>
        )}
      </div>

      <div className="flex gap-5 h-[calc(100vh-200px)] min-h-[520px]">

        {/* ── Left: Patient list ─────────────────────────────────────────── */}
        <div className="w-72 shrink-0 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search ID, Name, Phone…"
                className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
              />
            </div>
          </div>

          {/* Patient rows */}
          <div className="flex-1 overflow-y-auto">
            {patientsLoading ? (
              <div className="flex items-center justify-center h-32 text-gray-400 text-sm gap-2">
                <Loader2 size={18} className="animate-spin" /> Loading…
              </div>
            ) : patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm gap-2">
                <User size={24} className="text-gray-300" /> No patients found
              </div>
            ) : (
              patients.map((p) => {
                const sel = selectedPatient?._id === p._id;
                return (
                  <button
                    key={p._id}
                    onClick={() => handleSelectPatient(p)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-gray-50 transition-all flex items-center justify-between gap-2 group',
                      sel ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    )}
                  >
                    <div className="min-w-0">
                      <p className={cn('text-sm font-semibold truncate', sel ? 'text-blue-700' : 'text-gray-900')}>{p.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{p.patientId}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span style={{ color: GENDER_COLOR[p.gender] || '#64748b', fontWeight: 600, fontSize: '11px' }}>
                          {p.gender}
                        </span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[11px] text-gray-500">{p.phone}</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className={cn('shrink-0', sel ? 'text-blue-500' : 'text-gray-300 group-hover:text-gray-400')} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Right: Visit history ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!selectedPatient ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 shadow-sm text-center p-12">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <HelpCircle size={28} className="text-gray-300" />
              </div>
              <p className="text-base font-semibold text-gray-600">No Patient Selected</p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                Select a patient from the list on the left to view visit history or add a new visit.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Patient header */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-4 mb-4 shrink-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-gray-900">{selectedPatient.name}</h2>
                        <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {selectedPatient.patientId}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Phone size={11} className="text-gray-400" /> {selectedPatient.phone}
                        </span>
                        {selectedPatient.dateOfBirth && (
                          <span className="flex items-center gap-1">
                            <CalendarDays size={11} className="text-gray-400" />
                            {age(selectedPatient.dateOfBirth)}
                          </span>
                        )}
                        {selectedPatient.gender && (
                          <span style={{ color: GENDER_COLOR[selectedPatient.gender] || '#64748b', fontWeight: 600, fontSize: '13px' }}>
                            {selectedPatient.gender}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400 mb-0.5">Total Visits</p>
                    <p className="text-2xl font-black text-blue-600">{visits.length}</p>
                  </div>
                </div>
              </div>

              {/* Visit list */}
              <div className="flex-1 overflow-y-auto pr-0.5 space-y-3 pb-4">
                {visitsLoading ? (
                  <div className="flex items-center justify-center h-40 text-gray-400 gap-2">
                    <Loader2 size={20} className="animate-spin" /> Loading visit history…
                  </div>
                ) : visits.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 bg-white rounded-xl border border-dashed border-gray-200 text-center p-8">
                    <Stethoscope size={28} className="text-gray-300 mb-3" />
                    <p className="font-semibold text-gray-500">No visits recorded yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click "New Visit Record" to log the first visit.</p>
                  </div>
                ) : (
                  visits.map((v) => <VisitCard key={v._id} visit={v} />)
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── New Visit Modal ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={`New Visit — ${selectedPatient?.name || ''} (${selectedPatient?.patientId || ''})`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Appointment Context & Chief Complaint Auto-Population ── */}
          {patientAppointments.length > 0 && (
            <div>
              <FS title="Linked Appointment & Complaint" />
              <div className="space-y-3">
                <div>
                  <FL>Select Appointment</FL>
                  <Select
                    value={formData.appointmentId}
                    onChange={(e) => handleAppointmentSelectChange(e.target.value)}
                    placeholder="-- Direct Visit (No Appointment) --"
                    options={[
                      { value: '', label: '-- Direct Visit (No Appointment) --' },
                      ...patientAppointments.map((appt) => ({
                        value: appt._id,
                        label: `${new Date(appt.date).toLocaleDateString()} at ${appt.time} - ${appt.chiefComplaint ? `Complaint: "${appt.chiefComplaint}"` : 'No complaint recorded'}`
                      }))
                    ]}
                  />
                </div>

                {/* Auto-populated Chief Complaint Notice / Edit field */}
                <div>
                  <FL>Chief Complaint</FL>
                  <TA
                    name="chiefComplaint"
                    value={formData.chiefComplaint}
                    onChange={handleChange}
                    placeholder="e.g. Pain in left tooth for 3 days (automatically inherited if recorded on appointment)"
                    rows={2}
                  />
                  {currentAppt?.chiefComplaint && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                      ✓ Automatically inherited from Appointment ({new Date(currentAppt.date).toLocaleDateString()} at {currentAppt.time})
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* If patient has no appointments recorded yet, still show Chief Complaint field */}
          {patientAppointments.length === 0 && (
            <div>
              <FS title="Clinical Assessment" />
              <div>
                <FL>Chief Complaint</FL>
                <TA
                  name="chiefComplaint"
                  value={formData.chiefComplaint}
                  onChange={handleChange}
                  placeholder="e.g. Pain in left tooth for 3 days"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* ── Case type selection ─────────────────────────────────────── */}
          <div>
            <FS title="Treatment Type" />
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  val: 'normal',
                  label: 'Normal Treatment',
                  sub: 'In-house Doctor',
                  icon: Stethoscope,
                },
                {
                  val: 'specialist',
                  label: 'Specialist Case',
                  sub: 'Consulting + External Specialist',
                  icon: UserCheck,
                },
              ].map(({ val, label, sub, icon: Icon }) => {
                const active = formData.visitType === val;
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleVisitTypeChange(val)}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
                      active
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    {/* Radio dot */}
                    <div className={cn(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                      active ? 'border-blue-600' : 'border-gray-300'
                    )}>
                      {active && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                    </div>
                    <div>
                      <p className={cn('text-sm font-bold', active ? 'text-blue-700' : 'text-gray-800')}>{label}</p>
                      <p className={cn('text-xs mt-0.5', active ? 'text-blue-500' : 'text-gray-400')}>{sub}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Visit details ───────────────────────────────────────────── */}
          <div>
            <FS title="Visit Details" />
            <div className="space-y-4">
              <div>
                <FL req>Visit Date</FL>
                <Input type="date" name="visitDate" value={formData.visitDate} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FL>Consulting Doctor</FL>
                  <DoctorSelector
                    type="internal"
                    value={formData.consultingDoctorId || formData.consultingDoctor}
                    selectedDoctorName={formData.consultingDoctor}
                    onChange={handleConsultingDoctorChange}
                    placeholder="Select Consulting Doctor"
                  />
                </div>
                <div>
                  <FL>Attending Doctor</FL>
                  <DoctorSelector
                    type={isSpecialist ? 'external' : 'internal'}
                    value={formData.attendingDoctorId || formData.attendingDoctor}
                    selectedDoctorName={formData.attendingDoctor}
                    onChange={handleAttendingDoctorChange}
                    placeholder={isSpecialist ? 'Select External Doctor' : 'Same as Consulting Doctor'}
                    disabled={!isSpecialist}
                  />
                </div>
              </div>
            </div>
          </div>


          {/* ── Additional ──────────────────────────────────────────────── */}
          <div>
            <FS title="Additional" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FL>Notes <span className="font-normal text-gray-400">(optional)</span></FL>
                <TA
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Internal notes, allergies, follow-up reminders…"
                  rows={isSpecialist ? 4 : 2}
                />
              </div>

              {isSpecialist ? (
                /* Specialist Case: Separate Incentives for Consulting Doctor & Attending Doctor */
                <div className="space-y-3 bg-purple-50/40 p-3.5 rounded-xl border border-purple-100">
                  <div className="flex items-center justify-between">
                    <FL>Doctor Incentives <span className="font-normal text-gray-400">(optional)</span></FL>
                    {((parseFloat(formData.consultingDoctorIncentive) || 0) + (parseFloat(formData.attendingDoctorIncentive) || 0)) > 0 && (
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full">
                        Total: ₹{((parseFloat(formData.consultingDoctorIncentive) || 0) + (parseFloat(formData.attendingDoctorIncentive) || 0)).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Consulting Doctor Incentive */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Consulting Doctor Incentive {formData.consultingDoctor ? `(${formData.consultingDoctor})` : ''}
                    </label>
                    <div className="relative">
                      <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <Input
                        type="number"
                        name="consultingDoctorIncentive"
                        value={formData.consultingDoctorIncentive}
                        onChange={handleChange}
                        placeholder="e.g. 500"
                        min="0"
                        className="pl-8 text-xs h-9 bg-white"
                      />
                    </div>
                  </div>

                  {/* Attending Doctor Incentive */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Attending Doctor Incentive {formData.attendingDoctor ? `(${formData.attendingDoctor})` : ''}
                    </label>
                    <div className="relative">
                      <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <Input
                        type="number"
                        name="attendingDoctorIncentive"
                        value={formData.attendingDoctorIncentive}
                        onChange={handleChange}
                        placeholder="e.g. 1000"
                        min="0"
                        className="pl-8 text-xs h-9 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Normal Treatment: Keep existing incentives field unchanged */
                <div>
                  <FL>Incentives <span className="font-normal text-gray-400">(optional)</span></FL>
                  <TA
                    name="incentives"
                    value={formData.incentives}
                    onChange={handleChange}
                    placeholder="e.g. 10% discount applied…"
                    rows={2}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Patient tag */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600">
            <User size={12} className="text-gray-400 shrink-0" />
            Saving visit for <strong className="text-gray-800 mx-0.5">{selectedPatient?.name}</strong>
            <span className="text-gray-400">({selectedPatient?.patientId})</span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <Button variant="ghost" type="button" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? <><Loader2 size={14} className="mr-2 animate-spin" />Saving…</>
                : <><Plus size={14} className="mr-1.5" />Save Visit Record</>
              }
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DiagnosisTreatment;
