
import React from 'react';

export const UploadIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
);

export const MagicWandIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.25278V6.25278C12 6.11305 12.1131 6 12.2528 6V6C12.3925 6 12.5056 6.11305 12.5056 6.25278V6.25278C12.5056 6.39252 12.3925 6.50556 12.2528 6.50556V6.50556C12.1131 6.50556 12 6.39252 12 6.25278ZM8.25278 8.25278V8.25278C8.25278 8.11305 8.36583 8 8.50556 8V8C8.64529 8 8.75833 8.11305 8.75833 8.25278V8.25278C8.75833 8.39252 8.64529 8.50556 8.50556 8.50556V8.50556C8.36583 8.50556 8.25278 8.39252 8.25278 8.25278ZM16.2528 8.25278V8.25278C16.2528 8.11305 16.3658 8 16.5056 8V8C16.6453 8 16.7583 8.11305 16.7583 8.25278V8.25278C16.7583 8.39252 16.6453 8.50556 16.5056 8.50556V8.50556C16.3658 8.50556 16.2528 8.39252 16.2528 8.25278Z"
      fill="currentColor"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.1225L8.625 15.75L11.25 21.375L13.875 15.75L19.5 13.125L13.875 10.5L11.25 4.875L8.625 10.5L3 13.1225Z"
    />
  </svg>
);

export const ClearIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
        />
    </svg>
);
