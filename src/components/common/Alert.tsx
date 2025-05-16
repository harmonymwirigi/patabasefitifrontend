// In src/components/common/Alert.tsx
import React from 'react';

interface AlertProps {
  type: 'success' | 'info' | 'warning' | 'error';
  message: string | any; // Allow any for error objects
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  // Convert any non-string message to string to avoid React errors
  const formattedMessage = typeof message === 'string' 
    ? message 
    : JSON.stringify(message);
  
  // Default styles
  const baseStyles = 'p-4 rounded-md';
  
  // Type-specific styles
  const typeStyles = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
  };
  
  return (
    <div className={`${baseStyles} ${typeStyles[type]} ${className}`}>
      <p>{formattedMessage}</p>
    </div>
  );
};

export default Alert;