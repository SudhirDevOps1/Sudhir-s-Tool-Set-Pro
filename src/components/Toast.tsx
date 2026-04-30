import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { Toast as ToastType } from '../types';

// ─── Single Toast ─────────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Animate in
    const inTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss
    const outTimer = setTimeout(
      () => {
        setVisible(false);
        setTimeout(() => onDismiss(toast.id), 300);
      },
      toast.duration ?? 4000
    );
    return () => {
      clearTimeout(inTimer);
      clearTimeout(outTimer);
    };
  }, [toast, onDismiss]);

  const configs = {
    success: {
      icon: <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />,
      bg: 'bg-white dark:bg-gray-900 border-emerald-200 dark:border-emerald-800',
      bar: 'bg-emerald-500',
    },
    error: {
      icon: <AlertCircle className="w-4.5 h-4.5 text-red-500" />,
      bg: 'bg-white dark:bg-gray-900 border-red-200 dark:border-red-800',
      bar: 'bg-red-500',
    },
    info: {
      icon: <Info className="w-4.5 h-4.5 text-blue-500" />,
      bg: 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800',
      bar: 'bg-blue-500',
    },
    warning: {
      icon: <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />,
      bg: 'bg-white dark:bg-gray-900 border-amber-200 dark:border-amber-800',
      bar: 'bg-amber-500',
    },
  };

  const cfg = configs[toast.type];

  return (
    <div
      className={`relative flex items-start gap-3 p-4 rounded-xl border shadow-xl overflow-hidden transition-all duration-300 max-w-sm w-full ${cfg.bg} ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}
    >
      <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>
      <p className="flex-1 text-sm text-gray-700 dark:text-gray-200 font-medium leading-snug">
        {toast.message}
      </p>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar} animate-[toast-shrink_4s_linear_forwards]`}
        style={{ animationDuration: `${toast.duration ?? 4000}ms` }}
      />
    </div>
  );
};

// ─── Toast Container ──────────────────────────────────────────────────────────

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

// ─── useToast hook ────────────────────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType['type'] = 'info', duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, dismissToast };
}
