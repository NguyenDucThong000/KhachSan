# Maison Riverside frontend

React + TypeScript + Vite frontend with a public hotel discovery page and
separate customer, receptionist, manager and admin workspaces. Visitors can
browse room types and availability without an account; customers can register
or sign in to manage bookings.

Managers and administrators can create, edit and delete rooms and customer
records, update all room status categories, and create, review, approve or
reject employee leave requests from the workspace navigation.

## Run locally

```powershell
npm install
Copy-Item .env.example .env
# Set VITE_API_URL to the backend URL (default http://localhost:3000)
npm run dev
```

The backend must allow the frontend origin through `CORS_ORIGIN`. Authentication
uses `POST /auth/login`; the returned bearer token is stored in browser
`localStorage` and sent with protected API requests. Sign out removes the token.
The public landing page reads room types from `GET /public/room-types` and
availability from `GET /public/rooms/availability`.

## Validate

```powershell
npm run build
npm run lint
```
