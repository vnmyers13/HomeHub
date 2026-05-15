/**
 * Three-step setup wizard for initial family configuration
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetup } from '../api/auth';
import { useAuthStore } from '../stores/auth';

interface FormData {
  family_name: string;
  timezone: string;
  admin_display_name: string;
  admin_password: string;
  confirm_password: string;
}

export default function SetupWizard() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const setupMutation = useSetup();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<FormData>({
    family_name: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    admin_display_name: '',
    admin_password: '',
    confirm_password: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [timezoneSearch, setTimezoneSearch] = useState('');

  // Get all available timezones
  const allTimezones: string[] = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'America/Toronto',
    'America/Vancouver',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Dubai',
    'Australia/Sydney',
    'UTC',
  ];
  const filteredTimezones = timezoneSearch
    ? allTimezones.filter((tz: string) => 
        tz.toLowerCase().includes(timezoneSearch.toLowerCase())
      )
    : allTimezones;

  const validateStep1 = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.family_name.trim()) {
      newErrors.family_name = 'Family name is required';
    } else if (formData.family_name.length > 200) {
      newErrors.family_name = 'Family name must be 200 characters or less';
    }
    
    if (!formData.timezone) {
      newErrors.timezone = 'Timezone is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<FormData> = {};
    
    if (!formData.admin_display_name.trim()) {
      newErrors.admin_display_name = 'Display name is required';
    } else if (formData.admin_display_name.length > 100) {
      newErrors.admin_display_name = 'Display name must be 100 characters or less';
    }
    
    if (!formData.admin_password) {
      newErrors.admin_password = 'Password is required';
    } else if (formData.admin_password.length < 8) {
      newErrors.admin_password = 'Password must be at least 8 characters';
    }
    
    if (formData.admin_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as 1 | 2);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    try {
      const user = await setupMutation.mutateAsync({
        family_name: formData.family_name,
        timezone: formData.timezone,
        admin_display_name: formData.admin_display_name,
        admin_password: formData.admin_password,
      });
      
      setUser(user);
      navigate('/dashboard');
    } catch (error: any) {
      setErrors({
        admin_password: error.response?.data?.detail || 'Setup failed. Please try again.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to HomeHub
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Let's set up your family hub in just a few steps
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    s <= step
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      s < step ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Family Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Family Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Family Name
                </label>
                <input
                  type="text"
                  value={formData.family_name}
                  onChange={(e) =>
                    setFormData({ ...formData, family_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="The Smith Family"
                />
                {errors.family_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.family_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone
                </label>
                <input
                  type="text"
                  value={timezoneSearch}
                  onChange={(e) => setTimezoneSearch(e.target.value)}
                  placeholder="Search timezones..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-2"
                />
                <select
                  value={formData.timezone}
                  onChange={(e) =>
                    setFormData({ ...formData, timezone: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  size={8}
                >
                  {filteredTimezones.map((tz: string) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                {errors.timezone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.timezone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Admin Account */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Create Admin Account
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.admin_display_name}
                  onChange={(e) =>
                    setFormData({ ...formData, admin_display_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Admin"
                />
                {errors.admin_display_name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.admin_display_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.admin_password}
                  onChange={(e) =>
                    setFormData({ ...formData, admin_password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Minimum 8 characters"
                />
                {errors.admin_password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.admin_password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) =>
                    setFormData({ ...formData, confirm_password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Re-enter password"
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.confirm_password}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Review & Confirm
              </h2>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Family Name</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {formData.family_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Timezone</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {formData.timezone}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Admin Display Name</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {formData.admin_display_name}
                  </p>
                </div>
              </div>

              {setupMutation.isError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    {(setupMutation.error as any)?.response?.data?.detail ||
                      'Setup failed. Please try again.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={setupMutation.isPending}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {setupMutation.isPending ? 'Setting up...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
