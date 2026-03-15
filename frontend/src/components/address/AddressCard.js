import React from 'react';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault, isDeleting, isSettingDefault, selectable, selected, onSelect }) => {
  const { fullName, phone, houseNumber, street, city, state, pincode, country, isDefault } = address;

  return (
    <div
      onClick={selectable ? onSelect : undefined}
      className={`
        relative bg-white rounded-xl border-2 p-4 transition-all duration-150
        ${selectable ? 'cursor-pointer' : ''}
        ${selected    ? 'border-blue-500 shadow-md shadow-blue-100' : 'border-gray-200 hover:border-gray-300'}
        ${isDefault && !selectable ? 'border-blue-200 bg-blue-50/30' : ''}
      `}
    >
      {/* ── Default badge ── */}
      {isDefault && (
        <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wide
                         bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          Default
        </span>
      )}

      {/* ── Selected indicator (checkout mode) ── */}
      {selectable && (
        <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center
                         ${selected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
          {selected && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      )}

      {/* ── Address details ── */}
      <div className="pr-16">
        <p className="font-semibold text-gray-900 text-sm">{fullName}</p>
        <p className="text-gray-500 text-xs mt-0.5">{phone}</p>
        <p className="text-gray-700 text-sm mt-2 leading-relaxed">
          {houseNumber}, {street},<br />
          {city}, {state} — {pincode}<br />
          {country}
        </p>
      </div>

      {/* ── Action buttons (non-selectable / management mode) ── */}
      {!selectable && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-medium text-blue-600
                       hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>

          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 text-xs font-medium text-red-500
                       hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>

          {!isDefault && (
            <button
              onClick={onSetDefault}
              disabled={isSettingDefault}
              className="ml-auto flex items-center gap-1 text-xs font-medium text-gray-600
                         hover:text-gray-800 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {isSettingDefault ? 'Setting…' : 'Set as Default'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressCard;
