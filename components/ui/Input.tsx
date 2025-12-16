import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
      <input
        className={`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${className}`}
        {...props}
      />
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
      <select
        className={`bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${className}`}
        {...props}
      >
        <option value="" disabled>Choisir...</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};
