// src/App.tsx
import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { ApiProvider } from './api/ApiContext';
import { ChatView } from './components/ChatView';

// Comentario en español: tema simple de MUI
const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ApiProvider>
        <Box sx={{ width: '100%', minHeight: '100vh' }}>
          <ChatView />
        </Box>
      </ApiProvider>
    </ThemeProvider>
  );
};

export default App;
