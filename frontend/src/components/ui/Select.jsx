import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Standard Status Dot Colors
 */
const STATUS_DOT_COLORS = {
  'scheduled': 'bg-blue-500',
  'checked in': 'bg-emerald-500',
  'missed': 'bg-rose-500',
  'completed': 'bg-blue-600',
  'cancelled': 'bg-slate-400',
  'in consultation': 'bg-amber-500',
  'waiting': 'bg-amber-500',
};

const getOptionDotColor = (opt) => {
  if (opt.dot) {
    if (opt.dot === 'blue') return 'bg-blue-500';
    if (opt.dot === 'green' || opt.dot === 'emerald') return 'bg-emerald-500';
    if (opt.dot === 'red' || opt.dot === 'rose') return 'bg-rose-500';
    if (opt.dot === 'amber' || opt.dot === 'yellow') return 'bg-amber-500';
    return opt.dot;
  }
  const key = String(opt.value || opt.label || '').trim().toLowerCase();
  return STATUS_DOT_COLORS[key] || null;
};

/**
 * Polished Custom Dropdown Component for Oasis Dental
 */
const Select = React.forwardRef(({
  className,
  options: optionsProp,
  placeholder = 'Select option...',
  value,
  defaultValue,
  onChange,
  disabled = false,
  name,
  required = false,
  children,
  size = 'default', // 'default' | 'sm' | 'lg'
  badgeMode = false,
  showIndicator = true,
  ...props
}, ref) => {
  // Normalize options from optionsProp or children
  const options = useMemo(() => {
    if (optionsProp && Array.isArray(optionsProp)) {
      return optionsProp.map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
          const val = String(opt.value !== undefined ? opt.value : opt.val !== undefined ? opt.val : '');
          const lbl = opt.label !== undefined ? opt.label : val;
          return {
            value: val,
            label: lbl,
            disabled: Boolean(opt.disabled),
            dot: opt.dot || null,
          };
        }
        return { value: String(opt), label: String(opt), disabled: false, dot: null };
      });
    }

    // Parse children if they are <option> elements
    if (children) {
      const parsed = [];
      React.Children.forEach(children, (child) => {
        if (!child) return;
        if (React.isValidElement(child) && child.type === 'option') {
          parsed.push({
            value: String(child.props.value !== undefined ? child.props.value : child.props.children || ''),
            label: child.props.children || String(child.props.value || ''),
            disabled: Boolean(child.props.disabled),
            dot: child.props.dot || null,
          });
        }
      });
      return parsed;
    }

    return [];
  }, [optionsProp, children]);

  // Internal value handling
  const [internalValue, setInternalValue] = useState(
    value !== undefined ? value : (defaultValue !== undefined ? defaultValue : (options[0]?.value || ''))
  );

  const currentValue = value !== undefined ? value : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Sync ref with trigger
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(triggerRef.current);
      } else {
        ref.current = triggerRef.current;
      }
    }
  }, [ref]);

  // Compute position relative to viewport via portal
  const computePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedHeight = Math.min(260, Math.max(80, options.length * 36 + 16));
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const openUpward = spaceBelow < estimatedHeight + 12 && spaceAbove > estimatedHeight;

    setDropdownStyle({
      position: 'fixed',
      left: Math.max(8, rect.left),
      minWidth: Math.max(rect.width, 140),
      maxWidth: Math.max(rect.width, 320),
      width: rect.width,
      zIndex: 99999,
      ...(openUpward
        ? { bottom: viewportHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    });
  }, [options.length]);

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen) {
      computePosition();
      setIsOpen(true);
      const currentIndex = options.findIndex((opt) => String(opt.value) === String(currentValue));
      setHighlightedIndex(currentIndex >= 0 ? currentIndex : 0);
    } else {
      setIsOpen(false);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Reposition on scroll / window resize
  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => computePosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, computePosition]);

  // Select an option
  const handleSelectOption = (opt) => {
    if (opt.disabled) return;
    const newValue = opt.value;
    setInternalValue(newValue);
    setIsOpen(false);

    if (onChange) {
      const syntheticEvent = {
        target: {
          name,
          value: newValue,
        },
        currentTarget: {
          name,
          value: newValue,
        },
        persist: () => {},
        preventDefault: () => {},
        stopPropagation: () => {},
      };
      onChange(syntheticEvent);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!isOpen) {
        toggleDropdown();
      } else if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        handleSelectOption(options[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        toggleDropdown();
      } else {
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        toggleDropdown();
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
      }
    }
  };

  // Selected option finding
  const selectedOption = options.find((opt) => String(opt.value) === String(currentValue));
  const displayText = selectedOption ? selectedOption.label : placeholder;
  const selectedDotColor = (showIndicator && selectedOption) ? getOptionDotColor(selectedOption) : null;

  const isSmall = size === 'sm';

  const dropdownPortal = isOpen ? createPortal(
    <div
      ref={dropdownRef}
      style={dropdownStyle}
      className="bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150 select-none text-left"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="max-h-[240px] overflow-y-auto px-1 space-y-0.5">
        {options.length === 0 ? (
          <div className="px-3 py-2.5 text-xs text-slate-400 text-center italic">
            No options available
          </div>
        ) : (
          options.map((opt, idx) => {
            const isSelected = String(opt.value) === String(currentValue);
            const isHighlighted = idx === highlightedIndex;
            const optDotColor = showIndicator ? getOptionDotColor(opt) : null;

            return (
              <button
                key={idx}
                type="button"
                disabled={opt.disabled}
                onClick={() => handleSelectOption(opt)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={cn(
                  "w-full text-left rounded-lg transition-all flex items-center justify-between gap-2 cursor-pointer font-medium",
                  isSmall ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
                  isSelected
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : isHighlighted
                    ? "bg-slate-50 text-slate-900"
                    : "text-slate-700 hover:bg-slate-50",
                  opt.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent text-slate-400"
                )}
              >
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  {optDotColor && (
                    <span className="w-2 h-2 rounded-full shrink-0 shadow-2xs" style={{ backgroundColor: undefined }}>
                      <span className={cn("block w-2 h-2 rounded-full", optDotColor)} />
                    </span>
                  )}
                  <span className="truncate">{opt.label}</span>
                </div>
                {isSelected && (
                  <Check size={14} className="text-blue-600 shrink-0 ml-1.5" />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={cn("relative inline-block w-full", className)}>
      {/* Hidden input for form serialization */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue}
          required={required}
        />
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center justify-between rounded-xl border border-slate-200/90 bg-white text-slate-800 shadow-2xs transition-all duration-150 hover:border-slate-300 text-left select-none",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
          isOpen && "border-blue-500 ring-2 ring-blue-500/20 shadow-xs",
          isSmall ? "h-8 px-2.5 py-1 text-xs font-semibold" : "h-10 px-3 py-2 text-sm font-medium",
          disabled && "bg-slate-50 text-slate-400 cursor-not-allowed opacity-60 hover:border-slate-200",
          badgeMode && "h-auto py-1 px-2.5 text-xs font-bold uppercase",
        )}
        {...props}
      >
        <span className="flex items-center gap-2 truncate flex-1 min-w-0 mr-1.5">
          {selectedDotColor && (
            <span className={cn("w-2 h-2 rounded-full shrink-0 shadow-2xs", selectedDotColor)} />
          )}
          <span className={cn("truncate", !selectedOption && "text-slate-400 font-normal")}>
            {displayText}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-slate-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-blue-600"
          )}
        />
      </button>

      {dropdownPortal}
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
export default Select;
