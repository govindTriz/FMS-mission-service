# FMS Mission Management Service

Production-grade Node.js (Express + TypeScript) server with PostgreSQL via Prisma ORM.

## Features

- Express 5 + TypeScript
- Prisma ORM (PostgreSQL)
- Structured logging with Pino + request IDs
- Security: helmet, CORS, rate limiting, compression
- Health check endpoint `/healthz` with optional DB check `?db=1`
- Centralized error handling and 404 middleware
- Example `User` model and CRUD endpoints

## Getting Started

1. Copy `.env` and set `DATABASE_URL` to your PostgreSQL connection.
2. Install deps:
   ```sh
   npm install
   ```
3. Generate Prisma client and run migrations:
   ```sh
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Start dev server:
   ```sh
   npm run dev
   ```

## Scripts

- `npm run dev` — start in watch mode
- `npm run build` — compile TypeScript and generate Prisma client
- `npm start` — run compiled server
- `npm run prisma:migrate` — run a development migration

## Project Structure

```
src/
  index.ts            # bootstrap
  server.ts           # express app (middlewares, routes)
  lib/
    env.ts            # env loader and helpers
    logger.ts         # pino logger
  middleware/
    errorHandler.ts   # centralized error handler
    notFound.ts       # 404 handler
  routes/
    index.ts          # routes aggregator
    users.ts          # sample CRUD
  services/
    db.ts             # Prisma client instance
  types/
    express.d.ts      # request id typing
prisma/
  schema.prisma
```

## API

Base path: `/api`

- GET `/mission` — list missions
  - Query: `deploymentId?`, `zoneId?`, `name?`, `skip?`, `take?`
- GET `/mission/:id` — get mission by id
- POST `/mission` — create mission with optional waypoints
- PATCH `/mission/:id` — update mission fields and optionally replace waypoints
- DELETE `/mission/:id` — delete mission

Example create body:

```json
{
  "name": "Mission Alpha",
  "deploymentId": "dep_9f3b2",
  "deploymentData": { "type": "base" },
  "zoneId": "zone_42",
  "zoneData": { "risk": "low" },
  "waypoints": [
    {
      "waypointId": "WP-100",
      "name": "Entry",
      "order": 1,
      "tasks": [
        { "name": "TakePhoto", "value": { "resolution": "4k" } },
        { "name": "MeasureTemp", "value": { "unit": "C" } }
      ]
    }
  ]
}
```

## Production Notes

- Behind a proxy, set `TRUST_PROXY=true`.
- Use a process manager (pm2, systemd) or container orchestration.
- Ensure `NODE_ENV=production` and define `LOG_LEVEL`.
- Configure CORS origins and body size limits appropriately.
- Set up monitoring and rotate logs.
