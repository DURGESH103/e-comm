import React, { useState, useEffect } from 'react';

const EMPTY = {
  fullName: '', phone: '', houseNumber: '', street: '',
  city: '', state: '', pincode: '', country: 'India',
  latitude: null, longitude: null,
};

const InputField = ({ label, name, value, onChange, type = 'text', required, placeholder, maxLength }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      maxLength={maxLength}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
    />
  </div>
);

const AddressForm = ({ initial = null, onSubmit, onCancel, isLoading }) => {
  const [form, setForm]                   = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [locating, setLocating]           = useState(false);
  const [locError, setLocError]           = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);

  useEffect(() => {
    if (initial) setForm({ ...EMPTY, ...initial });
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === 'pincode' && value.length === 6 && /^\d{6}$/.test(value)) {
      autofillPincode(value);
    }
  };

  const autofillPincode = async (pin) => {
    setPincodeLoading(true);
    try {
      const res  = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data[0]?.Status === 'Success') {
        const post = data[0].PostOffice[0];
        setForm((prev) => ({ ...prev, city: post.District, state: post.State }));
      }
    } catch { /* user fills manually */ }
    finally { setPincodeLoading(false); }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const a    = data.address || {};
          setForm((prev) => ({
            ...prev,
            latitude,
            longitude,
            houseNumber: a.house_number  || prev.houseNumber,
            street:      a.road || a.suburb || a.neighbourhood || prev.street,
            city:        a.city || a.town  || a.village || a.county || prev.city,
            state:       a.state   || prev.state,
            pincode:     a.postcode || prev.pincode,
            country:     a.country  || prev.country,
          }));
        } catch {
          setLocError('Could not fetch address details. Please fill in manually.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocError(
          err.code === 1
            ? 'Location permission denied. Please allow access and try again.'
            : 'Unable to detect location. Please fill in manually.'
        );
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Detect Location ── */}
      <button
        type="button"
        onClick={handleDetectLocation}
        disabled={locating}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4
                   border-2 border-dashed border-blue-400 rounded-lg text-blue-600
                   hover:bg-blue-50 transition-colors text-sm font-medium disabled:opacity-60"
      >
        {locating ? (
          <>
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Detecting location…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Use Current Location
          </>
        )}
      </button>

      {locError && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{locError}</p>
      )}

      {/* ── Map preview ── */}
      {form.latitude && form.longitude && (
        <div className="rounded-lg overflow-hidden border border-gray-200 h-36">
          <iframe
            title="Location preview"
            width="100%"
            height="100%"
            loading="lazy"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${form.longitude - 0.01},${form.latitude - 0.01},${form.longitude + 0.01},${form.latitude + 0.01}&layer=mapnik&marker=${form.latitude},${form.longitude}`}
          />
        </div>
      )}

      {/* ── Name + Phone ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField label="Full Name"    name="fullName" value={form.fullName} onChange={handleChange} required />
        <InputField label="Phone Number" name="phone"    value={form.phone}    onChange={handleChange} required type="tel" placeholder="10-digit mobile" />
      </div>

      <InputField label="House No / Flat / Building" name="houseNumber" value={form.houseNumber} onChange={handleChange} required placeholder="e.g. 42B, Tower 3" />
      <InputField label="Street / Area / Locality"   name="street"      value={form.street}      onChange={handleChange} required placeholder="e.g. MG Road, Koramangala" />

      {/* ── Pincode / City / State ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pincode <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              maxLength={6}
              required
              placeholder="6-digit pincode"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {pincodeLoading && (
              <svg className="animate-spin w-4 h-4 text-blue-500 absolute right-2 top-2.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
          </div>
        </div>
        <InputField label="City"  name="city"  value={form.city}  onChange={handleChange} required placeholder="Auto-filled" />
        <InputField label="State" name="state" value={form.state} onChange={handleChange} required placeholder="Auto-filled" />
      </div>

      <InputField label="Country" name="country" value={form.country} onChange={handleChange} />

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium
                     rounded-lg transition-colors disabled:opacity-60 text-sm"
        >
          {isLoading ? 'Saving…' : initial ? 'Update Address' : 'Save Address'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium
                       rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AddressForm;
