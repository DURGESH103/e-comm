import React from 'react';

// CSS color map for known color names
const CSS_COLOR_MAP = {
  red: '#e53e3e',
  blue: '#3182ce',
  navy: '#1a365d',
  green: '#38a169',
  black: '#1a202c',
  white: '#f7fafc',
  yellow: '#d69e2e',
  pink: '#d53f8c',
  purple: '#805ad5',
  orange: '#dd6b20',
  gray: '#718096',
  grey: '#718096',
  brown: '#744210',
  beige: '#f5f0e8',
  maroon: '#742a2a',
  teal: '#2c7a7b',
  cyan: '#00b5d8',
  indigo: '#4c51bf',
  violet: '#6b46c1',
  gold: '#b7791f',
  silver: '#a0aec0',
};

const isColorAttr = (attr) => attr.toLowerCase() === 'color';

/**
 * Returns all unique values for a given attribute across all variants.
 */
const getAllValues = (variants, attr) =>
  [...new Set(variants.map((v) => v.attributes[attr]).filter(Boolean))];

/**
 * For a given targetAttr, returns which values are still selectable given
 * the current selections on all OTHER attributes.
 *
 * A value is available if at least one variant with stock > 0 exists that:
 *   - has targetAttr === value
 *   - matches every OTHER attribute that has already been selected
 */
const getAvailableValues = (variants, selectedAttrs, targetAttr) => {
  const otherSelections = Object.entries(selectedAttrs).filter(
    ([k, v]) => k !== targetAttr && v !== ''
  );

  return getAllValues(variants, targetAttr).filter((val) =>
    variants.some((v) => {
      if (v.attributes[targetAttr] !== val) return false;
      if (v.stock === 0) return false;
      return otherSelections.every(([k, sv]) => v.attributes[k] === sv);
    })
  );
};

const VariantSelector = ({ attributes = [], variants = [], selectedAttrs = {}, onChange }) => {
  if (!attributes.length || !variants.length) return null;

  return (
    <div className="space-y-5 mb-6">
      {attributes.map((attr) => {
        const allValues = getAllValues(variants, attr);
        const availableValues = getAvailableValues(variants, selectedAttrs, attr);
        const isColor = isColorAttr(attr);
        const selectedVal = selectedAttrs[attr] || '';

        return (
          <div key={attr}>
            {/* Label row */}
            <p className="text-sm font-semibold text-gray-800 mb-2.5 capitalize">
              {attr}
              {selectedVal && (
                <span className="font-normal text-gray-500 ml-1.5">: {selectedVal}</span>
              )}
            </p>

            {/* Option buttons */}
            <div className="flex flex-wrap gap-2">
              {allValues.map((val) => {
                const isSelected = selectedVal === val;
                const isAvailable = availableValues.includes(val);

                if (isColor) {
                  const cssColor = CSS_COLOR_MAP[val.toLowerCase()] ?? '#cbd5e0';
                  const isLight = ['white', 'beige', 'silver', 'yellow', 'gold'].includes(
                    val.toLowerCase()
                  );

                  return (
                    <button
                      key={val}
                      type="button"
                      title={val}
                      disabled={!isAvailable}
                      onClick={() => onChange(attr, isSelected ? '' : val)}
                      className={[
                        'relative w-9 h-9 rounded-full transition-all duration-150 focus:outline-none',
                        isSelected
                          ? 'ring-2 ring-offset-2 ring-primary-500 scale-110 shadow-md'
                          : 'ring-1 ring-gray-300',
                        isAvailable
                          ? 'cursor-pointer hover:scale-105'
                          : 'opacity-40 cursor-not-allowed',
                        isLight ? 'ring-gray-400' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={{ backgroundColor: cssColor }}
                    >
                      {/* Diagonal strike for unavailable */}
                      {!isAvailable && (
                        <span
                          className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <span
                            className="block w-[130%] h-px bg-gray-500 rotate-45"
                            style={{ transformOrigin: 'center' }}
                          />
                        </span>
                      )}
                      {/* Checkmark for selected */}
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className={`w-4 h-4 ${isLight ? 'text-gray-800' : 'text-white'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                }

                // Non-color: square pill buttons (size, storage, model, etc.)
                return (
                  <button
                    key={val}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => onChange(attr, isSelected ? '' : val)}
                    className={[
                      'relative px-3.5 py-1.5 text-sm font-medium rounded border transition-all duration-150 focus:outline-none min-w-[2.5rem] text-center',
                      isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                        : 'border-gray-300 bg-white text-gray-700',
                      isAvailable
                        ? 'cursor-pointer hover:border-gray-500'
                        : 'opacity-40 cursor-not-allowed',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {val}
                    {/* Diagonal strike overlay for unavailable */}
                    {!isAvailable && (
                      <span
                        className="absolute inset-0 rounded overflow-hidden flex items-center justify-center pointer-events-none"
                        aria-hidden="true"
                      >
                        <span className="block w-full h-px bg-gray-400 rotate-45" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VariantSelector;
