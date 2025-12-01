
import React from 'react';

export const SparklesIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 01.753.336l1.5 2a1 1 0 01.247.664v1.5a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1.5a1 1 0 01.247-.664l1.5-2A1 1 0 0110 3zm-2.25 7.5a1 1 0 01.336-.753l2-1.5a1 1 0 011.328 0l2 1.5a1 1 0 01.336.753v3a1 1 0 01-1 1h-4.5a1 1 0 01-1-1v-3zM10 18a1 1 0 01-1-1v-1.5a1 1 0 011-1 1 1 0 011 1V17a1 1 0 01-1 1zm-7-6a1 1 0 000 2h1.5a1 1 0 000-2H3zm12.5 0a1 1 0 000 2H17a1 1 0 000-2h-1.5z" clipRule="evenodd" />
  </svg>
);
