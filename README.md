# 🚼 DevPulse

> **Internal Tech Issue & Feature Tracker** — A collaborative REST API platform for software teams to report bugs, suggest features, and coordinate resolutions.

[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-4169E1?style=flat&logo=postgresql&logoColor=white)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat)](LICENSE)

---

## 🌐 Live Demo

| Resource | Link |
|---|---|
| 🚀 API Base URL | `https://devpulse-api.onrender.com` |
| 📁 GitHub Repository | `https://github.com/yourusername/devpulse` |
| 🎥 Interview Video | `https://youtu.be/your-video-link` |

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [User Roles and Permissions](#-user-roles--permissions)
- [Error Handling](#-error-handling)
- [Available Scripts](#-available-scripts)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure token-based auth with role-based access control
- 👥 **Two User Roles** — `contributor` and `maintainer` with distinct permissions
- 🐛 **Issue Management** — Full CRUD for bugs and feature requests
- 🔍 **Filter & Sort** — Query issues by type, status, and creation date
- 🛡️ **Permission Guards** — Route-level and business-logic-level authorization
- 🏗️ **Modular Architecture** — Clean separation of concerns across all layers
- 📦 **Raw SQL Only** — Direct `pool.query()` calls, zero ORMs or query builders
- ✅ **Strict TypeScript** — No `any` types, proper interfaces throughout

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 24.x LTS | Runtime environment |
| TypeScript | 6.x | Type-safe development |
| Express.js | 5.x | HTTP framework |
| PostgreSQL | 16.x | Relational database |
| pg | 8.x | Native PostgreSQL driver |
| bcrypt | 6.x | Password hashing (salt rounds: 10) |
| jsonwebtoken | 9.x | JWT generation and verification |
| http-status-codes | 2.x | Consistent HTTP status references |
| tsx | 4.x | TypeScript execution and watch mode |

---

## 📁 Project Structure

```
devpulse/
├── src/
│   ├── config/
│   │   ├── db.ts                  # PostgreSQL connection pool
│   │   └── db.init.ts             # Database table initialization script
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT verification → sets req.user
│   │   ├── role.middleware.ts     # Role-based access guard
│   │   └── error.middleware.ts    # Global error handler
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts # signup & login handlers
│   │   │   ├── auth.routes.ts     # /api/auth route definitions
│   │   │   └── auth.types.ts      # Auth request/response interfaces
│   │   │
│   │   └── issues/
│   │       ├── issues.controller.ts # Full CRUD handlers
│   │       ├── issues.routes.ts     # /api/issues route definitions
│   │       └── issues.types.ts      # Issue request/response interfaces
│   │
│   ├── utils/
│   │   ├── jwt.util.ts            # signToken & verifyToken helpers
│   │   ├── query.util.ts          # Reusable raw SQL query helpers
│   │   └── response.util.ts       # sendSuccess & sendError formatters
│   │
│   ├── types/
│   │   └── express.d.ts           # Express Request type extension (req.user)
│   │
│   ├── app.ts                     # Express app setup, routes, middleware
│   └── index.ts                   # Server entry point
│
├── .env                           # Local environment variables (git-ignored)
├── .env.example                   # Environment variable template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js `v24.x` or higher
- PostgreSQL database (local or cloud — NeonDB / Supabase recommended)
- npm `v10.x` or higher

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/devpulse.git
cd devpulse
```

### 2. Install Dependencies

```bash
npm install express cors dotenv bcrypt jsonwebtoken pg http-status-codes
```

```bash
npm install -D typescript tsx @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken @types/pg rimraf
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values (see [Environment Variables](#-environment-variables)).

### 4. Initialize the Database

```bash
npm run db:init
```

This creates the `users` and `issues` tables automatically.

### 5. Start the Development Server

```bash
npm run dev
```

Server runs at `http://localhost:5000`

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database (NeonDB / Supabase / local PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/devpulse

# JWT
JWT_SECRET=your_super_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d
```

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | Yes | `development` or `production` |
| `DATABASE_URL` | Yes | Full PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry duration (default: `7d`) |

---

## 🗄️ Database Schema

### `users` Table

```sql
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  role        VARCHAR(20)   NOT NULL DEFAULT 'contributor'
              CHECK (role IN ('contributor', 'maintainer')),
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

### `issues` Table

```sql
CREATE TABLE issues (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(150)  NOT NULL,
  description  TEXT          NOT NULL,
  type         VARCHAR(20)   NOT NULL
               CHECK (type IN ('bug', 'feature_request')),
  status       VARCHAR(20)   NOT NULL DEFAULT 'open'
               CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id  INTEGER       NOT NULL,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

## 📡 API Reference

### Base URL

```
https://devpulse-api.onrender.com/api
```

### Authorization Header Format

```
Authorization: <JWT_TOKEN>
```

---

### 🔐 Auth Endpoints

#### `POST /api/auth/signup` — Register a new user

**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00Z",
    "updated_at": "2026-01-20T09:00:00Z"
  }
}
```

---

#### `POST /api/auth/login` — Authenticate and get token

**Access:** Public

**Request Body:**
```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00Z",
      "updated_at": "2026-01-20T09:00:00Z"
    }
  }
}
```

---

### 🐛 Issues Endpoints

#### `POST /api/issues` — Create a new issue

**Access:** Authenticated (contributor, maintainer)

**Headers:** `Authorization: <token>`

**Request Body:**
```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}
```

---

#### `GET /api/issues` — Get all issues

**Access:** Public

**Query Parameters:**

| Param | Values | Default | Example |
|---|---|---|---|
| `sort` | `newest`, `oldest` | `newest` | `?sort=oldest` |
| `type` | `bug`, `feature_request` | — | `?type=bug` |
| `status` | `open`, `in_progress`, `resolved` | — | `?status=open` |

**Example request:** `GET /api/issues?sort=newest&type=bug&status=open`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T14:45:00Z"
    }
  ]
}
```

---

#### `GET /api/issues/:id` — Get a single issue

**Access:** Public

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

---

#### `PATCH /api/issues/:id` — Update an issue

**Access:** Maintainer (any issue) · Contributor (own issue, `open` status only)

**Headers:** `Authorization: <token>`

**Request Body** *(all fields optional, at least one required)*:
```json
{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps...",
  "type": "bug"
}
```

> ⚠️ Only `maintainer` can update the `status` field.

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 45,
    "title": "Updated: Database pool exhaustion fix needed",
    "description": "Updated description with reproduction steps...",
    "type": "bug",
    "status": "in_progress",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}
```

---

#### `DELETE /api/issues/:id` — Delete an issue

**Access:** Maintainer only

**Headers:** `Authorization: <token>`

**Response `200 OK`:**
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

---

## 👥 User Roles & Permissions

| Action | Contributor | Maintainer |
|---|:---:|:---:|
| Register and login | ✅ | ✅ |
| View all issues | ✅ | ✅ |
| Create issue | ✅ | ✅ |
| Edit own issue (status must be `open`) | ✅ | ✅ |
| Edit any issue | ❌ | ✅ |
| Change issue status | ❌ | ✅ |
| Delete any issue | ❌ | ✅ |

---

## ⚠️ Error Handling

All errors follow a consistent structure:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": "Additional error details (development only)"
}
```

### HTTP Status Code Reference

| Code | Meaning | When Used |
|---|---|---|
| `200` | OK | Successful GET, PATCH, DELETE |
| `201` | Created | Successful POST (resource created) |
| `400` | Bad Request | Validation errors, duplicate email |
| `401` | Unauthorized | Missing, invalid, or expired JWT |
| `403` | Forbidden | Valid token but insufficient permissions |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Contributor editing a non-open issue |
| `500` | Internal Server Error | Unexpected server or database error |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled production server |
| `npm run start:prod` | Clean build then start production server |
| `npm run typecheck` | Type-check without emitting files |
| `npm run clean` | Delete `dist/` folder |
| `npm run build:clean` | Delete `dist/` and rebuild |
| `npm run db:init` | Create database tables |

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">Built with ❤️ for the DevPulse Assignment</p>