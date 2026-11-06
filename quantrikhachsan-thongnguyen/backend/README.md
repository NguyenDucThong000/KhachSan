# Hotel Management API

NestJS 12 REST API, Prisma 7, MariaDB/MySQL. See the [API guide](../DOCUMENTATION/05_API_DESIGN/BACKEND_API_GUIDE.md)
for routes, payloads, and role permissions.

## Setup

```powershell
npm install
Copy-Item .env.example .env
# Set DATABASE_URL and JWT_SECRET in .env
npm run start:dev
```

The API listens on port 3000 by default. Configure a random `JWT_SECRET` of at
least 32 characters outside development. The Prisma schema is
`prisma/schema.prisma`; review migrations against a backup before applying
schema changes to an existing database.

## Validation

```powershell
npm run build
npm run lint
npm test -- --runInBand
```
