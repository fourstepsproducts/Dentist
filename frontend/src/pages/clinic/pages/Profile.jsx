import React, { useState, useEffect } from 'react';
import api from '../../../api';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { 
  Search, User, Phone, MapPin, Calendar, Clock, 
  Stethoscope, Activity, FileText, CheckCircle2, AlertCircle, ChevronRight, DollarSign 
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { showToast } from '../../../utils/toast';

const Profile = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Search for patients
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      const { data } = await api.get(`/patients?search=${searchQuery}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSearchResults(data);
      if (data.length === 1) {
        handleSelectPatient(data[0]);
      } else if (data.length === 0) {
        showToast.error("Patient not found");
      }
    } catch (err) {
      console.error(err);
      showToast.error("Failed to search patient");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setSearchResults([]);
    setSearchQuery('');
    
    try {
      setIsLoadingProfile(true);
      // Fetch full patient details (including visits, treatments, etc.)
      const detailsRes = await api.get(`/patients/${patient._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPatientDetails(detailsRes.data);

      // Fetch appointments for this patient
      const appointmentsRes = await api.get(`/appointments?patientId=${patient._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAppointments(appointmentsRes.data);
    } catch (err) {
      console.error(err);
      showToast.error("Failed to load patient profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '-';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate total treatment cost
  const totalTreatmentCost = patientDetails?.treatments?.reduce((acc, t) => acc + (Number(t.cost) || 0), 0) || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Search and view comprehensive patient history</p>
        </div>
        {selectedPatient && (
          <Button variant="outline" onClick={() => setSelectedPatient(null)} className="shrink-0">
            Search Another Patient
          </Button>
        )}
      </div>

      {/* Search Section (Shown if no patient selected or searching again) */}
      {!selectedPatient && (
        <Card className="p-8 mt-8 border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Find Patient</h2>
            <p className="text-slate-500 text-sm mt-1">Enter Patient ID, Name, or Phone number</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search patient..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-lg shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" disabled={isSearching} className="absolute right-2 px-6 py-2 h-auto">
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-6 border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                Select Patient ({searchResults.length} found)
              </div>
              <ul className="divide-y divide-slate-50">
                {searchResults.map(p => (
                  <li 
                    key={p._id} 
                    className="p-4 hover:bg-blue-50/50 cursor-pointer transition-colors flex items-center justify-between group"
                    onClick={() => handleSelectPatient(p)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-700">{p.name} <span className="text-xs text-slate-500 font-normal ml-2">ID: {p.patientId}</span></div>
                        <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1"><Phone size={12}/> {p.phone}</span>
                          <span>•</span>
                          <span>{calculateAge(p.dateOfBirth)} yrs</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-blue-500" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Patient Profile View */}
      {selectedPatient && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {isLoadingProfile ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : patientDetails ? (
            <>
              {/* Profile Header */}
              <Card className="overflow-hidden relative border-none shadow-md">
                <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                <div className="px-6 pb-6 relative">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 gap-6">
                    <div className="w-24 h-24 rounded-2xl border-4 border-white bg-white flex items-center justify-center text-4xl font-bold text-blue-600 shadow-lg">
                      {patientDetails.name?.charAt(0)}
                    </div>
                    <div className="flex-1 mb-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900">{patientDetails.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold tracking-wide">
                          ID: {patientDetails.patientId}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600 font-medium">
                        <span className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400" /> {calculateAge(patientDetails.dateOfBirth)} yrs ({patientDetails.gender})</span>
                        <span className="flex items-center gap-1.5"><Phone size={16} className="text-slate-400" /> {patientDetails.phone}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" /> {patientDetails.address}</span>
                      </div>
                    </div>
                    <div className="mb-2 w-full sm:w-auto bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-end">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Treatment Value</span>
                      <span className="text-2xl font-black text-emerald-600">${totalTreatmentCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column (Appointments & Stats) */}
                <div className="space-y-6">
                  <Card className="p-5 border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="text-indigo-500" size={18} />
                        Appointments
                      </h3>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{appointments.length}</span>
                    </div>
                    
                    {appointments.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-sm italic">
                        No appointments found.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                        {appointments.map(app => (
                          <div key={app._id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <span className="text-sm font-bold text-slate-800">{formatDate(app.date)}</span>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                app.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                app.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                app.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-slate-100 text-slate-700'
                              )}>
                                {app.status}
                              </span>
                            </div>
                            <div className="text-xs text-slate-600 flex justify-between items-center">
                              <span className="flex items-center gap-1.5"><Clock size={12}/> {formatTime(app.date)}</span>
                              {app.doctorName && <span className="flex items-center gap-1.5"><User size={12}/> Dr. {app.doctorName}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Demographics Summary */}
                  <Card className="p-5 border-slate-200">
                    <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <User className="text-slate-500" size={18} />
                      Patient Info
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-500">Registered On</span>
                        <span className="font-semibold text-slate-800">{formatDate(patientDetails.createdAt)}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-500">Email</span>
                        <span className="font-semibold text-slate-800">{patientDetails.email || 'N/A'}</span>
                      </div>
                      {patientDetails.emergencyContact?.name && (
                        <div className="pt-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Emergency Contact</span>
                          <div className="bg-red-50/50 p-2.5 rounded-lg border border-red-100/50">
                            <div className="font-semibold text-slate-800">{patientDetails.emergencyContact.name} ({patientDetails.emergencyContact.relationship})</div>
                            <div className="text-slate-600 mt-0.5">{patientDetails.emergencyContact.phone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Right Column (Clinical History) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Treatments & Costs */}
                  <Card className="p-5 border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <DollarSign className="text-emerald-500" size={18} />
                        Treatments & Costs
                      </h3>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{patientDetails.treatments?.length || 0}</span>
                    </div>

                    {patientDetails.treatments?.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No treatments recorded yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Treatment</th>
                              <th className="px-4 py-3 font-semibold">Date</th>
                              <th className="px-4 py-3 font-semibold text-center">Status</th>
                              <th className="px-4 py-3 font-semibold text-right">Cost</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {patientDetails.treatments.map((t, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-4 py-3 font-semibold text-slate-800">{t.name}</td>
                                <td className="px-4 py-3 text-slate-600">{formatDate(t.date)}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-bold",
                                    t.status === 'Completed' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                                  )}>
                                    {t.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900">
                                  ${Number(t.cost || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>

                  {/* Clinical Visits / Diagnoses */}
                  <Card className="p-5 border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Stethoscope className="text-blue-500" size={18} />
                        Clinical Visits & Diagnoses
                      </h3>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">{patientDetails.diagnoses?.length || 0}</span>
                    </div>

                    {patientDetails.diagnoses?.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No clinical visits recorded yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {patientDetails.diagnoses.map((d, idx) => (
                          <div key={idx} className="relative pl-6 pb-2 border-l-2 border-blue-100 last:border-transparent last:pb-0">
                            <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 ring-4 ring-white"></div>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 text-base">{d.diagnosis}</h4>
                                <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">{formatDate(d.date)}</span>
                              </div>
                              <div className="mt-3">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Treatment Plan</span>
                                <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-100 leading-relaxed">
                                  {d.treatmentPlan || 'No treatment plan documented.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Profile;
