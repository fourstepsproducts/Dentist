import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { ChevronDown, Search, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

const PatientSelector = ({
  value = '',
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});

  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch patients from API
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(res.data);
    } catch (err) {
      console.error('Failed to fetch patients in selector:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Compute position relative to trigger
  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 250;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUpward = spaceBelow < dropdownHeight + 16 && spaceAbove > dropdownHeight;

    setDropdownStyle({
      position: 'fixed',
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      ...(openUpward
        ? { bottom: viewportHeight - rect.top + 4 }
        : { top: rect.bottom + 4 })
    });
  }, []);

  const openDropdown = () => {
    computePosition();
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', computePosition, true);
    window.addEventListener('resize', computePosition);
    return () => {
      window.removeEventListener('scroll', computePosition, true);
      window.removeEventListener('resize', computePosition);
    };
  }, [isOpen, computePosition]);

  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  const selectedPatient = patients.find((p) => p._id === value);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.phone && p.phone.includes(searchQuery))
  );

  const dropdownPanel = isOpen ? createPortal(
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="relative p-2 border-b border-slate-100 flex items-center shrink-0">
        <Search size={13} className="absolute left-4 text-slate-400 pointer-events-none" />
        <input
          autoFocus
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by ID, Name or Phone..."
          className="w-full pl-7 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-slate-50"
        />
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: 190 }}>
        {loading ? (
          <div className="px-3 py-4 text-xs text-slate-400 text-center animate-pulse">
            Loading patients...
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="px-3 py-4 text-xs text-slate-400 text-center">
            No patients registered
          </div>
        ) : (
          filteredPatients.map((p, idx) => (
            <button
              type="button"
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(p);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors focus:bg-slate-50 focus:outline-none flex items-center justify-between",
                p._id === value && "bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100"
              )}
            >
              <div>
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-slate-400 ml-2">({p.patientId})</span>
              </div>
              <span className="text-xs text-slate-400">{p.phone}</span>
            </button>
          ))
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Users size={14} className="text-slate-400" />
        Select Active Patient
      </label>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={isOpen ? () => setIsOpen(false) : openDropdown}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isOpen) setIsOpen(false);
            else openDropdown();
          }
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shadow-sm transition-all hover:border-slate-300 text-left cursor-pointer select-none",
          isOpen && "border-blue-600 ring-2 ring-blue-600/20"
        )}
      >
        <span className={cn("truncate", !selectedPatient && "text-slate-400")}>
          {selectedPatient ? `${selectedPatient.name} (${selectedPatient.patientId})` : "Select registered patient..."}
        </span>
        <ChevronDown
          size={15}
          className={cn("text-slate-400 shrink-0 ml-2 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </div>

      {dropdownPanel}
    </div>
  );
};

export { PatientSelector };
