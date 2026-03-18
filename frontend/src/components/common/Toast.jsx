import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-medium pointer-events-auto transition-all
              ${t.type === 'success' ? 'bg-green-600 text-white' : ''}
              ${t.type === 'error'   ? 'bg-red-600 text-white'   : ''}
              ${t.type === 'info'    ? 'bg-gray-800 text-white'  : ''}
              ${t.type === 'warning' ? 'bg-yellow-500 text-white': ''}
            `}
          >
            <span>
              {t.type === 'success' && '✅ '}
              {t.type === 'error'   && '❌ '}
              {t.type === 'warning' && '⚠️ '}
              {t.message}
            </span>
            <button
              onClick={() => remove(t.id)}
              className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast trebuie folosit în ToastProvider');
  return ctx.toast;
};
