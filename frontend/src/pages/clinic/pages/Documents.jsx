import React, { useState } from 'react';
import api from '../../../api';
import { Card } from '../../../components/ui/Card';
import { PatientSelector } from '../../../components/ui/PatientSelector';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Plus, HelpCircle, FileText, UploadCloud } from 'lucide-react';
import { showToast } from '../../../utils/toast';

const Documents = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('X-Ray');
  const [submitting, setSubmitting] = useState(false);

  const handlePatientChange = (patient) => {
    setSelectedPatient(patient);
    setDocName('');
    setDocType('X-Ray');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!docName.trim() || !selectedPatient) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const payload = {
        name: docName.trim(),
        type: docType,
        uploadDate: new Date(),
      };

      const res = await api.post(
        `/patients/${selectedPatient._id}/records`,
        { type: 'documents', payload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedPatient(res.data);
      setDocName('');
      setDocType('X-Ray');
      showToast.success('Document logged successfully.');
    } catch (err) {
      console.error('Failed to log document:', err);
      showToast.error('Failed to log document.');
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
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Document Upload</h1>
        <p className="text-slate-500 text-sm mt-1">Clinic Portal / Upload and manage clinical documents, prescriptions and reports.</p>
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
          <p className="text-xs text-slate-400 mt-1">Please select an active patient from the dropdown above to manage medical files.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Document Mock Upload Form */}
          <Card className="p-6 h-fit lg:col-span-1">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <UploadCloud size={16} className="text-blue-500" />
              Upload Medical File
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">File / Document Name *</label>
                <Input
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Upper Left X-Ray Scan"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Document Category *</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm text-sm bg-white"
                  required
                >
                  <option value="X-Ray">X-Ray / Scan</option>
                  <option value="Prescription">Prescription File</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Consent Form">Consent Form</option>
                  <option value="Other">Other Clinical Note</option>
                </select>
              </div>
              <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center text-xs text-slate-500">
                <UploadCloud size={28} className="text-slate-400 mb-1.5" />
                <span className="font-semibold text-slate-600">Select file to attach</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Maximum size: 5MB</span>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                <Plus size={16} className="mr-1.5" />
                {submitting ? 'Uploading...' : 'Save File Record'}
              </Button>
            </form>
          </Card>

          {/* Documents List */}
          <Card className="p-6 lg:col-span-2 overflow-hidden">
            <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <FileText size={16} className="text-blue-500" />
              Uploaded Files History
            </h3>
            {selectedPatient.documents?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-sm">
                No clinical documents uploaded for this patient.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Document / File Name</th>
                      <th className="px-4 py-3 font-medium">Category Type</th>
                      <th className="px-4 py-3 font-medium text-right">Upload Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...selectedPatient.documents].reverse().map((doc, index) => (
                      <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-800 flex items-center gap-2">
                          <FileText size={14} className="text-slate-400 shrink-0" />
                          {doc.name}
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-xs font-semibold">
                            {doc.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-right text-xs font-medium">{formatDate(doc.uploadDate)}</td>
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

export default Documents;
