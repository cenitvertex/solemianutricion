# Arquitectura de Solemia NutriPal

Este documento detalla la estructura técnica y las decisiones de diseño fundamentales que sostienen la plataforma Solemia NutriPal.

## 🗼 Visión General de la Infraestructura

Solemia NutriPal utiliza una arquitectura moderna de Aplicación de Una Sola Página (SPA) con un backend como servicio (BaaS).

- **Frontend:** React 19 (SPA) servido por Vite.
- **Backend:** Supabase gestiona la autenticación, la base de datos PostgreSQL y la sincronización en tiempo real.
- **Hosting:** Vercel para el despliegue del frontend y funciones serverless de API.

## 🗄️ Modelos de Datos (Supabase)

### Tenencia (Tenancy)
El sistema es multi-inquilino (multi-tenant) basado en el esquema de Supabase:
- `tenants`: Información de la clínica/nutricionista (suscripción, límites, configuración).
- `patients`: Registros de pacientes asociados a un `tenant_id`. Se aplica Seguridad de Nivel de Fila (RLS) para asegurar el aislamiento de datos.

### Registros de IA
- `recommendation_logs`: Almacena el historial de consultas realizadas a la IA, incluyendo la intención del usuario y la respuesta generada. Estos logs alimentan el "Análisis de Hoy" en el Dashboard.

## 🧠 Integración de IA

La plataforma utiliza un motor de procesamiento de lenguaje natural (vía n8n/OpenAI) para:
1.  **Análisis de Archivos:** Extracción de datos de planes nutricionales subidos (PDF/Imágenes).
2.  **Generación de Recomendaciones:** Basado en el perfil del paciente y objetivos clínicos.
3.  **Monitoreo de Alergias:** Detección automática de riesgos en los planes.

## 🔐 Seguridad y Auth

1.  **Autenticación:** Gestionada por Supabase Auth (Email/Password).
2.  **Aislamiento:** PostgreSQL RLS asegura que un nutricionista NUNCA pueda ver pacientes de otro.
3.  **Pagos:** Integración segura con Mercado Pago para la gestión de suscripciones mediante webhooks en `/api/mp-webhook.js`.

## 🎨 Sistema de Diseño (Solemia Beauty)

La consistencia visual se mantiene a través de variables CSS globales en `index.css`.
- **Glassmorphism:** Uso intensivo de `backdrop-filter` y opacidades variables para un look etéreo.
- **Silk Easing:** Animaciones fluidas y máscaras de degradado suaves para transiciones premium.

## 🔌 Integraciones Externas

- **WhatsApp API (Twilio):** Para el envío de recordatorios y seguimiento automatizado.
- **Mercado Pago:** Procesamiento de pagos local en México.
- **n8n:** Orquestador de flujos de trabajo para tareas asíncronas de IA.

---

© 2026 Solemia Nutrición.
