# Sistema de Gestión Clínica Óptica

> **Fase 1 — Bootstrap inicial**  
> Este repositorio contiene la base del sistema de gestión para una clínica óptica (optometrista). Las fases posteriores completarán los módulos clínicos y mejorarán la fidelidad de impresión.

---

## Descripción del proyecto

Sistema web para la gestión integral de una clínica óptica, que permite registrar pacientes, gestionar citas, crear consultas oftalmológicas y generar fichas de consulta imprimibles en formato A4.

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
│   │   │   ├── consultations/     # CRUD de consultas
│   │   │   ├── appointments/      # CRUD de citas
│   │   │   └── print/             # Endpoint de impresión
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
│   │   │   ├── patients/          # Listado y creación de pacientes
│   │   │   ├── consultations/     # Nueva consulta
│   │   │   └── print-template/    # Ficha de consulta imprimible (A4)
│   │   ├── router/
│   │   │   └── index.tsx          # Definición de rutas
│   │   ├── services/
│   │   │   ├── api.ts             # Cliente API (Axios)
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
| GET | `/api/patients` | Listado de pacientes |
| POST | `/api/patients` | Crear paciente |
| GET | `/api/doctors` | Listado de doctores |
| POST | `/api/doctors` | Crear perfil de doctor |
| GET | `/api/consultations` | Listado de consultas |
| POST | `/api/consultations` | Crear consulta |
| GET | `/api/print/consultations/:id` | Datos de consulta para impresión |

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
| `/` | Listado de pacientes |
| `/patients/new` | Crear nuevo paciente |
| `/consultations/new` | Nueva consulta |
| `/print/consultations/:id` | Ficha de consulta imprimible (A4) |

---

## Esquema de la base de datos (Fase 1)

El esquema Prisma incluye los siguientes modelos:

- **User** — Usuarios del sistema (staff, doctores)
- **DoctorProfile** — Perfil profesional del médico (matrícula, clínica, firma)
- **Patient** — Datos del paciente
- **Appointment** — Citas programadas
- **Consultation** — Consulta oftalmológica completa
- **Lensometry** — Graduación anterior (lensometría)
- **VisualAcuity** — Agudeza visual (con y sin corrección)
- **FinalFormula** — Fórmula final recetada
- **AuditLog** — Registro de auditoría de cambios

---

## Notas de la Fase 1

Esta es la **Fase 1 del bootstrap**. Las fases siguientes contemplarán:

- Autenticación y autorización (JWT / sesiones)
- Módulo completo de lensometría y agudeza visual desde la UI
- Mejora de la fidelidad de la ficha de impresión
- Módulo de citas con calendario
- Reportes y estadísticas
- Tests automatizados (unitarios e integración)

---

*Desarrollado para gestión interna de clínica óptica.*
