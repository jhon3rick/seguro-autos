# 🚗 Asistente de Seguro Vehicular – Fullstack con IA + Docker

Asistente conversacional inteligente para cotizar seguros vehiculares utilizando:
- **IA (Gemini)** para entender lenguaje natural
- **Orquestador NodeJS** para interpretar la intención
- **MCP Server** para simular microservicios (reglas del negocio e información del cliente)
- **Frontend en React + Vite + MUI** con almacenamiento local de historial
- **Contenedores Docker** para entorno reproducible
- **API Context + Business Rules separadas**

## 📌 Objetivo

Simular un sistema real donde un usuario puede consultar:
- 📄 *la prima de seguro de una solicitud*
- 📧 *cotizar por correo*
- 🚘 *factor de riesgo del vehículo*
- 🧠 *respuestas en lenguaje natural usando IA*

## 🧁 Estructura del Proyecto

frontend/
backend/

## 📦 Instalación con Docker para el backend

docker-compose build
docker-compose up

## 📦 ejecución frontend

npm install
npm run dev

## 🔁 Ejemplo de conversación

POST http://localhost:4000/chat
{ "question": "Calcula la prima de la solicitud 34234" }

## 🧾 Diagrama de Arquitectura Final

                      ┌───────────────────────┐
                      │  Frontend - React     │
                      │  ChatView + Header    │
                      │  LocalStorage History │
                      └───────────┬───────────┘
                                  │
                     POST /chat (API Context)
                                  │
                     ┌────────────▼────────────┐
                     │  Orchestrator API       │
                     │  IA + Intent + Rules    │
                     │  Gemini + business logic│
                     └────────────┬────────────┘
                                  │
                       Llamadas REST (tools)
                                  │
          ┌───────────────────────▼──────────────────────┐
          │                 MCP Server                    │
          │  - get_insurance_request                      │
          │  - get_driver_profile                         │
          │  - get_car_info                               │
          │  - calculate_risk                             │
          │  - calculate_vehicle_factor                   │
          │  - calculate_insurance_premium                │
          └───────────────────────────────────────────────┘

                                Docker

