# ChoreTrack

A chore tracking application with a Spring Boot backend and a React + TypeScript + Vite frontend.

## Project Structure

```
choretrack/
  backend/    # Spring Boot application (Java)
  ui/         # React + TypeScript + Vite frontend
  Dockerfile
```

## Backend

Located in `backend/`. Built with Spring Boot and Maven.

```bash
cd backend
./mvnw spring-boot:run
```

### Authentication

The backend now uses JWT-based auth with PostgreSQL-backed persistence.

- Login endpoint: `POST /api/auth/login`
- Registration endpoint: `POST /api/auth/register`
- Protected endpoints: `/api/**` (except `/api/auth/**`)
- Default dev credentials: `admin / password`
- Demo accounts are seeded only when the user table is empty: `angie`, `preston`, `rylan`, `karla` (all use password `password`)

### Database Configuration

Set `DATABASE_URL` for the backend datasource (for Render PostgreSQL use your service URL).

Example login request:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

Use the returned token for protected API calls:

```bash
curl http://localhost:8080/api/chores \
  -H "Authorization: Bearer <token>"
```

## UI

Located in `ui/`. Built with React, TypeScript, and Vite.

```bash
cd ui
npm install
npm run dev
```
