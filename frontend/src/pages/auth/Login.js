import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

/* ── inline SVG icons ── */
const IconEmail = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IconLock = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconEye = ({ off }) => off ? (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
) : (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const IconArrow = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

/* ── floating label input ── */
const FloatInput = ({ id, name, type = 'text', label, value, onChange, icon, rightEl, error, autoComplete }) => {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;
  const borderCls = error
    ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-100'
    : lifted
    ? 'border-indigo-400 focus-within:border-indigo-500 focus-within:ring-indigo-100'
    : 'border-slate-200 focus-within:border-indigo-400 focus-within:ring-indigo-100';

  return (
    <div className="relative">
      <div className={`relative flex items-center border-2 rounded-2xl bg-white transition-all duration-200 focus-within:ring-4 ${borderCls}`}>
        <span className={`pl-4 flex-shrink-0 transition-colors duration-200 ${error ? 'text-rose-400' : lifted ? 'text-indigo-500' : 'text-slate-400'}`}>
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          className="peer w-full px-3 pt-5 pb-2 bg-transparent text-slate-800 text-sm outline-none placeholder-transparent"
          placeholder={label}
        />
        <label
          htmlFor={id}
          className={`absolute left-12 pointer-events-none font-medium transition-all duration-200 ${
            lifted
              ? 'top-1.5 text-[10px] ' + (error ? 'text-rose-500' : 'text-indigo-600')
              : 'top-3.5 text-sm text-slate-400'
          }`}
        >
          {label}
        </label>
        {rightEl && <span className="pr-3 flex-shrink-0">{rightEl}</span>}
      </div>
      {error && (
        <p className="mt-1.5 ml-1 text-xs text-rose-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
          {error}
        </p>
      )}
    </div>
  );
};

/* ── left panel feature card ── */
const FeatureCard = ({ emoji, title, sub, delay }) => (
  <div
    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3"
    style={{ animation: `slideInLeft 0.6s ease ${delay}s both` }}
  >
    <span className="text-2xl">{emoji}</span>
    <div>
      <p className="text-white text-sm font-semibold leading-tight">{title}</p>
      <p className="text-white/70 text-xs">{sub}</p>
    </div>
  </div>
);

const Login = () => {
  const [form, setForm]               = useState({ email: '', password: '' });
  const [showPw, setShowPw]           = useState(false);
  const [rememberMe, setRememberMe]   = useState(false);
  const [errors, setErrors]           = useState({});
  const [touched, setTouched]         = useState({});

  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { isLoading, isAuthenticated, error, role } = useSelector((s) => s.auth);

  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(role === 'admin' ? '/admin/dashboard' : '/', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const validate = (f) => {
    const e = {};
    if (!f.email)                          e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(f.email)) e.email   = 'Enter a valid email';
    if (!f.password)                       e.password = 'Password is required';
    else if (f.password.length < 6)        e.password = 'At least 6 characters';
    return e;
  };

  const handleChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    if (touched[e.target.name]) setErrors(validate(next));
  };

  const handleBlur = (e) => {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
    setErrors(validate(form));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    dispatch(loginUser(form));
  };

  return (
    <>
      <style>{`
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-24px) } to { opacity:1; transform:translateX(0) } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(24px)  } to { opacity:1; transform:translateX(0) } }
        @keyframes fadeUp       { from { opacity:0; transform:translateY(16px)  } to { opacity:1; transform:translateY(0) } }
        @keyframes blob         { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
        .anim-right { animation: slideInRight 0.55s ease 0.1s both }
        .anim-blob  { animation: blob 8s ease-in-out infinite }
      `}</style>

      <div className="min-h-screen flex bg-slate-50">

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
          {/* blobs */}
          <div className="anim-blob absolute top-[-80px] left-[-80px] w-80 h-80 bg-white/10 rounded-full" />
          <div className="anim-blob absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-purple-500/20 rounded-full" style={{ animationDelay: '-4s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]" />

          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            {/* Logo */}
            <div style={{ animation: 'slideInLeft 0.5s ease both' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
                  <span className="text-white font-black text-lg">S</span>
                </div>
                <div>
                  <span className="text-white font-black text-2xl tracking-tight">Shop<span className="text-indigo-200">Easy</span></span>
                  <p className="text-white/60 text-xs font-medium tracking-widest uppercase">Premium Store</p>
                </div>
              </div>
            </div>

            {/* Hero text */}
            <div className="space-y-6">
              <div style={{ animation: 'slideInLeft 0.55s ease 0.1s both' }}>
                <p className="text-indigo-200 text-sm font-semibold tracking-widest uppercase mb-3">Welcome back</p>
                <h2 className="text-5xl font-black text-white leading-tight">
                  Your style,<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200">
                    your story.
                  </span>
                </h2>
                <p className="text-white/70 text-lg mt-4 leading-relaxed">
                  Sign in to access your wishlist, track orders, and discover curated picks just for you.
                </p>
              </div>

              {/* Feature cards */}
              <div className="space-y-3">
                <FeatureCard emoji="🛍️" title="10M+ Products"       sub="Across all categories"       delay={0.2} />
                <FeatureCard emoji="🚀" title="Fast Delivery"        sub="Same-day in select cities"   delay={0.3} />
                <FeatureCard emoji="🔒" title="Secure Payments"      sub="256-bit SSL encryption"      delay={0.4} />
              </div>
            </div>

            {/* Bottom trust strip */}
            <div style={{ animation: 'slideInLeft 0.6s ease 0.5s both' }}
              className="flex items-center gap-6 pt-6 border-t border-white/20">
              {[['2M+', 'Happy Customers'], ['99%', 'Satisfaction Rate'], ['24/7', 'Support']].map(([n, l]) => (
                <div key={l}>
                  <p className="text-white font-black text-xl">{n}</p>
                  <p className="text-white/60 text-xs">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md anim-right">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200">
                <span className="text-white font-black">S</span>
              </div>
              <span className="font-black text-xl text-slate-900">Shop<span className="text-indigo-600">Easy</span></span>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100 p-8">
              <div style={{ animation: 'fadeUp 0.5s ease 0.2s both' }}>
                <h1 className="text-2xl font-black text-slate-900">Sign in to your account</h1>
                <p className="text-slate-500 text-sm mt-1">Don't have one? <Link to="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">Create account →</Link></p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
                <div style={{ animation: 'fadeUp 0.5s ease 0.25s both' }}>
                  <FloatInput
                    id="email" name="email" type="email" label="Email address"
                    value={form.email} onChange={handleChange}
                    icon={<IconEmail />} error={errors.email}
                    autoComplete="email"
                  />
                </div>

                <div style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}>
                  <FloatInput
                    id="password" name="password" type={showPw ? 'text' : 'password'} label="Password"
                    value={form.password} onChange={handleChange}
                    icon={<IconLock />} error={errors.password}
                    autoComplete="current-password"
                    rightEl={
                      <button type="button" onClick={() => setShowPw((v) => !v)}
                        className="text-slate-400 hover:text-indigo-500 transition-colors duration-150 p-0.5 rounded-lg">
                        <IconEye off={showPw} />
                      </button>
                    }
                  />
                </div>

                {/* Remember + Forgot */}
                <div style={{ animation: 'fadeUp 0.5s ease 0.35s both' }}
                  className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <div
                      onClick={() => setRememberMe((v) => !v)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 cursor-pointer flex-shrink-0
                        ${rememberMe ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}
                    >
                      {rememberMe && <span className="text-white"><IconCheck /></span>}
                    </div>
                    <span className="text-sm text-slate-600 select-none">Remember me</span>
                  </label>
                  <Link to="/forgot-password"
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-150">
                    Forgot password?
                  </Link>
                </div>

                {/* Submit */}
                <div style={{ animation: 'fadeUp 0.5s ease 0.4s both' }}>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Signing in…
                      </>
                    ) : (
                      <>Sign In <IconArrow /></>
                    )}
                  </button>
                </div>
              </form>

              {/* Demo credentials */}
              <div style={{ animation: 'fadeUp 0.5s ease 0.5s both' }}
                className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Demo credentials</p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Admin', email: 'admin@ecommerce.com', pw: 'admin123', color: 'text-purple-600' },
                    { label: 'User',  email: 'user@example.com',    pw: 'user123',  color: 'text-indigo-600' },
                  ].map(({ label, email, pw, color }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setForm({ email, password: pw })}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-150 group"
                    >
                      <span className={`text-xs font-bold ${color}`}>{label}</span>
                      <span className="text-xs text-slate-400 group-hover:text-slate-600 font-mono">{email}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
