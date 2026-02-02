// src/utils/toast.js
import toast from 'react-hot-toast';

// Base toast config for consistency
const toastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    padding: '16px 24px',
    borderRadius: '12px',
    background: 'rgba(30, 30, 46, 0.95)', // glass-like dark bg
    color: '#e0e0e0',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  success: {
    iconTheme: {
      primary: '#10b981',
      secondary: '#ffffff',
    },
    style: {
      border: '1px solid rgba(16, 185, 129, 0.3)',
    },
  },
  error: {
    iconTheme: {
      primary: '#ef4444',
      secondary: '#ffffff',
    },
    style: {
      border: '1px solid rgba(239, 68, 68, 0.3)',
    },
  },
  loading: {
    style: {
      background: 'rgba(30, 30, 46, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
  },
};

// Custom toast helpers
export const successToast = (message) => {
  return toast.success(message, {
    ...toastOptions,
    ...toastOptions.success,
  });
};

export const errorToast = (message) => {
  return toast.error(message, {
    ...toastOptions,
    ...toastOptions.error,
  });
};

export const loadingToast = (message = 'Loading...') => {
  return toast.loading(message, toastOptions.loading);
};

export const promiseToast = (promise, messages) => {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Processing...',
      success: messages.success || 'Success!',
      error: messages.error || 'Something went wrong',
    },
    {
      style: toastOptions.style,
      success: { ...toastOptions.success },
      error: { ...toastOptions.error },
    }
  );
};

// Dismiss all toasts (useful on logout/route change)
export const dismissAllToasts = () => {
  toast.dismiss();
};

export default toast;