// src/components/ChatView.tsx
import React, { useEffect, useRef, useState } from 'react';
import { HeaderBar } from './HeaderBar';

import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Stack,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import type { ChatMessage } from '../types/chat';
import { useApi } from '../api/ApiContext';

// Comentario en español: clave para guardar el historial en localStorage
const STORAGE_KEY = 'auto-insurance-chat-history';

const loadInitialMessages = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveMessages = (messages: ChatMessage[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
};

export const ChatView: React.FC = () => {
  const { sendChatMessage, isLoading, lastError } = useApi();
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadInitialMessages()
  );
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Comentario en español: hacer scroll al final cuando cambian los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    saveMessages(messages);
  }, [messages]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const now = new Date().toISOString();

    const userMessage: ChatMessage = {
      id: `user-${now}`,
      role: 'user',
      content: trimmed,
      createdAt: now,
    };

    // Comentario en español: agregamos el mensaje del usuario al historial
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    try {
      const res = await sendChatMessage(trimmed);

      const botNow = new Date().toISOString();

      const botMessage: ChatMessage = {
        id: `assistant-${botNow}`,
        role: 'assistant',
        content: res.answer ?? 'No se recibió respuesta del servidor.',
        createdAt: botNow,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      // Comentario en español: si hay error, se muestra abajo con lastError
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    // Comentario en español: enviar con Enter (sin Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',      // 👈 header arriba, chat abajo
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1,
        }}
      >
        <HeaderBar />
      </Box>

      <Box
        sx={{
          flex: 1,                         // ocupa todo lo que queda
          display: 'flex',
          justifyContent: 'center',        // centra horizontal
          alignItems: 'center',            // centra vertical
          px: 2,
          pb: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            maxWidth: 800,
            minHeight: 500,
            display: 'flex',
            flexDirection: 'column',
            p: 2,
          }}
        >
          {/* Título */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" fontWeight="bold">
              Chat Seguro de Auto
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pregunta en lenguaje natural sobre la prima o el factor del vehículo.
            </Typography>
          </Box>

          {/* Historial de chat */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              mb: 2,
              pr: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {messages.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Aún no hay mensajes. Empieza preguntando, por ejemplo:
                &quot;Calcula la prima de la solicitud 34234&quot;.
              </Typography>
            )}

            {messages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  justifyContent:
                    msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    maxWidth: '75%',
                    px: 1.5,
                    py: 1,
                    borderRadius: 2,
                    bgcolor:
                      msg.role === 'user'
                        ? 'primary.main'
                        : 'grey.200',
                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}
                  >
                    {msg.role === 'user' ? 'Tú' : 'Asistente'}
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </Typography>
                </Box>
              </Box>
            ))}

            <div ref={messagesEndRef} />
          </Box>

          {/* Estado de carga y errores */}
          <Box sx={{ minHeight: 24, mb: 1 }}>
            {isLoading && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Pensando...
                </Typography>
              </Stack>
            )}
            {!isLoading && lastError && (
              <Typography variant="caption" color="error">
                {lastError}
              </Typography>
            )}
          </Box>

          {/* Input + botón de enviar */}
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={4}
              label="Escribe tu pregunta..."
              variant="outlined"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={isLoading || !inputValue.trim()}
              sx={{ mb: 0.5 }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Box>

    </Box>
  );
};
