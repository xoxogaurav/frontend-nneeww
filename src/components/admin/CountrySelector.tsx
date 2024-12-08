import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CountrySelectorProps {
  availableCountries: { code: string; name: string }[];
  selectedCountries: string[];
  onChange: (selected: string[]) => void;
}

export default function CountrySelector({ availableCountries, selectedCountries, onChange }: CountrySelectorProps) {
  const countries = [
    { code: 'IN', name: 'India' },
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' }
  ];

  const handleSelect = (code: string) => {
    if (!selectedCountries.includes(code)) {
      onChange([...selectedCountries, code]);
    }
  };

  const handleDeselect = (code: string) => {
    onChange(selectedCountries.filter(c => c !== code));
  };

  const getCountryName = (code: string) => {
    return countries.find(c => c.code === code)?.name || code;
  };

  return (
    <div className="flex gap-4">
      {/* Available Countries */}
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Available Countries</h3>
        <div className="border border-gray-300 rounded-md h-48 overflow-y-auto">
          {countries
            .filter(country => !selectedCountries.includes(country.code))
            .map(country => (
              <button
                key={country.code}
                onClick={() => handleSelect(country.code)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
              >
                <span>{country.name}</span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </button>
            ))}
        </div>
      </div>

      {/* Selected Countries */}
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Countries</h3>
        <div className="border border-gray-300 rounded-md h-48 overflow-y-auto">
          {selectedCountries.map(code => (
            <button
              key={code}
              onClick={() => handleDeselect(code)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
            >
              <ArrowLeft className="h-4 w-4 text-gray-400" />
              <span>{getCountryName(code)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}