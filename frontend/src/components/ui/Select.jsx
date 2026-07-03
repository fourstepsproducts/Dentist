import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({ className, options, placeholder, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all hover:border-slate-300",
          className
        )}
        ref={ref}
        {...props}
      >
        {placeholder && <option value="" disabled hidden>{placeholder}</option>}
        {options?.map((opt, idx) => (
          <option key={idx} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
        <ChevronDown size={16} />
      </div>
    </div>
  );
});
Select.displayName = 'Select';

export { Select };
