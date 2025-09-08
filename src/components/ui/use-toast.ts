// This is a placeholder implementation for the useToast hook.
// In a real shadcn/ui setup, this would be part of the Toast component.

import React from 'react';

interface ToastProps {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

// A mock toast function that just logs to the console.
const toast = (props: ToastProps) => {
  console.log(`Toast: ${props.title} - ${props.description} (${props.variant || 'default'})`);
};

export function useToast() {
  return { toast };
}
