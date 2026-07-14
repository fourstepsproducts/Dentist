import React, { useState } from 'react';
import api from '../../../api';
import { Card } from '../../../components/ui/Card';
import { PatientSelector } from '../../../components/ui/PatientSelector';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Plus, HelpCircle, FileText } from 'lucide-react';

const DiagnosisTreatment = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePatientChange = (patient) => {
    setSelectedPatient(patient);
    setDiagnosis('');
    setTreatmentPlan('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim() || !treatmentPlan.trim() || !selectedPatient) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const payload = {
        diagnosis: diagnosis.trim(),
        treatmentPlan: treatmentPlan.trim(),
        date: new Date(),
      };

      const res = await api.post(
        `/patients/${selectedPatient._id}/records`,
        { type: 'diagnoses', payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedPatient(res.data);
      setDiagnosis('');
      setTreatmentPlan('');
    } catch (err) {
      console.error('Failed to log diagnosis:', err);
      alert('Failed to log diagnosis');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Diagnosis & Treatment</h1>
        <p className="text-slate-500 text-sm mt-1">Clinic Portal / Diagnose conditions and outline treatment plans.</p>
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
          <p className="text-xs text-slate-400 mt-1">Please select an active patient from the dropdown above to manage diagnoses.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Diagnosis Form */}
          <Card className="p-6 h-fit lg:col-span-1">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4">Add Diagnosis Log</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Diagnosis / Condition *</label>
                <Input
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Deep Dental Caries"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Treatment Plan / Steps *</label>
                <textarea
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  placeholder="Describe treatment plan, medicines, scheduled procedures..."
                  className="w-full min-h-[100px] p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                <Plus size={16} className="mr-1.5" />
                {submitting ? 'Saving...' : 'Save Diagnosis'}
              </Button>
            </form>
          </Card>

          {/* History of diagnoses */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <FileText size={16} className="text-blue-500" />
              Diagnosis History
            </h3>
            {selectedPatient.diagnoses?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-sm">
                No diagnoses or treatment plans recorded for this patient.
              </div>
            ) : (
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {[...selectedPatient.diagnoses].reverse().map((diag, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2"
                  >
                    <div className="flex justify-between items-start border-b border-slate-200/50 pb-2">
                      <h4 className="font-bold text-sm text-slate-800">Condition: {diag.diagnosis}</h4>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0 bg-white px-2 py-0.5 rounded border border-slate-100 shadow-sm">
                        {formatDate(diag.date)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      <span className="font-bold text-slate-700 block mb-0.5">Treatment Plan:</span>
                      {diag.treatmentPlan}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default DiagnosisTreatment;
