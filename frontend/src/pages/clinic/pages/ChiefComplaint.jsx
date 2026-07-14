import React, { useState } from 'react';
import axios from 'axios';
import { Card } from '../../../components/ui/Card';
import { PatientSelector } from '../../../components/ui/PatientSelector';
import { Button } from '../../../components/ui/Button';
import { Plus, HelpCircle, Activity } from 'lucide-react';

const ChiefComplaint = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [complaintText, setComplaintText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handlePatientChange = (patient) => {
    setSelectedPatient(patient);
    setComplaintText('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintText.trim() || !selectedPatient) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const payload = {
        text: complaintText.trim(),
        date: new Date(),
      };
      
      const res = await axios.post(
        `/api/patients/${selectedPatient._id}/records`,
        { type: 'chiefComplaints', payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state with updated patient data
      setSelectedPatient(res.data);
      setComplaintText('');
    } catch (err) {
      console.error('Failed to log chief complaint:', err);
      alert('Failed to log chief complaint');
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chief Complaint</h1>
        <p className="text-slate-500 text-sm mt-1">Clinic Portal / Log patient symptoms and reason for visit.</p>
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
          <p className="text-xs text-slate-400 mt-1">Please select an active patient from the dropdown above to manage complaints.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Complaint Form */}
          <Card className="p-6 h-fit lg:col-span-1">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4">Add Chief Complaint</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Reason for Visit / Complaint</label>
                <textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Describe patient symptoms, pain locations, or general complaints..."
                  className="w-full min-h-[120px] p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                <Plus size={16} className="mr-1.5" />
                {submitting ? 'Logging...' : 'Log Complaint'}
              </Button>
            </form>
          </Card>

          {/* History of complaints */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Activity size={16} className="text-blue-500" />
              Complaint History
            </h3>
            {selectedPatient.chiefComplaints?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-sm">
                No complaints recorded for this patient.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {[...selectedPatient.chiefComplaints].reverse().map((complaint, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-start gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{complaint.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
                      {formatDate(complaint.date)}
                    </span>
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

export default ChiefComplaint;
