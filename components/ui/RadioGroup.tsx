// components/ui/RadioGroup.tsx
"use client";
import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  price: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  name: string;
  selectedValue: string;
  onChange: (value: string) => void;
}

const tierColors: { [key: string]: string } = {
  Platinum: 'border-yellow-300',
  Gold: 'border-yellow-500',
  Silver: 'border-gray-400',
  Bronze: 'border-orange-400',
  Basic: 'border-gray-300',
};

const RadioGroup = ({ options, name, selectedValue, onChange }: RadioGroupProps) => {
  return (
    <div className="space-y-3">
      {options.map((option) => (
        <label
          key={option.value}
          className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
            selectedValue === option.value
              ? `ring-2 ring-offset-2 ring-orange-500 ${tierColors[option.label] || 'border-orange-500'}`
              : `border-gray-200 hover:border-gray-400 ${tierColors[option.label] || 'border-gray-300'}`
          }`}
        >
          <div className="flex items-center">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
            />
            <span className="ml-3 text-md font-medium text-gray-900">{option.label}</span>
          </div>
          <span className="text-md font-semibold text-gray-700">{option.price}</span>
        </label>
      ))}
    </div>
  );
};

export default RadioGroup;