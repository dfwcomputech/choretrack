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

The backend now uses JWT-based auth with an in-memory user repository.

- Login endpoint: `POST /api/auth/login`
- Registration endpoint: `POST /api/auth/register`
- Protected endpoints: `/api/**` (except `/api/auth/**`)
- Default dev credentials: `admin / password`

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
