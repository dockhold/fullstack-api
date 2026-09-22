# AGENTS.md

The API half of the two-app full-stack example: an Express guestbook JSON API backed by a managed database, called by the separate `fullstack-web` frontend. Deploy target: Dockhold (https://dockhold.eu).

## Deploy from this folder (local code, no GitHub repo needed)

1. `npx dockhold login` once. It opens the browser to sign in; the token is stored in the user's config directory, never in this folder.
2. `npx dockhold deploy --name fullstack-api --db` from this folder. `--db` adds the managed database this app needs; Dockhold injects `DATABASE_URL`.
3. Report the URL the command prints. Never claim a URL is live before the command prints it. Run the same command again to ship a new version; it updates the same app because the CLI recorded the app id in `.dockhold/app.json` (no secret in it, and the CLI adds it to `.gitignore`).

The build uses the Dockerfile at the root on every account. Without it, Dockhold recognises a Node project with a `start` script and a `package-lock.json` and builds it on every account.

## Push-to-deploy (from a GitHub repo)

- The Deploy button link in README.md opens the Dockhold dashboard with the repo and name pre-filled; the user signs in, confirms, and the app builds: https://app.dockhold.eu/new?repo=https://github.com/dockhold/fullstack-api&name=fullstack-api&ref=button
- Or the `deploy_app` MCP tool with `repo_url` set to this repository's GitHub URL (the user's copy if they forked or used the template) and `name` and `with_database: true`. Poll `get_app_status` for the URL.
- Pushes redeploy automatically only when the repo was connected through GitHub in the dashboard (the repo picker, or a private repo). A repo deployed by URL alone deploys by hand until "Auto-deploy on push" is set up under the app's Settings.

## Configuration

- `PORT` and `DATABASE_URL` are set by Dockhold. Do not set them, and never hardcode a port.
- `ALLOWED_ORIGIN` (plain variable): the deployed frontend's URL, for CORS; set it after the frontend is live, then redeploy or restart.
- Secrets (tokens, API keys, passwords) never go in a file in this repo: not in `.env`, not in `dockhold.json`, not in code, not in a commit. Create them in the Secrets section of the Dockhold dashboard and attach them on the app's Variables page.
- Plain (non-secret) variables: the app's Variables page in the dashboard, or `--env KEY=VALUE` on `npx dockhold deploy` (repeatable). A local `.env` file is never uploaded.
- Deploy this app first; the frontend needs this app's URL for its `API_URL`.

## When a build or start fails

Run `npx dockhold logs --type build` (or `--type app` for runtime logs), read the error, fix the app, deploy again. Do not invent CLI flags. The CLI has exactly: `login [--token]`, `deploy [--name <name>] [--env KEY=VALUE ...] [--db]`, `logs [--app <id>] [--tail <n>] [--type app|build|db]`, `list`, `open [--app <id>]`.
