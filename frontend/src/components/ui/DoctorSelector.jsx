import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api';
import { ChevronDown, Loader2, UserCheck, Stethoscope, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { showToast } from '../../utils/toast';

/**
 * DoctorSelector Component
 * 
 * A dynamic, searchable, scrollable dropdown for selecting Doctors in Visit forms.
 * Supports source filtering via `type` prop:
 * - `type="internal"`: Fetches active staff members where Role = Doctor (from Staff Management)
 * - `type="external"`: Fetches external doctors (from Doctor Management)
 * - `type="all"`: Fetches all active doctors
 * 
 * Future-Ready Architecture:
 * Prepared with modular helpers & state containers for future extensions:
 * - Search by doctor name / specialization / department / hospital
 * - Recently selected doctors history
 * 
 * @param {Object} props
 * @param {string} props.value - Selected Doctor ID (_id or doctorId)
 * @param {'internal' | 'external' | 'all'} props.type - Doctor source filter
 * @param {string} props.selectedDoctorName - Optional explicit name override
 * @param {Function} props.onChange - Handler called with selected doctor object { _id, doctorId, name, doctorName, specialization, department }
 * @param {string} props.placeholder - Placeholder text when no doctor is selected
 * @param {boolean} props.disabled - Disable input trigger
 * @param {string} props.className - Custom styling class
 */

// ─── Future-Ready Helper Extensions ─────────────────────────────────────────────

/**
 * Filter doctors list by multiple criteria (Search by name, specialization, department, hospital)
 * @param {Array} doctors 
 * @param {Object} filters { name, specialization, department, hospital }
 */
export const filterDoctors = (doctors = [], filters = {}) => {
  const { name = '', specialization = '', department = '', hospital = '' } = filters;
  return doctors.filter((doc) => {
    const docName = (doc.name || doc.doctorName || '').toLowerCase();
    const docSpec = (doc.specialization || doc.role || '').toLowerCase();
    const docDept = (doc.department || '').toLowerCase();
    const docHosp = (doc.hospital || '').toLowerCase();

    const matchesName = !name || docName.includes(name.toLowerCase());
    const matchesSpec = !specialization || docSpec.includes(specialization.toLowerCase());
    const matchesDept = !department || docDept.includes(department.toLowerCase());
    const matchesHosp = !hospital || docHosp.includes(hospital.toLowerCase());

    return matchesName && matchesSpec && matchesDept && matchesHosp;
  });
};

/**
 * Retrieve recently selected doctors list from local history (Prepared for future implementation)
 * @param {Array} doctors 
 * @param {Array} recentIds 
 */
export const getRecentDoctors = (doctors = [], recentIds = []) => {
  if (!recentIds.length) return [];
  return doctors.filter((doc) => recentIds.includes(doc._id || doc.doctorId));
};

const DoctorSelector = ({
  value = '',
  type = 'all', // 'internal' | 'external' | 'all'
  selectedDoctorName = '',
  onChange,
  placeholder = 'Select Doctor',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Future-Ready State Architecture (Ready for specialization/department/hospital filters)
  const [searchFilters, setSearchFilters] = useState({
    specialization: '',
    department: '',
    hospital: '',
  });
  const [recentDoctorIds, setRecentDoctorIds] = useState([]);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fetch doctors based on source type
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get(`/doctors?type=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data || []);
      setHasFetched(true);
    } catch (err) {
      console.error(`Failed to fetch ${type} doctors list:`, err);
      showToast.error('Failed to load doctors list. Please try again.');
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Find currently selected doctor object
  const selectedDoctor = doctors.find(
    (d) => (d._id === value || d.doctorId === value)
  );

  // Determine display name
  const displayName = selectedDoctor?.name || selectedDoctor?.doctorName || selectedDoctorName || (value && typeof value === 'string' && !value.match(/^[0-9a-fA-F]{24}$/) ? value : '');

  const handleSelectDoctor = (doc) => {
    if (onChange) {
      onChange(doc);
    }
    setRecentDoctorIds((prev) => Array.from(new Set([doc._id || doc.doctorId, ...prev])));
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen && !hasFetched) {
      fetchDoctors();
    }
    setIsOpen(!isOpen);
  };

  // Active combined filters including real-time search query
  const combinedFilters = {
    name: searchQuery,
    ...searchFilters,
  };

  const displayedDoctors = filterDoctors(doctors, combinedFilters);

  // Empty state message based on doctor source type
  const getEmptyMessage = () => {
    if (searchQuery.trim()) {
      return `No doctors matching "${searchQuery}"`;
    }
    if (type === 'internal') {
      return 'No active staff doctors available. Please add staff with Role = Doctor in Admin → Staff Management.';
    }
    if (type === 'external') {
      return 'No external doctors available. Please add doctors from the Admin → Doctors page.';
    }
    return 'No doctors available. Please add doctors from the Admin panel.';
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Input Trigger Button matching standard form styling */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault();
            toggleDropdown();
          }
        }}
        className={cn(
          'w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white text-sm transition text-left select-none cursor-pointer',
          'hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600',
          isOpen && 'border-blue-600 ring-2 ring-blue-600/20',
          disabled && 'opacity-60 cursor-not-allowed bg-gray-50'
        )}
      >
        <span className={cn('truncate font-medium', displayName ? 'text-gray-900' : 'text-gray-400')}>
          {displayName || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn('text-gray-400 shrink-0 ml-2 transition-transform duration-200', isOpen && 'rotate-180')}
        />
      </div>

      {/* Scrollable & Searchable Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          
          {/* Integrated Search Bar */}
          <div className="p-2 border-b border-gray-100 relative flex items-center bg-gray-50/50">
            <Search size={14} className="absolute left-4 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctor by name..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Scrollable Doctor List */}
          <div className="max-h-56 overflow-y-auto py-1 divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span>Loading doctors…</span>
              </div>
            ) : displayedDoctors.length === 0 ? (
              <div className="p-4 text-xs text-gray-500 text-center leading-relaxed">
                {getEmptyMessage()}
              </div>
            ) : (
              displayedDoctors.map((doc) => {
                const docId = doc._id || doc.doctorId;
                const isSelected = docId === value || doc.name === value;

                return (
                  <button
                    key={docId}
                    type="button"
                    onClick={() => handleSelectDoctor(doc)}
                    className={cn(
                      'w-full text-left px-3.5 py-2.5 text-sm transition-colors flex items-center justify-between gap-2 group',
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-800 hover:bg-gray-50 hover:text-blue-600'
                    )}
                  >
                    <div className="min-w-0 flex flex-col">
                      <div className="flex items-center gap-2">
                        <Stethoscope size={14} className={cn('shrink-0', isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500')} />
                        <span className="truncate">{doc.name || doc.doctorName}</span>
                      </div>
                      {(doc.specialization || doc.role) && (
                        <span className="text-[11px] text-gray-400 pl-5 font-normal">
                          {doc.specialization || doc.role}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <UserCheck size={15} className="text-blue-600 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorSelector;
