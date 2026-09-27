@AGENTS.md

## Server (VPS) access

The VPS is driven only through the **Server** GitHub Actions workflow (`.github/workflows/server.yml`, steps in `deploy/remote.sh`); cloud sessions cannot SSH directly.

- Dispatch: `POST /repos/Abdulrahman-haytham/alhaythamhoney/actions/workflows/server.yml/dispatches` with `{"ref":"nextjs","inputs":{"action":"status","arg":""}}`.
- Actions: status, deploy [sha], logs ["app 200"], restart, backup, migrate, seed, jobs, rollback <sha>, bootstrap, shell <command>.
- Read the result from the job's check-run annotations (`/check-runs/{job_id}/annotations`); raw log downloads may be unreachable.
- The repo is public, so run output is public: never print `.env.production`, secrets or customer data.
- The workflow file must also exist on `main` (the default branch) for dispatch to work; keep that copy in sync when the inputs change.
- App lives in `/opt/alhaytham`, runs with `docker compose --env-file .env.production`; follow `deploy/VPS.md` for anything destructive.
