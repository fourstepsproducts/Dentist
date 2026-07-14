import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Plus, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const SearchableMultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = 'Select options',
  searchPlaceholder = 'Search...',
  onCreateNew,
  createNewLabel = '+ Create New',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({});

  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Compute dropdown position relative to the trigger button
  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 300;
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
        : { top: rect.bottom + 4 }),
    });
  }, []);

  const openDropdown = () => {
    computePosition();
    setIsOpen(true);
  };

  // Close on outside click
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

  // Recompute on scroll/resize while open
  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('scroll', computePosition, true);
    window.addEventListener('resize', computePosition);
    return () => {
      window.removeEventListener('scroll', computePosition, true);
      window.removeEventListener('resize', computePosition);
    };
  }, [isOpen, computePosition]);

  // Reset search on close
  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  const selectedValues = Array.isArray(value) ? value : [];

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOption = (optValue) => {
    const newValue = selectedValues.includes(optValue)
      ? selectedValues.filter((v) => v !== optValue)
      : [...selectedValues, optValue];
    onChange(newValue);
  };

  const removeTag = (optValue, e) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== optValue));
  };

  const selectedLabels = selectedValues.map(
    (v) => options.find((o) => o.value === v)?.label || v
  );

  const dropdownPanel = isOpen
    ? createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Search Box */}
          <div className="relative p-2 border-b border-slate-100 flex items-center shrink-0">
            <Search size={13} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-7 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-slate-50"
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto" style={{ maxHeight: 210 }}>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-400 text-center">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={idx}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      toggleOption(opt.value);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors focus:bg-slate-50 focus:outline-none flex items-center gap-2.5',
                      isSelected && 'bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100'
                    )}
                  >
                    {/* Checkbox */}
                    <span
                      className={cn(
                        'flex items-center justify-center w-4 h-4 rounded border shrink-0 transition-all',
                        isSelected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      )}
                    >
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {opt.label}
                  </button>
                );
              })
            )}
          </div>

          {/* Pinned "Create New" */}
          {onCreateNew && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsOpen(false);
                onCreateNew();
              }}
              className="w-full text-left px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 border-t border-slate-100 transition-colors shrink-0 flex items-center gap-2"
            >
              <Plus size={14} />
              {createNewLabel}
            </button>
          )}
        </div>,
        document.body
      )
    : null;

  return (
    <div className={cn('relative w-full', className)}>
      {/* Trigger */}
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
          'flex min-h-[40px] w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shadow-sm transition-all hover:border-slate-300 text-left cursor-pointer select-none',
          isOpen && 'border-blue-600 ring-2 ring-blue-600/20'
        )}
      >
        <div className="flex-1 flex flex-wrap gap-1.5 items-center">
          {selectedLabels.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : (
            selectedLabels.map((label, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-semibold pl-2 pr-1 py-0.5 rounded-md border border-blue-100"
              >
                {label}
                <button
                  type="button"
                  onClick={(e) => removeTag(selectedValues[i], e)}
                  className="text-blue-400 hover:text-blue-700 hover:bg-blue-100 rounded p-0.5 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown
          size={15}
          className={cn(
            'text-slate-400 shrink-0 ml-2 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </div>

      {dropdownPanel}
    </div>
  );
};

export { SearchableMultiSelect };
