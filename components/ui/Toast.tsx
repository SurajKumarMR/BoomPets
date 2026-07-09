'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const types = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-orange-500 text-white',
    info: 'bg-blue-600 text-white',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={clsx(
        'fixed bottom-24 left-4 right-4 mx-auto max-w-md z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-up',
        types[type]
      )}
      role="alert"
    >
      <span className="text-2xl">{icons[type]}</span>
      <span className="flex-1 font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="text-xl opacity-80 hover:opacity-100"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

// Toast Container for managing multiple toasts
interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export function ToastContainer({ toasts }: { toasts: ToastMessage[] }) {
  return (
    <div className="fixed bottom-24 left-0 right-0 z-50 pointer-events-none">
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ marginBottom: `${index * 70}px` }} className="pointer-events-auto">
          <Toast message={toast.message} type={toast.type} />
        </div>
      ))}
    </div>
  );
}
