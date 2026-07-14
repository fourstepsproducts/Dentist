import React, { useState } from 'react';
import axios from 'axios';
import { Card } from '../../../components/ui/Card';
import { PatientSelector } from '../../../components/ui/PatientSelector';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Plus, HelpCircle, Activity, DollarSign } from 'lucide-react';
import { cn } from '../../../lib/utils';

const TreatmentRecords = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState('Pending');
  const [submitting, setSubmitting] = useState(false);

  const handlePatientChange = (patient) => {
    setSelectedPatient(patient);
    setName('');
    setCost('');
    setStatus('Pending');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !cost || !selectedPatient) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const payload = {
        name: name.trim(),
        cost: Number(cost),
        status,
        date: new Date(),
      };

      const res = await axios.post(
        `/api/patients/${selectedPatient._id}/records`,
        { type: 'treatments', payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedPatient(res.data);
      setName('');
      setCost('');
      setStatus('Pending');
    } catch (err) {
      console.error('Failed to log treatment:', err);
      alert('Failed to log treatment');
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Treatment Records</h1>
        <p className="text-slate-500 text-sm mt-1">Clinic Portal / Maintain histories of dental treatments and procedures.</p>
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
          <p className="text-xs text-slate-400 mt-1">Please select an active patient from the dropdown above to manage treatments.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Treatment Form */}
          <Card className="p-6 h-fit lg:col-span-1">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4">Log Treatment Log</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Treatment / Procedure Name *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Composite Filling"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Charged Cost ($) *</label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="250"
                    className="pl-8"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Treatment Status *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm bg-white"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                <Plus size={16} className="mr-1.5" />
                {submitting ? 'Logging...' : 'Log Treatment'}
              </Button>
            </form>
          </Card>

          {/* Treatments Table */}
          <Card className="p-6 lg:col-span-2 overflow-hidden">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Activity size={16} className="text-blue-500" />
              Treatment History
            </h3>
            {selectedPatient.treatments?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-sm">
                No treatment records found for this patient.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Procedure Name</th>
                      <th className="px-4 py-3 font-medium text-right">Cost</th>
                      <th className="px-4 py-3 font-medium text-right">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Log Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...selectedPatient.treatments].reverse().map((t, index) => (
                      <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800">{t.name}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700 text-right">${t.cost}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-bold uppercase",
                            t.status === 'Completed' ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                          )}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-right text-xs font-medium">{formatDate(t.date)}</td>
                      </tr>
                    ))}
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

export default TreatmentRecords;
