# CRUD Library Management System

A library management system built for internship evaluation. It includes an Angular frontend and an ASP.NET Core Web API backend using Entity Framework Core + SQL Server.

---

## What this project does

The system supports both **Admin** and **Member** workflows.

### Admin features
- Manage **Members**
- Manage **Books**
- View **Transactions**
- Manage **Reservations**
- Update transactions like **Return**

### Member features
- Browse **Books** (with search and filter)
- View **Borrowed Books**
- View **Overdue Books**
- Update profile info and change password

---

## Technology stack

### Frontend
- Angular (standalone components)
- HTTP calls through an authentication-aware service layer

Key UI pages:
- `Frontend/src/app/pages/admin-dashboard/`
- `Frontend/src/app/pages/member-dashboard/`

### Backend
- ASP.NET Core Web API
- Entity Framework Core (EF Core)
- JWT Authentication (Bearer tokens)
- Swagger UI for API testing

Key backend folders:
- `Backend/LibraryManagementAPI/Controllers/`
- `Backend/LibraryManagementAPI/Services/`
- `Backend/LibraryManagementAPI/Repositories/`
- `Backend/LibraryManagementAPI/Data/`

---

## Database (SQL Server)

The database schema is created/managed using EF Core migrations.

Main tables:
- **Books**
- **Members**
- **Reservations**
- **Transactions** (includes fine and return data)

> The backend models and relationships are mapped using `LibraryContext`.

---

## Request flow (how data moves through the system)

This is the typical path for most actions:

1. **Angular UI** triggers an action (example: dashboard load, search, issue/return)
2. The request goes through **AuthService** (and/or auth interceptor) on the frontend
3. The backend receives the request in the **Controller**
4. The controller calls a **Service**
5. The service uses **DbContext (LibraryContext)** and EF Core to read/update the database
6. The service returns a **DTO**
7. The controller sends the DTO as the API response
8. The Angular UI renders the result

---

## Pagination / scrolling behavior

The dashboards are designed to keep panels readable inside the viewport:
- Panels keep their layout height
- If a panel grows, it uses scrolling only inside that panel

On the member dashboard:
- Lists are paged with a **page size of 3** for the main panels (Books/Borrowed/Overdue)

---

## Setup instructions

### 1) Backend
1. Open `Backend/LibraryManagementAPI/appsettings.json` (and `appsettings.Development.json` if used)
2. Update:
   - `DefaultConnection` (SQL Server connection string)
   - `Jwt:Key`, `Jwt:Issuer`, `Jwt:Audience`
3. Run the API (`dotnet run`)

Swagger is enabled in development.

### 2) Frontend
1. Go to `Frontend/`
2. Install dependencies:
   - `npm install`
3. Start the development server:
   - `npm start`

---

## Project structure (quick reference)

- **Frontend**
  - `src/app/pages/admin-dashboard/`
  - `src/app/pages/member-dashboard/`
  - `src/app/core/services/`
  - `src/app/core/interceptors/`

- **Backend**
  - `Controllers/`
  - `Services/`
  - `Repositories/`
  - `Data/LibraryContext.cs`

---

## Notes

- Admin/Member access is protected using JWT.
- The system uses DTOs for API responses.
- Migrations are used to manage the database schema.

---
