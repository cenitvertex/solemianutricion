# Solemia NutriPal

### Acompañamiento Nutricional de Precisión Clínica

Solemia NutriPal es una plataforma avanzada diseñada para nutricionistas que buscan elevar el estándar de cuidado de sus pacientes mediante inteligencia artificial y un seguimiento clínico riguroso.

---

## 💎 Propuesta de Valor

- **Precisión Clínica:** Extracción y análisis inteligente de expedientes y planes nutricionales.
- **Experiencia Premium:** Interfaz de usuario minimalista y de alto rendimiento ("Minimalismo de Precisión").
- **Seguimiento Automatizado:** Integración fluida con WhatsApp para mantener una conexión constante con el paciente.
- **Protocolos de Venta:** Basado en el protocolo de ventas de Solemia para asegurar la conversión y retención.

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + Vite
- **Backend/Base de Datos:** Supabase (PostgreSQL, Auth, Realtime)
- **Pagos:** Mercado Pago SDK
- **Infraestructura:** Vercel
- **Automatización:** n8n + Twilio (WhatsApp API)

## 🚀 Inicio Rápido

1. **Clonar el repositorio**
2. **Instalar dependencias:** `npm install`
3. **Configurar variables de entorno:** Crear un archivo `.env` basado en `.env.example`.
4. **Ejecutar en desarrollo:** `npm run dev`

## 📁 Estructura del Proyecto

Para mantener el orden y la escalabilidad, el proyecto se organiza de la siguiente manera:

- **`api/`**: Funciones serverless para integraciones (Mercado Pago).
- **`src/components/modals`**: Modales especializados de la aplicación.
- **`src/components/ui`**: Componentes visuales y animaciones base.
- **`scripts/`**: Herramientas de mantenimiento y verificación de DB.
- **`data/`**: Sets de datos para pruebas y demos.
- **`docs/`**: Documentación de negocio y protocolos.

Para más detalles técnicos, consulta [CONTRIBUTING.md](./CONTRIBUTING.md) y [ARCHITECTURE.md](./ARCHITECTURE.md).

## 🎨 Guía de Estilo

El proyecto sigue el sistema de diseño **Solemia Beauty**:
- **Colores:** #4d0c30 (Plum), #e11d48 (Pink), #1a1a1a (Charcoal).
- **Tipografía:** "Plus Jakarta Sans" para encabezados, "Inter" para el cuerpo.
- **UI:** Glassmorphism con radios de borde de 40px y desenfoques profundos.

---

© 2026 Solemia Nutrición. Todos los derechos reservados.
