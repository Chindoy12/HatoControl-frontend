# HatoControl · Frontend

Aplicación web de HatoControl hecha con React 19, TypeScript y Vite. Se publica en Vercel y habla con el backend solo por `/api` (RNF11).

## Estructura

Cada archivo corresponde a una clase de la vista de desarrollo (Fase 3) o a las autorizadas en la Fase 7.

```
src/
├── main.tsx, App.tsx            arranque y rutas (direcciones de los mockups P01–P25)
├── paginas/                     PaginaInicio, PaginaIngreso, PaginaPanel, PaginaAnimales,
│                                PaginaAnimal, PaginaSanidad, PaginaDashboard,
│                                PaginaReportes, PaginaAdministradores
├── componentes/                 Formulario (8 tipos) y Encabezado (menú común)
├── servicios/ClienteApi.ts      única puerta hacia el backend
├── tipos/dto.ts                 tipos de los DTOs del backend
└── estilos/tema.css             colores de los mockups
```

`vercel.json` reenvía `/api/*` al backend; su dirección real se configura en la Fase 12. En desarrollo, `vite.config.ts` reenvía `/api` a `http://localhost:8080`.

## Ejecutar en local

```bash
npm install
npm run dev
```
