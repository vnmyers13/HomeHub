/**
 * Login page with user selection and PIN/password entry
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicUsers, useLogin, usePinLogin } from '../api/auth';
import { useAuthStore } from '../stores/auth';
import type { PublicUser } from '../api/auth';

type LoginMode = 'select' | 'pin' | 'password';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { data: users, isLoading } = usePublicUsers();
  const loginMutation = useLogin();
  const pinLoginMutation = usePinLogin();

  const [mode, setMode] = useState<LoginMode>('select');
  const [selectedUser, setSelectedUser] = useState<PublicUser | null>(null);
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const handleUserSelect = (user: PublicUser) => {
    setSelectedUser(user);
    setError('');
    setPin('');
    setPassword('');
    
    // Determine if user likely has PIN (child/teen roles typically use PIN)
    // For now, show PIN pad by default, with option to switch to password
    setMode('pin');
  };

  const handlePinDigit = (digit: string) => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      return;
    }

    const newPin = pin + digit;
    setPin(newPin);

    // Auto-submit when PIN is 4-8 digits
    if (newPin.length >= 4 && newPin.length <= 8) {
      handlePinSubmit(newPin);
    }
  };

  const handlePinBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handlePinSubmit = async (pinValue: string) => {
    if (!selectedUser) return;

    try {
      const user = await pinLoginMutation.mutateAsync({
        user_id: selectedUser.id,
        pin: pinValue,
      });
      
      setUser(user);
      navigate('/dashboard');
    } catch (err: any) {
      setPin('');
      
      if (err.response?.status === 429) {
        // Rate limited
        setAttemptCount(5);
        setLockoutUntil(Date.now() + 60000); // 60 seconds
        setError('Too many attempts. Please wait 60 seconds.');
        
        // Clear lockout after 60 seconds
        setTimeout(() => {
          setLockoutUntil(null);
          setAttemptCount(0);
          setError('');
        }, 60000);
      } else {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        setError(`Invalid PIN. ${5 - newAttemptCount} attempts remaining.`);
        
        if (newAttemptCount >= 5) {
          setLockoutUntil(Date.now() + 60000);
          setError('Too many attempts. Please wait 60 seconds.');
          setTimeout(() => {
            setLockoutUntil(null);
            setAttemptCount(0);
            setError('');
          }, 60000);
        }
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !password) return;

    try {
      const user = await loginMutation.mutateAsync({
        display_name: selectedUser.display_name,
        password,
      });
      
      setUser(user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid credentials');
      setPassword('');
    }
  };

  const handleBack = () => {
    setMode('select');
    setSelectedUser(null);
    setPin('');
    setPassword('');
    setError('');
    setAttemptCount(0);
    setLockoutUntil(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to HomeHub
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {mode === 'select' ? 'Select your profile to continue' : `Welcome, ${selectedUser?.display_name}`}
            </p>
          </div>

          {/* User Selection Grid */}
          {mode === 'select' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {users?.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="flex flex-col items-center p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors"
                  style={{ borderColor: mode === 'select' ? undefined : user.color_hex }}
                >
                  {/* Avatar */}
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-3"
                    style={{ backgroundColor: user.color_hex + '20' }}
                  >
                    {user.avatar_type === 'emoji' ? (
                      <span>{user.avatar_value}</span>
                    ) : (
                      <img
                        src={user.avatar_value}
                        alt={user.display_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Name */}
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {user.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* PIN Pad */}
          {mode === 'pin' && selectedUser && (
            <div className="max-w-md mx-auto">
              {/* PIN Display */}
              <div className="mb-8">
                <div className="flex justify-center gap-2 mb-4">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < pin.length
                          ? 'bg-indigo-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-center text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <button
                    key={digit}
                    onClick={() => handlePinDigit(digit.toString())}
                    disabled={pin.length >= 8 || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                    className="aspect-square text-2xl font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {digit}
                  </button>
                ))}
                
                {/* Empty space */}
                <div />
                
                {/* Zero */}
                <button
                  onClick={() => handlePinDigit('0')}
                  disabled={pin.length >= 8 || (lockoutUntil !== null && Date.now() < lockoutUntil)}
                  className="aspect-square text-2xl font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  0
                </button>
                
                {/* Backspace */}
                <button
                  onClick={handlePinBackspace}
                  disabled={pin.length === 0}
                  className="aspect-square text-2xl font-semibold bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ⌫
                </button>
              </div>

              {/* Switch to Password */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setMode('password')}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Use password instead
                </button>
                <button
                  onClick={handleBack}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                  Back to user selection
                </button>
              </div>
            </div>
          )}

          {/* Password Form */}
          {mode === 'password' && selectedUser && (
            <div className="max-w-md mx-auto">
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your password"
                    autoFocus
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!password || loginMutation.isPending}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginMutation.isPending ? 'Logging in...' : 'Log In'}
                </button>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('pin')}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Use PIN instead
                  </button>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                  >
                    Back to user selection
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
