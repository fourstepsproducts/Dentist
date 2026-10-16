import React, { useState, useCallback } from 'react';
import api from '../../../api';
import { Card } from '../../../components/ui/Card';
import { PatientSelector } from '../../../components/ui/PatientSelector';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import {
  HelpCircle, Activity, CalendarDays, Loader2, Stethoscope,
  IndianRupee, CheckCircle2, AlertCircle, Trash2
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { showToast } from '../../../utils/toast';

const fmtDate = (d) => {
  if (!d) return '—';
  const dateObj = new Date(d);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}-${month}-${year}`;
};

const TODAYS_RESULTS = [
  { val: 'Completed Today', label: 'Completed Today' },
  { val: 'Partially Completed', label: 'Partially Completed' },
  { val: 'Consultation Only', label: 'Consultation Only' },
  { val: 'No Treatment Required', label: 'No Treatment Required' },
];

const FOLLOW_UP_REASONS = [
  'Continue treatment with in-house doctor',
  'Additional treatment session',
  'Review / Follow-up consultation',
  'Specialist consultation',
  'Other',
];

const TreatmentRecords = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Independent Tab State ('today' | 'followup')
  const [activeTab, setActiveTab] = useState('today');

  // Tab 1 Fields: Treatment Today
  const [diagnosisText, setDiagnosisText] = useState('');
  const [treatmentRequired, setTreatmentRequired] = useState('Yes'); // 'Yes' | 'No'
  const [treatmentPerformed, setTreatmentPerformed] = useState('');
  const [medicinesText, setMedicinesText] = useState('');
  const [chargedCost, setChargedCost] = useState('');

  // Tab 2 Fields: Follow-up
  const [followUpRequired, setFollowUpRequired] = useState('No');
  const [followUpReason, setFollowUpReason] = useState('Continue treatment with in-house doctor');
  const [followUpNotes, setFollowUpNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Fetch visits for the selected patient
  const fetchVisits = useCallback(async (patientId) => {
    try {
      setVisitsLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get(`/diagnoses?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVisits(res.data.diagnoses || []);
    } catch (err) {
      console.error('Failed to fetch patient visits:', err);
      showToast.error('Failed to load patient visit history.');
      setVisits([]);
    } finally {
      setVisitsLoading(false);
    }
  }, []);

  const handlePatientChange = (patient) => {
    setSelectedPatient(patient);
    resetForm();
    setVisits([]);
    if (patient?._id) {
      fetchVisits(patient._id);
    }
  };

  const resetForm = () => {
    setActiveTab('today');
    setSelectedVisitId('');
    setDiagnosisText('');
    setTreatmentRequired('Yes');
    setTreatmentPerformed('');
    setMedicinesText('');
    setChargedCost('');
    setFollowUpRequired('No');
    setFollowUpReason('Continue treatment with in-house doctor');
    setFollowUpNotes('');
    setIsEditMode(false);
  };

  const handleDeleteVisit = async (visitId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this treatment record? (Chief Complaint & Visit will remain intact)')) {
      return;
    }

    try {
      setDeletingId(visitId);
      const token = localStorage.getItem('token');
      await api.delete(`/diagnoses/${visitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast.success('Treatment record deleted successfully.');
      if (selectedVisitId === visitId) {
        resetForm();
      }
      if (selectedPatient?._id) {
        fetchVisits(selectedPatient._id);
      }
    } catch (err) {
      console.error('Failed to delete treatment record:', err);
      showToast.error(err.response?.data?.message || 'Failed to delete treatment record.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditVisit = (visit, e) => {
    if (e) e.stopPropagation();
    setIsEditMode(true);
    setSelectedVisitId(visit._id);
    setDiagnosisText(visit.diagnosis || '');
    setChargedCost(visit.cost !== undefined && visit.cost !== null ? String(visit.cost) : '');
    setFollowUpNotes(visit.referralNotes || '');

    // Determine Treatment Required & fields
    if (visit.visitOutcome === 'Consultation Only' || visit.visitOutcome === 'No Treatment Required') {
      setTreatmentRequired('No');
      setMedicinesText(visit.treatmentPerformed || '');
      setTreatmentPerformed('');
    } else {
      setTreatmentRequired('Yes');
      setTreatmentPerformed(visit.treatmentPerformed || '');
      setMedicinesText('');
    }

    // Determine Follow-up fields while preserving existing followUp values
    if (visit.followUpRequired === 'Yes') {
      setFollowUpRequired('Yes');
      if (visit.visitOutcome === 'Specialist Required' || visit.treatmentStatus === 'Referred' || visit.followUpType === 'Specialist Consultation') {
        setFollowUpReason('Specialist consultation');
      } else if (visit.followUpType === 'Follow-up Consultation') {
        setFollowUpReason('Review / Follow-up consultation');
      } else if (visit.followUpType === 'Treatment Session') {
        setFollowUpReason('Additional treatment session');
      } else {
        setFollowUpReason('Continue treatment with in-house doctor');
      }
    } else {
      setFollowUpRequired('No');
      setFollowUpReason('Continue treatment with in-house doctor');
    }

    setActiveTab('today');
  };

  const handleVisitSelect = (visitId) => {
    setSelectedVisitId(visitId);
    setIsEditMode(false);
    if (!visitId) return;

    const foundVisit = visits.find((v) => v._id === visitId);
    if (foundVisit) {
      setDiagnosisText(foundVisit.diagnosis || '');
      setChargedCost(foundVisit.cost !== undefined && foundVisit.cost !== null ? String(foundVisit.cost) : '');
      setFollowUpNotes(foundVisit.referralNotes || '');

      // Determine Treatment Required & fields
      if (foundVisit.visitOutcome === 'Consultation Only' || foundVisit.visitOutcome === 'No Treatment Required') {
        setTreatmentRequired('No');
        setMedicinesText(foundVisit.treatmentPerformed || '');
        setTreatmentPerformed('');
      } else {
        setTreatmentRequired('Yes');
        setTreatmentPerformed(foundVisit.treatmentPerformed || '');
        setMedicinesText('');
      }

      // Determine Follow-up fields
      if (foundVisit.followUpRequired === 'Yes') {
        setFollowUpRequired('Yes');
        if (foundVisit.visitOutcome === 'Specialist Required' || foundVisit.treatmentStatus === 'Referred' || foundVisit.followUpType === 'Specialist Consultation') {
          setFollowUpReason('Specialist consultation');
        } else if (foundVisit.followUpType === 'Follow-up Consultation') {
          setFollowUpReason('Review / Follow-up consultation');
        } else if (foundVisit.followUpType === 'Treatment Session') {
          setFollowUpReason('Additional treatment session');
        } else {
          setFollowUpReason('Continue treatment with in-house doctor');
        }
      } else {
        setFollowUpRequired('No');
        setFollowUpReason('Continue treatment with in-house doctor');
      }
    }
  };

  const handleTreatmentRequiredChange = (value) => {
    setTreatmentRequired(value);
    if (value === 'Yes') {
      setMedicinesText('');
    } else {
      setTreatmentPerformed('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPatient || !selectedPatient._id) {
      showToast.warning('Please select an active patient.');
      return;
    }

    if (!selectedVisitId) {
      showToast.warning('Please select a specific visit for this patient.');
      return;
    }

    if (!diagnosisText.trim()) {
      showToast.warning('Diagnosis is required.');
      return;
    }

    if (treatmentRequired === 'Yes' && !treatmentPerformed.trim()) {
      showToast.warning('Treatment / Procedure is required when Treatment Required is Yes.');
      return;
    }

    if (treatmentRequired === 'No' && !medicinesText.trim()) {
      showToast.warning('Medicines is required when Treatment Required is No.');
      return;
    }

    if (chargedCost === '' || chargedCost === null || chargedCost === undefined) {
      showToast.warning('Charged Cost is required.');
      return;
    }

    // Determine stored treatment text (either procedure or prescribed medicines)
    const finalTreatmentText = treatmentRequired === 'Yes' ? treatmentPerformed.trim() : medicinesText.trim();

    // Derive internal visitOutcome, followUpType, and treatmentStatus from selections
    let visitOutcome = 'Treatment Completed';
    let followUpType = '';
    let treatmentStatus = 'Completed';

    if (followUpRequired === 'Yes') {
      if (followUpReason === 'Specialist consultation') {
        visitOutcome = 'Specialist Required';
        followUpType = 'Specialist Consultation';
        treatmentStatus = 'Referred';
      } else if (followUpReason === 'Review / Follow-up consultation') {
        visitOutcome = 'Follow-up Required';
        followUpType = 'Follow-up Consultation';
        treatmentStatus = 'In Progress';
      } else if (followUpReason === 'Additional treatment session') {
        visitOutcome = 'Treatment Partially Completed';
        followUpType = 'Treatment Session';
        treatmentStatus = 'Partially Completed';
      } else {
        visitOutcome = 'Follow-up Required';
        followUpType = 'Treatment Session';
        treatmentStatus = 'In Progress';
      }
    } else {
      if (treatmentRequired === 'No') {
        visitOutcome = 'Consultation Only';
        treatmentStatus = 'Completed';
      } else {
        visitOutcome = 'Treatment Completed';
        treatmentStatus = 'Completed';
      }
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      await api.post(
        '/diagnoses/treatment',
        {
          patientId: selectedPatient._id,
          visitId: selectedVisitId,
          diagnosis: diagnosisText.trim(),
          treatmentPerformed: finalTreatmentText,
          visitOutcome,
          followUpRequired,
          followUpType,
          referralNotes: followUpNotes.trim(),
          chargedCost: chargedCost !== '' ? Number(chargedCost) : 0,
          treatmentStatus,
          isEdit: isEditMode,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast.success(isEditMode ? 'Treatment record updated successfully.' : "Today's record completed & saved successfully.");
      resetForm();

      // Refresh visits list to reflect closed status and outcome
      fetchVisits(selectedPatient._id);
    } catch (err) {
      console.error('Failed to save treatment record:', err);
      showToast.error(err.response?.data?.message || 'Failed to save treatment record.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSpecialistReason = followUpReason === 'Specialist consultation';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Treatment Records</h1>
        <p className="text-slate-500 text-sm mt-1">Clinic Portal / Record diagnosis, procedure performed, and follow-up details for today's visit.</p>
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
          <p className="text-xs text-slate-400 mt-1">Please select an active patient from the dropdown above to record treatment details.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Form Card with Two Independent Tabs */}
          <Card className="p-6 h-fit lg:col-span-1 border border-slate-200 shadow-sm">
            
            {/* Independent Tabs Header */}
            <div className="flex border-b border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('today')}
                className={cn(
                  "flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-1.5",
                  activeTab === 'today'
                    ? "border-blue-600 text-blue-700 bg-blue-50/50"
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  activeTab === 'today' ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  1
                </span>
                TREATMENT TODAY
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('followup')}
                className={cn(
                  "flex-1 py-2.5 text-center text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-1.5",
                  activeTab === 'followup'
                    ? "border-blue-600 text-blue-700 bg-blue-50/50"
                    : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  activeTab === 'followup' ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  2
                </span>
                FOLLOW-UP
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* ── TAB 1: TREATMENT TODAY ─────────────────────────────────── */}
              {activeTab === 'today' && (
                <div className="space-y-4">
                  {/* SELECT VISIT * */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      SELECT VISIT <span className="text-red-500">*</span>
                    </label>
                    {visitsLoading ? (
                      <div className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-400 flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-blue-600" /> Loading patient visits...
                      </div>
                    ) : (() => {
                      const availableVisits = isEditMode
                        ? visits
                        : visits.filter((v) => !v.isClosed && (!v.diagnosis || v.diagnosis === '—'));
                      const hasVisits = availableVisits.length > 0;

                      return (
                        <Select
                          value={selectedVisitId}
                          onChange={(e) => handleVisitSelect(e.target.value)}
                          disabled={isEditMode || !hasVisits}
                          placeholder={!hasVisits ? "No new visits available" : "Select Visit..."}
                          options={availableVisits.map((v) => {
                            const formattedDate = fmtDate(v.visitDate);
                            const visitNo = `VIS-${String(v.visitNumber).padStart(4, '0')}`;
                            const typeLabel = v.visitType === 'specialist' ? 'Specialist Case' : 'Normal Treatment';
                            const hasRecord = v.isClosed || (v.diagnosis && v.diagnosis !== '—');

                            return {
                              value: v._id,
                              label: `${formattedDate} — ${visitNo} — ${typeLabel}${hasRecord ? ' (Recorded)' : ''}`
                            };
                          })}
                          required
                        />
                      );
                    })()}
                    {isEditMode && (
                      <p className="text-xs text-blue-600 mt-1 font-medium flex items-center justify-between">
                        <span>Editing existing record for this visit.</span>
                        <button
                          type="button"
                          onClick={resetForm}
                          className="text-slate-500 underline hover:text-slate-800 ml-2"
                        >
                          Cancel Edit
                        </button>
                      </p>
                    )}
                  </div>

                  {/* DIAGNOSIS * */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      DIAGNOSIS <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={diagnosisText}
                      onChange={(e) => setDiagnosisText(e.target.value)}
                      placeholder="Enter doctor's diagnosis..."
                      className="w-full min-h-[70px] p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm resize-none"
                      required
                    />
                  </div>

                  {/* TREATMENT REQUIRED? * */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      TREATMENT REQUIRED? <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={treatmentRequired}
                      onChange={(e) => handleTreatmentRequiredChange(e.target.value)}
                      options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' },
                      ]}
                      required
                    />
                  </div>

                  {/* CONDITIONAL: TREATMENT / PROCEDURE * (if Yes) */}
                  {treatmentRequired === 'Yes' && (
                    <div className="space-y-1.5 animate-in fade-in-0 duration-150">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        TREATMENT / PROCEDURE <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={treatmentPerformed}
                        onChange={(e) => setTreatmentPerformed(e.target.value)}
                        placeholder="Enter treatment or procedure performed..."
                        className="w-full min-h-[70px] p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm resize-none"
                        required
                      />
                    </div>
                  )}

                  {/* CONDITIONAL: MEDICINES * (if No) */}
                  {treatmentRequired === 'No' && (
                    <div className="space-y-1.5 animate-in fade-in-0 duration-150">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        MEDICINES <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={medicinesText}
                        onChange={(e) => setMedicinesText(e.target.value)}
                        placeholder="Enter prescribed medicines..."
                        className="w-full min-h-[70px] p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm resize-none"
                        required
                      />
                    </div>
                  )}

                  {/* CHARGED COST * */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                        CHARGED COST <span className="text-red-500">*</span>
                      </label>
                      <div className="relative max-w-[180px]">
                        <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <Input
                          type="number"
                          value={chargedCost}
                          onChange={(e) => setChargedCost(e.target.value)}
                          placeholder="Enter amount charged..."
                          min="0"
                          className="pl-8 text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* TAB 1 ACTION BUTTON */}
                  <div className="pt-3 border-t border-slate-100">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!selectedVisitId || submitting || visits.length === 0}
                    >
                      <CheckCircle2 size={16} className="mr-1.5" />
                      {submitting
                        ? (isEditMode ? 'Updating Treatment Record...' : "Saving Today's Record...")
                        : (isEditMode ? 'Update Treatment Record' : "Complete Today's Record")}
                    </Button>
                  </div>
                </div>
              )}

              {/* ── TAB 2: FOLLOW-UP ────────────────────────────────────────── */}
              {activeTab === 'followup' && (
                <div className="space-y-4">
                  {/* FOLLOW-UP REQUIRED? */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                      FOLLOW-UP REQUIRED?
                    </label>
                    <Select
                      value={followUpRequired}
                      onChange={(e) => setFollowUpRequired(e.target.value)}
                      options={[
                        { value: 'No', label: 'No' },
                        { value: 'Yes', label: 'Yes' },
                      ]}
                    />
                  </div>

                  {followUpRequired === 'No' ? (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center font-medium">
                      No follow-up is required for this visit.
                    </div>
                  ) : (
                    <>
                      {/* FOLLOW-UP REASON */}
                      <div className="space-y-1.5 animate-in fade-in-0 duration-150">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                          FOLLOW-UP REASON
                        </label>
                        <Select
                          value={followUpReason}
                          onChange={(e) => setFollowUpReason(e.target.value)}
                          options={FOLLOW_UP_REASONS.map((r) => ({ value: r, label: r }))}
                        />
                      </div>

                      {/* FOLLOW-UP NOTES or SPECIALIST / REFERRAL NOTES */}
                      <div className="space-y-1.5 animate-in fade-in-0 duration-150">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                          {isSpecialistReason ? 'SPECIALIST / REFERRAL NOTES' : 'FOLLOW-UP NOTES'}
                        </label>
                        <textarea
                          value={followUpNotes}
                          onChange={(e) => setFollowUpNotes(e.target.value)}
                          placeholder={
                            isSpecialistReason
                              ? 'Explain why a specialist is required...'
                              : 'Explain why the patient needs to return...'
                          }
                          className="w-full min-h-[80px] p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm resize-none"
                        />
                      </div>
                    </>
                  )}

                  {/* TAB 2 ACTION BUTTON */}
                  <div className="pt-3 border-t border-slate-100">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!selectedVisitId || submitting || visits.length === 0}
                    >
                      <CheckCircle2 size={16} className="mr-1.5" />
                      {submitting ? 'Closing Visit...' : 'Complete / Close Visit'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Card>

          {/* Clinical Encounter History */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity size={16} className="text-blue-500" />
                Clinical Encounter Records ({visits.length})
              </span>
            </h3>

            {visitsLoading ? (
              <div className="p-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-600" /> Loading encounter history...
              </div>
            ) : visits.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-sm border border-dashed border-slate-200 rounded-xl">
                No clinical encounters recorded for this patient yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
                {visits.map((visit) => {
                  const formattedDate = fmtDate(visit.visitDate);
                  const visitNo = `VIS-${String(visit.visitNumber).padStart(4, '0')}`;
                  const isSpecialist = visit.visitType === 'specialist';
                  const currentStatus = visit.treatmentStatus || 'Completed';
                  const hasRecord = visit.isClosed || (visit.diagnosis && visit.diagnosis !== '—');

                  return (
                    <div
                      key={visit._id}
                      className={cn(
                        "p-4 rounded-xl border transition-all flex flex-col gap-3",
                        visit._id === selectedVisitId
                          ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-slate-50/70 hover:bg-slate-50"
                      )}
                    >
                      {/* Encounter Header Badge */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 font-mono">
                            {visitNo}
                          </span>
                          <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <CalendarDays size={12} className="text-slate-400" />
                            {formattedDate}
                          </span>
                          <span className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                            isSpecialist ? "border-purple-200 text-purple-700 bg-purple-50" : "border-emerald-200 text-emerald-700 bg-transparent"
                          )}>
                            {isSpecialist ? 'Specialist Case' : 'Normal Treatment'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {visit.attendingDoctor && (
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 hidden sm:flex">
                              <Stethoscope size={12} className="text-slate-400" />
                              {visit.attendingDoctor}
                            </span>
                          )}
                          <span className={cn(
                            "px-2.5 py-0.5 rounded text-xs font-bold uppercase border",
                            currentStatus === 'Completed' && "bg-transparent text-emerald-700 border-emerald-200",
                            currentStatus === 'Referred' && "bg-purple-50 text-purple-700 border-purple-200",
                            currentStatus === 'In Progress' && "bg-blue-50 text-blue-700 border-blue-200",
                            currentStatus === 'Partially Completed' && "bg-amber-50 text-amber-700 border-amber-200",
                            currentStatus === 'Not Started' && "bg-slate-100 text-slate-700 border-slate-200"
                          )}>
                            {currentStatus}
                          </span>

                          {/* Subtle Text Edit Action button */}
                          {hasRecord && (
                            <button
                              type="button"
                              onClick={(e) => handleEditVisit(visit, e)}
                              title="Edit treatment record"
                              className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline px-1.5 py-0.5 transition-colors"
                            >
                              Edit
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleDeleteVisit(visit._id, e)}
                            disabled={deletingId === visit._id}
                            title="Delete encounter record"
                            className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors shrink-0 disabled:opacity-50"
                          >
                            {deletingId === visit._id ? (
                              <Loader2 size={14} className="animate-spin text-red-600" />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Clinical Content */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Diagnosis:
                          </span>
                          <p className="font-semibold text-slate-800">
                            {visit.diagnosis || '—'}
                          </p>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-2xs">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Treatment / Procedure:
                          </span>
                          <p className="font-semibold text-slate-800">
                            {visit.treatmentPerformed || 'No treatment performed'}
                          </p>
                        </div>
                      </div>

                      {/* Outcome & Follow-up Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/70 p-2.5 rounded-lg border border-slate-100 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          {((!visit.isClosed && (currentStatus === 'Not Started' || !visit.diagnosis)) || visit.visitOutcome === 'Awaiting treatment record') ? (
                            <>
                              <span className="font-medium text-slate-500">Outcome:</span>
                              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                Awaiting treatment record
                              </span>
                            </>
                          ) : (visit.visitOutcome && visit.visitOutcome !== 'Treatment Completed') ? (
                            <>
                              <span className="font-medium text-slate-500">Outcome:</span>
                              <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                {visit.visitOutcome}
                              </span>
                            </>
                          ) : null}
                          {visit.followUpRequired === 'Yes' && (
                            <span className="font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                              Follow-up: {visit.followUpType || 'Required'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 font-semibold text-slate-800">
                          <span>Charged Cost:</span>
                          <strong className="text-sm font-bold text-slate-900">
                            ₹{(visit.cost !== undefined && visit.cost !== null ? visit.cost : 0).toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      {/* Referral / Reason Notes if present */}
                      {visit.referralNotes && (
                        <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                          <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-semibold block mb-0.5">Notes / Referral Reason:</strong>
                            {visit.referralNotes}
                          </div>
                        </div>
                      )}
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

export default TreatmentRecords;
