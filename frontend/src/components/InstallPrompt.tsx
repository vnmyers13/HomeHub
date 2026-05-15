/**
 * PWA install prompt component
 */

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const iosInstallShown = localStorage.getItem('ios-install-shown');

    if (isIOS && !isStandalone && !iosInstallShown) {
      setShowIOSInstructions(true);
    }

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  const handleIOSDismiss = () => {
    setShowIOSInstructions(false);
    localStorage.setItem('ios-install-shown', 'true');
  };

  if (showIOSInstructions) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Install HomeHub
            </h3>
            <button
              onClick={handleIOSDismiss}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Install this app on your iPhone: tap{' '}
            <span className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
              </svg>
            </span>{' '}
            and then <strong>Add to Home Screen</strong>.
          </p>
        </div>
      </div>
    );
  }

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-50 shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Install HomeHub
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Install this app for quick access and offline use
          </p>
        </div>
        <div className="flex gap-3 ml-4">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            Not now
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
