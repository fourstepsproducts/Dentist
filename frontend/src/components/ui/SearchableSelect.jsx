import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

const SearchableSelect = ({
  options = [],
  value = '',
  onChange,
  placeholder = 'Select option',
  searchPlaceholder = 'Search...',
  onCreateNew,
  className
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
    const dropdownHeight = 250;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // If not enough space below but enough above, open upward
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

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const dropdownPanel = isOpen ? createPortal(
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden"
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

      {/* Options List – only this scrolls */}
      <div className="overflow-y-auto" style={{ maxHeight: 190 }}>
        {filteredOptions.length === 0 ? (
          <div className="px-3 py-4 text-xs text-slate-400 text-center">
            No matching options
          </div>
        ) : (
          filteredOptions.map((opt, idx) => (
            <button
              type="button"
              key={idx}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors focus:bg-slate-50 focus:outline-none",
                opt.value === value && "bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100"
              )}
            >
              {opt.label}
            </button>
          ))
        )}
      </div>

      {/* Pinned "Create New Role" */}
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
          Create New Role
        </button>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className={cn("relative w-full", className)}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={isOpen ? () => setIsOpen(false) : openDropdown}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shadow-sm transition-all hover:border-slate-300 text-left",
          isOpen && "border-blue-600 ring-2 ring-blue-600/20"
        )}
      >
        <span className={cn("truncate", !selectedOption && "text-slate-400")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          className={cn("text-slate-400 shrink-0 ml-2 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>

      {dropdownPanel}
    </div>
  );
};

export { SearchableSelect };
