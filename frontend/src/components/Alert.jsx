import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircleIcon, CheckCircleIcon, AlertTriangleIcon, InfoIcon } from './Icons';

const alertIcons = {
  error: XCircleIcon,
  success: CheckCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
};

export function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;
  const Icon = alertIcons[type] || InfoIcon;

  return (
    <AnimatePresence>
      <motion.div
        className={`alert alert-${type}`}
        initial={{ opacity: 0, y: -12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="alert-message" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Icon size={16} />
          {message}
        </span>
        {onClose && (
          <button className="alert-close" onClick={onClose} aria-label="Dismiss alert">
            ×
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
