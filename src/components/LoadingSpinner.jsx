import React from 'react';
// import './LoadingSpinner.scss';

const LoadingSpinner = ({ size = 'large', variant = 'primary', className = '' }) => {
  const spinnerClassName = [
    'spinner',
    `spinner--${size}`,
    variant === 'secondary' && 'spinner--secondary',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="spinner-container">
      <div 
        className={spinnerClassName}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default LoadingSpinner;