import { NextRequest } from 'next/server';
import { Readable } from 'stream';

export function createRequest(method: string, url: string, body?: any): NextRequest {
  const requestUrl = new URL(url, 'http://localhost');

  const request = new NextRequest(requestUrl, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : null,
  });

  // Override json() method if body is provided, as the native one might not work in test env
  if (body) {
    Object.defineProperty(request, 'json', {
      value: async () => Promise.resolve(body),
      writable: true,
    });
  }

  return request;
}

import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  const queryClient = createTestQueryClient();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return render(ui, { wrapper, ...options });
}
