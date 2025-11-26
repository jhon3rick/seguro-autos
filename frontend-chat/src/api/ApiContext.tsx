// src/api/ApiContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { ChatResponse } from '../types/chat';

interface ApiContextValue {
  sendChatMessage: (question: string) => Promise<ChatResponse>;
  isLoading: boolean;
  lastError: string | null;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

// Comentario en español: hook para consumir el contexto de la API
export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return ctx;
}

interface ApiProviderProps {
  children: ReactNode;
}

// Comentario en español: proveedor que maneja loading y errores de la API
export const ApiProvider: React.FC<ApiProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const sendChatMessage = async (question: string): Promise<ChatResponse> => {
    setIsLoading(true);
    setLastError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as ChatResponse;
      return data;
    } catch (err: any) {
      console.error('[ApiContext] Error calling /api/chat', err);
      setLastError(err.message ?? 'Unexpected error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: ApiContextValue = {
    sendChatMessage,
    isLoading,
    lastError,
  };

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
