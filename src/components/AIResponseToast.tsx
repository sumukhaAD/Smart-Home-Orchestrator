import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface AIResponseToastProps {
  message: string;
  isError?: boolean;
  onClose: () => void;
}

export function AIResponseToast({ message, isError, onClose }: AIResponseToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
      >
        <div
          className={`p-4 rounded-xl border shadow-2xl backdrop-blur-lg ${
            isError
              ? 'bg-red-900/90 border-red-700'
              : 'bg-green-900/90 border-green-700'
          }`}
        >
          <div className="flex items-start gap-3">
            {isError ? (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            )}
            <p
              className={`flex-1 text-sm ${
                isError ? 'text-red-100' : 'text-green-100'
              }`}
            >
              {message}
            </p>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-white/80" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
