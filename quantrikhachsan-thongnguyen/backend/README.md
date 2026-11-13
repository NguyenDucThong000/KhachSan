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
In non-production environments, `http://localhost:5173` is allowed for the
Vite frontend. Set `CORS_ORIGIN` to a comma-separated list of deployed
frontend origins for production.
For managed MySQL services that use a private CA, download the provider's CA
certificate and set `DATABASE_CA_CERT_PATH` to its local path. TLS certificate
verification remains enabled.
Room photos are stored as HTTPS URLs or site-relative paths in `rooms.image_url`.
Managers and admins can add or change a room photo URL in the room form.

To verify the configured database connection and read the room count, run:

```powershell
npm run check:db
```

## Validation

```powershell
npm run build
npm run lint
npm test -- --runInBand
```
