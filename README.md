# Sistema de Gestión Clínica Óptica

> **Fase 4B — Validación reforzada, manejo de errores y calidad de datos clínicos**  
> La Fase 4B endurece el sistema: las entradas son validadas más estrictamente en backend y frontend, las respuestas de error son coherentes y distinguibles (`400`, `401`, `403`, `404`, `409`, `500`), y los datos clínicos pasan por rangos clínicos razonables antes de ser persistidos.
>
> **Fase 4A — Permisos por rol reales en backend y frontend**  
> La Fase 4A hace que las distinciones de roles sean funcionales: el backend devuelve `403` para operaciones no permitidas según el rol, y el frontend oculta o deshabilita acciones que el usuario no puede realizar.
>
> **Fase 3A — Autenticación, cuentas de usuario y control de acceso por roles**  
> La Fase 3A agrega autenticación JWT, gestión de usuarios, autorización por rol y registro de auditoría con usuario real. El flujo de login está en español y se integra de forma transparente con el sistema clínico existente.
>
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
| bcryptjs | Hash de contraseñas |
| jsonwebtoken | Tokens JWT |

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

## Autenticación (Fase 3A)

### Flujo de login

1. El usuario accede a cualquier ruta protegida y es redirigido a `/login`.
2. Ingresa su correo electrónico y contraseña.
3. El backend valida las credenciales y devuelve un token JWT.
4. El token se almacena en `localStorage` y se incluye automáticamente en todas las peticiones API.
5. Al refrescar la página, la sesión se restaura automáticamente llamando a `GET /api/auth/me`.
6. El botón **Cerrar sesión** en el encabezado elimina el token y redirige a `/login`.

### Roles del sistema

| Rol | Descripción |
|---|---|
| `ADMIN` | Administrador con acceso completo |
| `DOCTOR` | Médico optometrista |
| `STAFF` | Personal administrativo |

El campo `role` del modelo `User` controla el nivel de acceso. Desde la Fase 4A, cada rol tiene permisos específicos aplicados tanto en el backend (middleware `requireRole`) como en el frontend (hook `usePermissions` + componente `RoleGuard`).

### Permisos efectivos por rol (Fase 4A)

| Acción | ADMIN | DOCTOR | STAFF |
|---|:---:|:---:|:---:|
| Ver listado de pacientes | ✅ | ✅ | ✅ |
| Ver detalle de paciente | ✅ | ✅ | ✅ |
| Crear/editar paciente | ✅ | ❌ | ✅ |
| Eliminar paciente | ✅ | ❌ | ❌ |
| Ver historial de consultas | ✅ | ✅ | ✅ |
| Ver evolución clínica | ✅ | ✅ | ✅ |
| Ver detalle de consulta | ✅ | ✅ | ✅ |
| Crear consulta | ✅ | ✅ | ❌ |
| Editar consulta | ✅ | ✅ | ❌ |
| Imprimir consulta | ✅ | ✅ | ❌ |
| Ver/crear/actualizar citas | ✅ | ✅ | ✅ |

### Supuestos de flujo de trabajo por rol

**ADMIN**: Acceso irrestricto a todos los módulos. Puede gestionar pacientes, consultas, citas e impresión. Es el único rol autorizado para eliminar pacientes.

**DOCTOR**: Flujo clínico completo. Puede ver y gestionar pacientes, crear y editar consultas, ver historial y evolución, imprimir fichas y gestionar citas. No puede crear/editar datos administrativos de pacientes ni eliminarlos.

**STAFF**: Flujo de recepción. Puede registrar y editar pacientes, gestionar citas, y ver el historial de consultas para coordinar la atención. No puede crear ni editar consultas clínicas ni imprimir fichas. El menú de **Consultas** no aparece en su navegación.

### Variables de entorno requeridas

Además de `DATABASE_URL`, el backend requiere:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `JWT_SECRET` | Secreto para firmar tokens JWT (mínimo 32 caracteres) | `mi_secreto_muy_largo_y_aleatorio_aqui` |
| `JWT_EXPIRES_IN` | Duración del token | `8h` |

### Credenciales de bootstrap (seed)

Ejecuta el seed para crear el usuario administrador inicial:

```bash
cd backend
npm run prisma:seed
```

Las credenciales por defecto son:

| Campo | Valor |
|---|---|
| Email | `admin@clinica.com` |
| Contraseña | `Admin1234!` |

> ⚠️ **Cambia la contraseña después del primer inicio de sesión.**

Puedes personalizar las credenciales del seed con variables de entorno antes de ejecutarlo:

```bash
SEED_ADMIN_EMAIL=mi@correo.com \
SEED_ADMIN_PASSWORD=MiContraseñaSegura! \
SEED_ADMIN_NAME="Mi Nombre" \
npm run prisma:seed
```

### Endpoints de autenticación

| Método | Ruta | Descripción | Auth requerida |
|---|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión (devuelve token JWT) | No |
| GET | `/api/auth/me` | Datos del usuario autenticado | Sí |

Todos los demás endpoints del API requieren el header `Authorization: Bearer <token>`.

---

## Estructura del repositorio

```
optometrist/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Esquema de la base de datos
│   │   └── seed.ts                # Seed del usuario administrador inicial
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts             # Validación de variables de entorno
│   │   │   └── prisma.ts          # Cliente Prisma singleton
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts # JWT verify + requireRole
│   │   │   ├── error.middleware.ts
│   │   │   └── not-found.middleware.ts
│   │   ├── modules/
│   │   │   ├── auth/              # Login, /me, DTOs
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
│   │   │   └── AppLayout.tsx      # Layout principal con navegación y logout
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── AuthContext.tsx    # Contexto de sesión + proveedor
│   │   │   │   ├── ForbiddenPage.tsx  # Página 403 — acceso denegado
│   │   │   │   ├── LoginPage.tsx      # Formulario de login
│   │   │   │   └── usePermissions.ts  # Hook de autorización por rol
│   │   │   ├── patients/          # Listado, detalle, historial, evolución
│   │   │   ├── consultations/     # Nueva/editar consulta, detalle
│   │   │   ├── appointments/      # Listado y gestión de citas
│   │   │   └── print-template/    # Ficha de consulta imprimible (A4)
│   │   ├── router/
│   │   │   ├── index.tsx          # Definición de rutas (con RoleGuard)
│   │   │   ├── ProtectedRoute.tsx # Guarda de rutas autenticadas
│   │   │   └── RoleGuard.tsx      # Guarda de rutas por rol
│   │   ├── services/
│   │   │   ├── api.ts             # Cliente API (Axios + tipos TS)
│   │   │   └── queryClient.ts     # Configuración de React Query
│   │   ├── styles/
│   │   │   ├── global.css         # Estilos globales (incluye login)
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
# Editar .env con los datos de conexión a PostgreSQL y JWT_SECRET

# Generar el cliente Prisma
npm run prisma:generate

# Ejecutar las migraciones
npm run prisma:migrate

# Crear el usuario administrador inicial
npm run prisma:seed

# Iniciar en modo desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

#### Endpoints disponibles

| Método | Ruta | Descripción | Auth | Roles |
|---|---|---|---|---|
| GET | `/api/health` | Estado del servidor | No | Público |
| POST | `/api/auth/login` | Iniciar sesión | No | Público |
| GET | `/api/auth/me` | Usuario autenticado | Sí | Todos los roles |
| GET | `/api/patients` | Listado de pacientes (soporta `?q=`) | Sí | Todos los roles |
| GET | `/api/patients/:id` | Detalle de paciente | Sí | Todos los roles |
| POST | `/api/patients` | Crear paciente | Sí | ADMIN, STAFF |
| PATCH | `/api/patients/:id` | Actualizar paciente | Sí | ADMIN, STAFF |
| DELETE | `/api/patients/:id` | Eliminar paciente | Sí | ADMIN |
| GET | `/api/doctors` | Listado de doctores | Sí | Todos los roles |
| POST | `/api/doctors` | Crear perfil de doctor | Sí | Todos los roles |
| GET | `/api/consultations` | Listado de consultas | Sí | Todos los roles |
| GET | `/api/consultations/:id` | Detalle de consulta | Sí | Todos los roles |
| POST | `/api/consultations` | Crear consulta | Sí | ADMIN, DOCTOR |
| PUT | `/api/consultations/:id` | Actualizar consulta | Sí | ADMIN, DOCTOR |
| GET | `/api/consultations/patient/:patientId/history` | Historial del paciente | Sí | Todos los roles |
| GET | `/api/consultations/patient/:patientId/evolution` | Evolución clínica | Sí | Todos los roles |
| GET | `/api/charts/patients/:patientId/evolution` | Gráfica de evolución | Sí | Todos los roles |
| GET | `/api/appointments` | Listado de citas | Sí | Todos los roles |
| POST | `/api/appointments` | Crear cita | Sí | Todos los roles |
| PATCH | `/api/appointments/:id` | Actualizar cita | Sí | Todos los roles |
| GET | `/api/print/consultations/:id` | Datos para impresión | Sí | ADMIN, DOCTOR |

> **Nota**: "Todos los roles" significa cualquier usuario autenticado (`ADMIN`, `DOCTOR` o `STAFF`). Las rutas marcadas como "Público" no requieren autenticación.

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

| Ruta | Descripción | Roles permitidos |
|---|---|---|
| `/login` | Página de inicio de sesión | Público |
| `/403` | Página de acceso denegado | Público |
| `/` | Listado de pacientes | Todos los roles |
| `/patients/new` | Crear nuevo paciente | ADMIN, STAFF |
| `/patients/:id` | Detalle del paciente | Todos los roles |
| `/patients/:id/history` | Historial de consultas | Todos los roles |
| `/patients/:id/evolution` | Evolución clínica longitudinal | Todos los roles |
| `/consultations` | Listado de consultas | ADMIN, DOCTOR |
| `/consultations/new` | Nueva consulta | ADMIN, DOCTOR |
| `/consultations/:id` | Detalle de consulta | ADMIN, DOCTOR |
| `/consultations/:id/edit` | Editar consulta | ADMIN, DOCTOR |
| `/appointments` | Listado y gestión de citas | Todos los roles |
| `/print/consultations/:id` | Ficha de consulta imprimible A4 | ADMIN, DOCTOR |

> **Nota**: "Todos los roles" significa cualquier usuario autenticado (`ADMIN`, `DOCTOR` o `STAFF`).

---

## Esquema de la base de datos (Fase 2)

El esquema Prisma incluye los siguientes modelos:

### Modelos de Fase 1
- **User** — Usuarios del sistema (email, passwordHash, name, role, active)
- **DoctorProfile** — Perfil profesional del médico (vinculado a User)
- **Patient** — Datos del paciente
- **Appointment** — Citas programadas
- **Consultation** — Consulta oftalmológica
- **Lensometry** — Graduación anterior
- **VisualAcuity** — Agudeza visual
- **FinalFormula** — Fórmula final recetada
- **AuditLog** — Registro de auditoría (con userId del usuario autenticado desde Fase 3A)

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

## Notas de la Fase 3A

La Fase 3A agrega autenticación y control de acceso:

- **Modelo User completo**: email, hash de contraseña bcrypt, nombre, rol (`ADMIN`/`DOCTOR`/`STAFF`), estado activo
- **JWT-based auth**: Login devuelve un token JWT firmado; el frontend lo almacena y lo envía en cada petición
- **Restauración de sesión**: Al recargar la página, el token es verificado con `GET /api/auth/me` para restaurar el estado de sesión
- **Todos los endpoints protegidos**: El middleware `authMiddleware` verifica el token en todas las rutas excepto `/api/health` y `/api/auth/login`
- **Auditoría con usuario real**: Las entradas de `AuditLog` para crear/editar consultas ahora incluyen el `userId` del usuario autenticado
- **Login en español**: Formulario de inicio de sesión con mensajes de error en español
- **Usuario visible en el encabezado**: El nombre y rol del usuario autenticado aparecen en el header
- **Logout**: Botón de cierre de sesión que limpia el token y redirige a `/login`
- **Rutas protegidas**: `ProtectedRoute` redirige a `/login` si no hay sesión activa
- **Estado de carga**: Pantalla de carga mientras se restaura la sesión
- **Seed de usuario inicial**: `npm run prisma:seed` crea el primer usuario administrador

---

## Notas de la Fase 4B

La Fase 4B fortalece la validación, el manejo de errores y la calidad de datos clínicos en todo el sistema:

### Backend — Validación

#### Pacientes
- `firstName` y `lastName`: obligatorios, máximo 100 caracteres.
- `documentId`: máximo 30 caracteres.
- `birthDate`: debe ser una fecha válida y no futura.
- `email`: formato de email válido (si se proporciona), máximo 150 caracteres.
- `phone`: máximo 30 caracteres. `address`: máximo 200. `occupation`: máximo 100. `notes`: máximo 1000.

#### Citas
- `scheduledAt`: obligatorio, debe ser una fecha/hora válida.
- `reason`: máximo 500 caracteres. `notes`: máximo 1000 caracteres.
- `status`: debe ser uno de los valores del enum; error `400` si el valor es inválido.

#### Consultas
- `patientId` y `doctorId`: obligatorios.
- `consultationDate`: debe ser una fecha válida si se proporciona.
- Campos de texto: límites de caracteres en `reason` (500), `diagnosis`/`treatment` (1000), `observations` (2000).
- `paymentAmount`: no puede ser negativo.
- **Datos clínicos con rangos**:
  - **Esfera / Cilindro**: entre −30 y +30 D.
  - **Eje**: entre 0 y 180°, entero.
  - **Adición**: entre 0 y 4 D.
  - **DP (distancia pupilar)**: entre 20 y 40 mm.
  - **Queratometría (K)**: entre 30 y 60 D.
  - **Estereopsis (segundos)**: ≥ 0.
  - Campos de texto de secciones clínicas: máximo 200 caracteres por campo, notas hasta 1000.

### Backend — Manejo de errores

- **`ValidationError`**: nueva clase de error con `{ status, message, errors: [{field, message}] }`. Permite retornar todos los errores de validación en una sola respuesta `400`, no solo el primero.
- **Errores de Prisma**: `P2002` (unicidad violada) retorna `409` con campo afectado. `P2025` (no encontrado) retorna `404`.
- **Helper `validate()`**: centraliza la validación Zod en todos los controladores, lanzando `ValidationError` con lista completa de errores.
- **Códigos coherentes**: `400` validación, `401` sin autenticación, `403` sin autorización, `404` recurso no encontrado, `409` conflicto de unicidad, `500` error interno.

### Frontend — Validación y UX

- **Login**: validación inline antes de enviar (campo vacío, formato de email).
- **Formulario de paciente**: mensajes de error por campo (`firstName`, `lastName`, `birthDate`, `email`). Errores del servidor con campo específico se muestran al lado del campo correspondiente.
- **Formulario de cita**: errores del servidor con campo específico se propagan a `fieldErrors` del formulario.
- **Formulario de consulta**: errores del servidor con múltiples campos se listan todos en el banner de error.
- **`ApiError`**: nueva clase en el cliente API que transporta `status` y `errors[]` de la respuesta. Permite que los formularios lean y muestren errores por campo provenientes del servidor.
- **CSS `.field-error` e `.is-invalid`**: estilos estándar para mensajes de error inline y campos con error.

---

## Notas de la Fase 4A

La Fase 4A convierte las distinciones de roles en permisos reales y verificados:

### Backend
- **Restricciones en consultas**: `POST /api/consultations`, `PUT /api/consultations/:id` y `PATCH /api/consultations/:id` ahora requieren rol `ADMIN` o `DOCTOR`. Los endpoints de lectura (`GET`) son accesibles para todos los roles autenticados.
- **Restricciones en pacientes**: `POST /api/patients` y `PATCH /api/patients/:id` requieren `ADMIN` o `STAFF`. `DELETE /api/patients/:id` requiere `ADMIN` exclusivamente.
- **Restricciones en impresión**: `GET /api/print/consultations/:id` requiere `ADMIN` o `DOCTOR`.
- **Citas abiertas a todos**: Los endpoints de citas (`/api/appointments`) son accesibles para todos los roles autenticados (`ADMIN`, `DOCTOR`, `STAFF`), ya que la recepción necesita gestionar turnos.
- **Respuestas coherentes**: El backend devuelve `401` si no hay token y `403` si el rol no está autorizado.

### Frontend
- **Hook `usePermissions`**: Provee funciones de autorización basadas en el rol del usuario (`canCreateConsultation`, `canEditConsultation`, `canPrintConsultation`, `canCreatePatient`, etc.).
- **Componente `RoleGuard`**: Protege rutas en el router; muestra la página 403 si el rol no está permitido.
- **Navegación adaptativa**: El enlace **Consultas** solo aparece en el menú para `ADMIN` y `DOCTOR`.
- **Botones contextuales**: Los botones de crear/editar consultas, imprimir fichas y eliminar pacientes solo se muestran a los roles habilitados.
- **Página 403**: Mensaje en español con botón de retorno al inicio cuando se accede a una ruta no autorizada.

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
