import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useDocumentTitle from '../hooks/useDocumentTitle';
import toast from 'react-hot-toast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordStrength = (password) => {
  if (!password || password.length < 6) return { level: 'weak', label: 'Weak', color: 'bg-danger-500' };

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (password.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial) {
    return { level: 'strong', label: 'Strong', color: 'bg-success-500' };
  }

  if (password.length >= 6 && hasNumber && (hasUpper || hasLower)) {
    return { level: 'medium', label: 'Medium', color: 'bg-warning-500' };
  }

  return { level: 'weak', label: 'Weak', color: 'bg-danger-500' };
};

const ROLES = [
  {
    value: 'attendee',
    label: 'Attendee',
    description: 'Browse and register for events',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
  },
  {
    value: 'organizer',
    label: 'Organizer',
    description: 'Create and manage your own events',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
      </svg>
    ),
  },
];

const RegisterPage = () => {
  useDocumentTitle('Register');

  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'attendee',
    agreeTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    if (errors.role) {
      setErrors((prev) => ({ ...prev, role: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      toast.success('Account created successfully!');
      navigate('/', { replace: true });
    } catch (error) {
      const data = error.response?.data;

      if (data?.errors) {
        if (Array.isArray(data.errors)) {
          const messages = data.errors.map((e) => (typeof e === 'object' ? e.message || e.msg || JSON.stringify(e) : e));
          setApiError(messages.join(', '));
        } else if (typeof data.errors === 'object') {
          const fieldErrors = {};
          for (const [key, value] of Object.entries(data.errors)) {
            fieldErrors[key] = Array.isArray(value) ? value[0] : value;
          }
          setErrors(fieldErrors);
        }
      } else {
        setApiError(data?.message || error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-12 bg-linear-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="w-full max-w-[440px]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join us and start exploring events
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* API Error */}
            {apiError && (
              <div className="flex items-center gap-3 p-3 bg-danger-500/10 border border-danger-500/20 rounded-xl text-sm text-danger-600 dark:text-danger-500" role="alert">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{apiError}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 ${
                  errors.name
                    ? 'border-danger-500 focus:ring-danger-500/40 focus:border-danger-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-danger-500">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 ${
                  errors.email
                    ? 'border-danger-500 focus:ring-danger-500/40 focus:border-danger-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-danger-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 ${
                    errors.password
                      ? 'border-danger-500 focus:ring-danger-500/40 focus:border-danger-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: passwordStrength.level === 'weak' ? '33%' : passwordStrength.level === 'medium' ? '66%' : '100%',
                        }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.level === 'weak' ? 'text-danger-500' :
                      passwordStrength.level === 'medium' ? 'text-warning-500' :
                      'text-success-500'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-1.5 text-sm text-danger-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 ${
                    errors.confirmPassword
                      ? 'border-danger-500 focus:ring-danger-500/40 focus:border-danger-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-danger-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                I want to
              </span>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => handleRoleSelect(role.value)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                      formData.role === role.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500/30'
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className={`${
                      formData.role === role.value
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {role.icon}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${
                        formData.role === role.value
                          ? 'text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {role.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {role.description}
                      </p>
                    </div>
                    {formData.role === role.value && (
                      <div className="absolute top-2 right-2">
                        <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div>
              <div className="flex items-start">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 bg-gray-50 dark:bg-gray-900"
                />
                <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 underline">
                    Terms of Service
                  </Link>
                </label>
              </div>
              {errors.agreeTerms && (
                <p className="mt-1.5 text-sm text-danger-500">{errors.agreeTerms}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {isSubmitting && (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
