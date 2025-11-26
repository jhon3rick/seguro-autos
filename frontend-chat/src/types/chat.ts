// src/types/chat.ts

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatResponse {
  answer: string;
  intent: unknown;
}
