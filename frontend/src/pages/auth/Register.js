import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { EyeIcon, EyeSlashIcon, UserIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    adminKey: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, isAuthenticated, error, role } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && role) {
      // Role-based redirect
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    // Calculate password strength
    const password = formData.password;
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 1;
    if (password.match(/\d/)) strength += 1;
    if (password.match(/[^\w\s]/)) strength += 1;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role,
      adminKey: role === 'user' ? '' : formData.adminKey
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.role === 'admin' && !formData.adminKey) {
      toast.error('Admin key is required for admin registration');
      return;
    }

    dispatch(registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      adminKey: formData.adminKey
    }));
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-red-400';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex">
      {/* Left Side - Image/Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Join Us Today</h1>
            <p className="text-xl opacity-90 mb-8">Create your account and start your shopping experience</p>
            <div className="w-24 h-1 bg-white/30 mx-auto rounded-full"></div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Account Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('user')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.role === 'user'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <UserIcon className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">User</div>
                    <div className="text-xs opacity-75">Regular customer</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      formData.role === 'admin'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <ShieldCheckIcon className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Admin</div>
                    <div className="text-xs opacity-75">Store manager</div>
                  </button>
                </div>
              </div>

              {/* Admin Key Field */}
              {formData.role === 'admin' && (
                <div className="relative animate-fadeIn">
                  <input
                    id="adminKey"
                    name="adminKey"
                    type="password"
                    required
                    className="peer w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors placeholder-transparent"
                    placeholder="Admin Key"
                    value={formData.adminKey}
                    onChange={handleChange}
                  />
                  <label
                    htmlFor="adminKey"
                    className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-purple-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-purple-600"
                  >
                    Admin Key
                  </label>
                  <p className="text-xs text-purple-600 mt-1">Contact admin for the key</p>
                </div>
              )}

              {/* Name Field */}
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="peer w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors placeholder-transparent"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                />
                <label
                  htmlFor="name"
                  className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                >
                  Full Name
                </label>
              </div>

              {/* Email Field */}
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="peer w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors placeholder-transparent"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />
                <label
                  htmlFor="email"
                  className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                >
                  Email Address
                </label>
              </div>

              {/* Password Field */}
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="peer w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors placeholder-transparent"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <label
                  htmlFor="password"
                  className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                >
                  Password
                </label>
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="peer w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors placeholder-transparent"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600"
                >
                  Confirm Password
                </label>
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] ${
                  formData.role === 'admin'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  `Create ${formData.role === 'admin' ? 'Admin' : 'User'} Account`
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;