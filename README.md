# Full-stack example — API

The API half of the Dockhold full-stack example: an Express + Postgres JSON API
that a separate [React frontend](https://github.com/dockhold/fullstack-web) calls.
Running the frontend and API as **two separate apps** (each its own URL, the API
with its own managed database) is the real shape of a production app — and it's a
**Pro** plan feature, since it needs more than one app.

[![Deploy to Dockhold](https://img.shields.io/badge/Deploy%20to-Dockhold-2563eb?style=for-the-badge)](https://app.dockhold.eu/new?repo=https://github.com/dockhold/fullstack-api)

## What it does

A tiny guestbook: `POST /api/messages` saves a message to Postgres,
`GET /api/messages` lists them. Because the data lives in the managed database,
it survives restarts and redeploys — the app's own filesystem does not.

| Route | Description |
|-------|-------------|
| `GET /health` | `{ "status": "ok" }` |
| `GET /api/messages` | List messages, newest first |
| `POST /api/messages` | Add a message — body `{ "body": "hello" }` |

## Deploy it

This is **app 1 of 2**. Deploy it first — the frontend needs its URL.

1. Click **Use this template** (or fork this repo).
2. [Deploy it](https://app.dockhold.eu/new?repo=https://github.com/dockhold/fullstack-api),
   and **check "Add a managed database"** so Dockhold injects `DATABASE_URL`.
3. It goes live at `https://<your-app>.dockhold.app`. Note that URL — the
   frontend's `VITE_API_URL` points at it.
4. After the [frontend](https://github.com/dockhold/fullstack-web) is deployed,
   set `ALLOWED_ORIGIN` to the frontend's URL (Variables tab) and redeploy so
   the browser is allowed to call this API.

## How it works

- `DATABASE_URL` is injected by the managed database add-on — read it, never
  hardcode it (see [`db.js`](db.js)).
- The schema is created on startup (`CREATE TABLE IF NOT EXISTS`).
- All queries are parameterized.
- It listens on `0.0.0.0:$PORT` and allows the `ALLOWED_ORIGIN` for CORS.

No build step, so Dockhold runs it directly — no Dockerfile needed.

## Run it locally

```bash
npm install
# point at any Postgres; e.g. a local docker one:
DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres \
  ALLOWED_ORIGIN=http://localhost:5173 \
  PORT=3000 npm start
# curl http://localhost:3000/api/messages
```

## Full walkthrough

[Deploy a full-stack app (React + API + Postgres)](https://dockhold.eu/docs/recipes/deploy-a-full-stack-app)
— the two-app Pro recipe, including the deploy order and CORS wiring.
