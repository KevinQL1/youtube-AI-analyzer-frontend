# YouTube AI Growth Analyzer - Frontend

Interfaz web personal para conversar con el agente de crecimiento de YouTube. El frontend esta enfocado en el chat: el backend aporta los datos reales del canal y la IA los convierte en analisis y acciones concretas.

## Funciones actuales

- Chat con respuestas Markdown.
- Preguntas sugeridas sobre retencion, videos, playlists y patrones de crecimiento.
- Indicador de suscriptores actuales.
- Resumen de vistas, videos y ultima actualizacion del canal.
- Boton para sincronizar el canal con YouTube antes de analizarlo.
- Aviso cuando una sincronizacion queda parcial por un error de Analytics.
- Copiado de respuestas y consulta SQL utilizada.
- Interfaz responsive para escritorio y movil.
- Mensajes de error para problemas de API o conexion.

## Backend conectado

Por defecto usa:

```text
https://youtube-ai-analyzer-backend.onrender.com/api
```

El backend esta en el repositorio [youtube-AI-analyzer-backend](https://github.com/KevinQL1/youtube-AI-analyzer-backend) y se encarga de sincronizar YouTube, consultar PostgreSQL, conservar la memoria del agente y generar recomendaciones.

## Configuracion local

Requisitos: Node.js 20 o superior.

```bash
npm install
npm run dev
```

Para cambiar la URL del backend crea `.env` en la raiz del frontend:

```env
VITE_API_BASE_URL=https://youtube-ai-analyzer-backend.onrender.com/api
```

La variable debe configurarse tambien en Vercel en **Settings > Environment Variables**. Despues de modificarla, crea un nuevo deployment.

## Scripts

```bash
npm run dev       # servidor local con Vite
npm run build     # compilacion de produccion
npm run lint      # validacion ESLint
npm run preview   # vista previa de la compilacion
```

## Rutas utilizadas

- `POST /api/ai/ask`: envia una pregunta al agente.
- `POST /api/sync`: actualiza los datos del canal.
- `GET /api/channel`: obtiene el resumen actual del canal.

El chat muestra la respuesta de `/api/ai/ask` y el boton **Actualizar** usa `/api/sync`. La sincronizacion se ejecuta en el backend y puede devolver estado parcial si alguna consulta de Analytics no se completa.

## Estructura principal

```text
src/
├── App.jsx       Chat, estado del canal y sincronizacion
├── App.css       Estilos heredados del template
├── index.css     Tema, layout y estilos responsive
└── main.jsx      Punto de entrada de React
```

## Despliegue en Vercel

1. Importa este repositorio en Vercel.
2. Usa el comando de build `npm run build`.
3. Usa `dist` como directorio de salida.
4. Configura `VITE_API_BASE_URL` con la URL de Render.
5. Despliega y prueba el boton de sincronizacion.

El backend debe permitir en CORS el dominio final de Vercel.

## Uso recomendado

YouTube Studio sigue siendo el lugar para publicar videos y consultar todas las metricas oficiales. Esta interfaz se usa para preguntarle al agente por que ocurren los resultados, que contenido crear y que acciones priorizar.
