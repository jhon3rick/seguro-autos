// src/components/HeaderBar.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

// Comentario en español: Vite sirve los SVG del directorio public en la raíz (/archivo.svg)
const shieldSrc = '/insurance-shield.svg';
const carSrc = '/insurance-car.svg';

export const HeaderBar: React.FC = () => {
  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        bgcolor: '#2e3c6a',
        color: '#fff',
        px: 3,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 2,
        borderRadius: 2,
        mb: 2,
      }}
    >
      {/* Escudo izquierdo */}
      <Box
        component="img"
        src={shieldSrc}
        alt="Icono de seguro"
        sx={{
          height: 60,
          width: 'auto',
        }}
      />

      {/* Texto central */}
      <Box sx={{ textAlign: 'center', px: 2, flex: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          Asistente de Seguro Vehicular
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          Consulta primas, factores de riesgo y elegibilidad
        </Typography>
      </Box>

      {/* Auto derecho */}
      <Box
        component="img"
        src={carSrc}
        alt="Vehículo asegurado"
        sx={{
          height: 60,
          width: 'auto',
        }}
      />
    </Box>
  );
};
