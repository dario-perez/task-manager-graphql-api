# API de Gestión de Tareas (GraphQL)

Este proyecto es una API robusta y segura construida para un sistema de gestión de tareas, cumpliendo con estándares de arquitectura profesional y seguridad criptográfica.

## 🚀 Tecnologías
- **Runtime:** Node.js
- **Framework:** Fastify
- **Motor GraphQL:** GraphQL Yoga
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL (Supabase)
- **Seguridad:** JWT (JSON Web Tokens) & Bcrypt

## 🛡️ Características de Seguridad
- **Validación de Firma:** Se valida rigurosamente la firma criptográfica de cada JWT en peticiones protegidas.
- **RBAC (Control de Acceso Basado en Roles):** Diferenciación clara entre permisos de `ADMIN` y `USER`. 
- **Masked Errors:** Protección contra filtración de información técnica en errores del servidor.

## 📂 Arquitectura
El proyecto sigue una estructura modular separando TypeDefs, Resolvers y Contexto para asegurar la escalabilidad.

## 🛠️ Configuración Inicial

### Prerrequisitos
- Node.js (v20+) o Docker Desktop

### 🔑 Variables de Entorno
Este proyecto requiere un archivo `.env` en la raíz. Puedes usar `.env.example` como plantilla:
1. `cp .env.example .env` (o créalo manualmente).
2. Completa tu `DATABASE_URL` y un `JWT_SECRET` seguro.

### Configuración (Manual)
1. Instalar dependencias: `npm install`
2. Configurar el archivo `.env` con tu `DATABASE_URL` y `JWT_SECRET`.
3. Generar cliente de Prisma: `npx prisma generate`
4. Sincronizar base de datos: `npx prisma db push`
5. Iniciar servidor: `npm run dev`

### Configuración (Docker - Recomendado)
1. Configurar archivo `.env`.
2. Ejecutar `docker-compose up --build`

### 🚀 Cómo Probar la API

Para facilitar las pruebas de los endpoints, he incluido una colección de **Postman** en el repositorio.

1.  📂 **Importar:** Carga el archivo localizado en `./postman/Backend_DevOps_Pathway.postman_collection.json` en tu Postman.
2.  ⚙️ **Variables:** Configura la variable de colección `base_url` como `http://localhost:4000/graphql`.
3.  🔑 **Auth:** Registra un usuario y realiza el login para obtener el `jwt_token`.
4.  🛡️ **Herencia:** La colección ya está configurada para heredar el token automáticamente en todas las peticiones protegidas.

---

# Task Management API (GraphQL)

A robust and secure API built for a task management system, following professional architecture and cryptographic security standards.

## 🚀 Tech Stack
- **Runtime:** Node.js
- **Framework:** Fastify
- **GraphQL Engine:** GraphQL Yoga
- **ORM:** Prisma
- **Database:** PostgreSQL (Supabase)
- **Security:** JWT (JSON Web Tokens) & Bcrypt

## 🛡️ Security Features
- **Signature Validation:** Strict cryptographic signature validation for every JWT on protected requests.
- **RBAC (Role-Based Access Control):** Clear differentiation between `ADMIN` and `USER` permissions. 
- **Masked Errors:** Protection against technical data leaks in server errors.

## 📂 Architecture
The project follows a modular structure, decoupling TypeDefs, Resolvers, and Context to ensure scalability.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+) or Docker Desktop

### 🔑 Environment Variables
This project requires a `.env` file in the root directory. You can use `.env.example` as a template:
1. `cp .env.example .env` (or manually create it).
2. Fill in your `DATABASE_URL` and a secure `JWT_SECRET`.

### Setup (Manual)
1. Install dependencies: `npm install`
2. Configure `.env` file with your `DATABASE_URL` and `JWT_SECRET`.
3. Generate Prisma client: `npx prisma generate`
4. Run migrations: `npx prisma db push`
5. Start dev server: `npm run dev`

### Setup (Docker - Recommended)
1. Configure `.env` file.
2. Run `docker-compose up --build`

### How to Test the API

To streamline endpoint testing, I have included a **Postman** collection within this repository.

1.  📂 **Import:** Load the file located at `./postman/Backend_DevOps_Pathway.postman_collection.json` into Postman.
2.  ⚙️ **Variables:** Set the `base_url` collection variable to `http://localhost:4000/graphql`.
3.  🔑 **Auth:** Register a user and perform a login mutation to retrieve the `jwt_token`.
4.  🛡️ **Inheritance:** The collection is pre-configured to automatically inherit the token for all protected requests once set at the root level.