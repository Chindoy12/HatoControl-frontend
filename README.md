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
├── componentes/                 Formulario (8 tipos), Encabezado (menú común) y
│                                piezas.tsx (apoyo visual: íconos, logo, mensajes, fechas)
├── servicios/ClienteApi.ts      única puerta hacia el backend
├── tipos/dto.ts                 tipos de los DTOs del backend
└── estilos/tema.css             colores de los mockups
```

`vercel.json` reenvía `/api/*` al backend; su dirección real se configura en la Fase 12. En desarrollo, `vite.config.ts` reenvía `/api` a `http://localhost:8080`.

## Pantallas

| Ruta | Pantallas | HU |
| --- | --- | --- |
| `/` · `/ingresar` · `/recuperar` · `/recuperar/:token` · `/registro` | P01–P04 | HU_020, HU_021, HU_024 |
| `/inicio` | P05, P22 | HU_022 |
| `/animales` · `/animales/nuevo` · `/animales/:arete` · `/animales/:arete/editar` | P06–P08, P15–P18 | HU_001–HU_005, HU_007, HU_010, HU_011, HU_013, HU_015, HU_017, HU_019 |
| `/sanidad` | P09, P19 | HU_006, HU_008, HU_009 |
| `/registros` · `/partos/nuevo` | P10, P11, P20, P21 | HU_010, HU_016, HU_018 |
| `/dashboard` · `/reportes` · `/administradores` | P12–P14, P23, P24 | HU_012, HU_014, HU_023 |

Cada pantalla se adapta al celular con un menú inferior (RNF05). Las reglas se revisan en el formulario para avisar a tiempo y se vuelven a revisar en el backend.

## Ejecutar en local

Requiere el backend en `http://localhost:8080`.

```bash
npm install
npm run dev
```
