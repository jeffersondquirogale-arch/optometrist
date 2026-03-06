# Sistema de Gestión Clínica Óptica

> **Fase 3C — Mejoras de usabilidad operativa**  
> La Fase 3C mejora la usabilidad diaria del sistema: búsqueda y filtros en el listado de pacientes, nueva página de consultas con filtro por paciente, filtros de estado y fecha en citas, acciones rápidas mejoradas en tablas, feedback de éxito/error en formularios con mensajes inline, y estados vacíos más informativos.
>
> La Fase 3B refina el formulario de consulta multisección con navegación lateral sticky y diseño simétrico OD/OI, y actualiza la ficha de impresión A4 para que se parezca más a un formulario clínico real, con todas las secciones oftalmológicas y tipografía y estructura propias de un documento médico.
>
> La Fase 2 convirtió el sistema en una herramienta clínicamente útil: consultas con múltiples secciones oftalmológicas, historial por paciente, evolución longitudinal de la fórmula y agudeza visual, y una ficha de impresión dinámica en A4.  
> La Fase 1 estableció el bootstrap inicial.

---

## Descripción del proyecto

Sistema web para la gestión integral de una clínica óptica, que permite registrar pacientes, gestionar citas, crear consultas oftalmológicas completas y generar fichas de consulta imprimibles en formato A4.

---

## Stack tecnológico

### Backend
| Tecnología | Uso |
|---|---|
| Node.js | Runtime de JavaScript |
| Express | Framework HTTP |
| TypeScript | Tipado estático |
| Prisma | ORM para base de datos |
| PostgreSQL | Base de datos relacional |
| Zod | Validación de esquemas |

### Frontend
| Tecnología | Uso |
|---|---|
| React 18 | Librería de UI |
| TypeScript | Tipado estático |
| Vite | Bundler y servidor de desarrollo |
| React Router v6 | Enrutamiento del cliente |
| React Query (TanStack) | Gestión de estado del servidor |
| Axios | Cliente HTTP |

---

## Estructura del repositorio

```
optometrist/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Esquema de la base de datos
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts             # Validación de variables de entorno
│   │   │   └── prisma.ts          # Cliente Prisma singleton
│   │   ├── middlewares/
│   │   │   ├── error.middleware.ts
│   │   │   └── not-found.middleware.ts
│   │   ├── modules/
│   │   │   ├── patients/          # CRUD de pacientes
│   │   │   ├── doctors/           # CRUD de perfiles de doctores
│   │   │   ├── consultations/     # CRUD + historial + evolución
│   │   │   ├── appointments/      # CRUD de citas
│   │   │   ├── charts/            # Evolución clínica (series longitudinales)
│   │   │   └── print/             # Endpoint de impresión dinámica
│   │   ├── app.ts                 # Configuración de Express
│   │   └── server.ts              # Punto de entrada del servidor
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── layouts/
│   │   │   └── AppLayout.tsx      # Layout principal con navegación
│   │   ├── modules/
│   │   │   ├── patients/          # Listado, detalle, historial, evolución
│   │   │   ├── consultations/     # Nueva/editar consulta, detalle
│   │   │   ├── appointments/      # Listado y gestión de citas
│   │   │   └── print-template/    # Ficha de consulta imprimible (A4)
│   │   ├── router/
│   │   │   └── index.tsx          # Definición de rutas
│   │   ├── services/
│   │   │   ├── api.ts             # Cliente API (Axios + tipos TS)
│   │   │   └── queryClient.ts     # Configuración de React Query
│   │   ├── styles/
│   │   │   ├── global.css         # Estilos globales
│   │   │   └── print.css          # Estilos de impresión A4
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── README.md
```

---

## Configuración e instalación

### Requisitos previos
- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm ≥ 9

### Backend

```bash
# Acceder al directorio del backend
cd backend

# Instalar dependencias
npm install

# Crear el archivo de entorno
cp .env.example .env
# Editar .env con los datos de conexión a PostgreSQL

# Generar el cliente Prisma
npm run prisma:generate

# Ejecutar las migraciones
npm run prisma:migrate

# Iniciar en modo desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

#### Endpoints disponibles

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/patients` | Listado de pacientes (soporta `?q=` para búsqueda por nombre/documento/teléfono) |
| GET | `/api/patients/:id` | Detalle de paciente |
| POST | `/api/patients` | Crear paciente |
| PATCH | `/api/patients/:id` | Actualizar paciente |
| GET | `/api/doctors` | Listado de doctores |
| POST | `/api/doctors` | Crear perfil de doctor |
| GET | `/api/consultations` | Listado de consultas (soporta `?patientId=` para filtrar por paciente) |
| GET | `/api/consultations/:id` | Detalle de consulta |
| POST | `/api/consultations` | Crear consulta (con datos clínicos anidados) |
| PUT | `/api/consultations/:id` | Actualizar consulta |
| GET | `/api/consultations/patient/:patientId/history` | Historial de consultas del paciente |
| GET | `/api/consultations/patient/:patientId/evolution` | Serie evolutiva (fórmula + AV) |
| GET | `/api/charts/patients/:patientId/evolution` | Evolución clínica (series longitudinales) |
| GET | `/api/appointments` | Listado de citas (soporta `?status=`, `?dateFrom=`, `?dateTo=`) |
| POST | `/api/appointments` | Crear cita |
| PATCH | `/api/appointments/:id` | Actualizar cita |
| GET | `/api/print/consultations/:id` | Datos de consulta para impresión dinámica |

### Frontend

```bash
# Acceder al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

#### Rutas del frontend

| Ruta | Descripción |
|---|---|
| `/` | Listado de pacientes (con búsqueda por nombre/documento/teléfono) |
| `/patients/new` | Crear nuevo paciente |
| `/patients/:id` | Detalle del paciente |
| `/patients/:id/history` | Historial de consultas del paciente |
| `/patients/:id/evolution` | Evolución clínica longitudinal |
| `/consultations` | Listado de consultas (con filtro por paciente y búsqueda) |
| `/consultations/new` | Nueva consulta (formulario multisección) |
| `/consultations/:id` | Detalle de consulta |
| `/consultations/:id/edit` | Editar consulta |
| `/appointments` | Listado y gestión de citas (con filtros de estado y fecha) |
| `/print/consultations/:id` | Ficha de consulta imprimible A4 (datos dinámicos) |

---

## Esquema de la base de datos (Fase 2)

El esquema Prisma incluye los siguientes modelos:

### Modelos de Fase 1
- **User** — Usuarios del sistema
- **DoctorProfile** — Perfil profesional del médico
- **Patient** — Datos del paciente
- **Appointment** — Citas programadas
- **Consultation** — Consulta oftalmológica
- **Lensometry** — Graduación anterior
- **VisualAcuity** — Agudeza visual
- **FinalFormula** — Fórmula final recetada
- **AuditLog** — Registro de auditoría

### Modelos nuevos en Fase 2
- **OcularMotility** — Versiones, ducciones, Cover Test, Hirschberg, NPC
- **ExternalExam** — Párpados, conjuntiva, córnea, iris, pupila, cristalino, fondo
- **CftaMoscopia** — Campimetría, tonometría, A-scan, moscas volantes
- **Keratometry** — Queratometría K1/K2 por ojo
- **ColorTest** — Test de color (Ishihara, Farnsworth, etc.)
- **StereopsisTest** — Test de estereopsis (TNO, Randot, etc.)
- **Refraction** — Refracción objetiva
- **SubjectiveRefraction** — Refracción subjetiva con visión lograda
- **EyeDiagram** — Diagrama de ojo (anotaciones/imágenes)
- **ConsultationPathology** — Patologías registradas en la consulta
- **MedicalNote** — Notas clínicas adicionales
- **PatientPathology** — Patologías crónicas del paciente

---

## Notas de la Fase 3C

La Fase 3C mejora la usabilidad operativa diaria del sistema con:

- **Búsqueda de pacientes**: El listado de pacientes incluye un campo de búsqueda instantánea por nombre, apellido, documento y teléfono
- **Acciones rápidas en pacientes**: Cada fila del listado ahora expone botones directos para ver detalle, historial, evolución y crear una nueva consulta
- **Nueva página de consultas** (`/consultations`): Listado centralizado de todas las consultas con filtro por paciente y búsqueda por motivo/diagnóstico, con acciones de Ver, Editar e Imprimir
- **Filtros en citas**: La página de citas permite filtrar por estado y por rango de fechas (desde/hasta); se muestran badges de color por estado para lectura rápida
- **Feedback de éxito**: Las acciones de crear o actualizar citas muestran un mensaje de confirmación temporal
- **Validación inline en formularios**: Los formularios destacan campos con error con borde rojo y mensaje explicativo junto al campo
- **Historial mejorado**: La tabla de historial del paciente incluye acceso directo a editar cada consulta
- **Estados vacíos informativos**: Mensajes de vacío contextuales en todas las páginas, diferenciando "sin datos" de "sin resultados para el filtro"
- **Navegación simplificada**: La barra de navegación expone directamente Pacientes, Consultas y Citas
- **Backend con parámetros de filtrado**: Los endpoints `/api/patients`, `/api/consultations` y `/api/appointments` aceptan parámetros de búsqueda y filtro

---

## Notas de la Fase 3B

La Fase 3B mejora la experiencia clínica con:

- **Navegación lateral sticky** en el formulario de consulta, con íconos por sección para acceso rápido sin perder el contexto
- **Tablas simétricas OD / OI** en lensometría, agudeza visual, queratometría, refracción objetiva, subjetiva y fórmula final — los valores de cada ojo quedan uno al lado del otro para comparación inmediata
- **Ficha de impresión A4 completa**: ahora incluye todas las secciones clínicas (motilidad ocular, examen externo, CFTA/moscopia, queratometría, test de color, estereopsis, refracción objetiva, subjetivo), con encabezado clínico en tres columnas, colores diferenciados OD/OI, y mejor estructura de firma y sello
- **CSS de impresión refinado** con layout de dos columnas para secciones pequeñas, jerarquía visual más clara, y soporte mejorado de `@page` / `@media print`
- **Pie de página actualizado** que indica la versión del sistema (Fase 3B)

---

## Notas de la Fase 2

La Fase 2 amplía el sistema con:

- **Formulario de consulta multisección** con pestañas para cada área clínica
- **Historial de consultas** por paciente con vista en tabla
- **Evolución clínica longitudinal** (fórmula y agudeza visual en series de tiempo)
- **Impresión dinámica** de ficha de consulta (datos reales del backend)
- **Auditoría automática** de creación y edición de consultas
- **Gestión de citas** con cambio de estado inline
- **Perfiles de paciente** con acceso directo a historial y evolución

---

*Desarrollado para gestión interna de clínica óptica.*
