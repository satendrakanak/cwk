# CodeWithKasa Infra Guide

CodeWithKasa has one clean Docker path with two modes:

- Development: `docker-compose.yml`, hot reload, local-only env from `.env.docker`.
- Production test / server runtime: `docker-compose.prod.yml`, production Docker targets, env from `.env.production.local` locally and `.env.production` on the server.

No local machine should push directly to `master`. Work on a branch, open a PR, merge into `master`, and let GitHub Actions deploy.

## Local Development

First run:

```bash
./scripts/register-kasa-command.sh
kasa install dev
```

Daily start:

```bash
kasa start dev
```

Reset local Docker data without creating env backup files:

```bash
kasa install dev -r
```

Stop:

```bash
kasa stop
```

Development URLs:

- App: http://localhost:3000
- Installer: http://localhost:3000/install
- API: http://localhost:8000
- Swagger: http://localhost:8000/api

## Local Production Test

Use this before pushing a deployment PR. It builds and runs the same production Docker targets that the server uses.

```bash
kasa stop
kasa install prod
```

Daily start after the env already exists:

```bash
kasa start prod
```

Stop:

```bash
kasa stop
```

Production test uses `.env.production.local`, created from `.env.production.local.example`. It has its own Postgres and Redis Docker volumes so it does not depend on development data.

## Production Server

Server files live at `DEPLOY_PATH`, for example:

```bash
/opt/codewithkasa
```

The server should contain:

- This Git repository cloned from `https://github.com/satendrakanak/cwk.git`
- `.env.production`, created from `.env.production.example`
- Docker and Docker Compose plugin installed

First server setup:

```bash
git clone https://github.com/satendrakanak/cwk.git /opt/codewithkasa
cd /opt/codewithkasa
cp .env.production.example .env.production
```

Fill real secrets/domains in `.env.production`, then test once:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

## GitHub Deploy Flow

1. Create a feature branch locally.
2. Push the branch to GitHub.
3. Open a PR into `master`.
4. Merge the PR into `master` after checks pass.
5. `.github/workflows/deploy.yml` builds client/server images, pushes them to GHCR, SSHs into the server, resets the server checkout to `origin/master`, and restarts `docker-compose.prod.yml`.

Required GitHub secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PORT` optional, defaults to `22`
- `DEPLOY_PATH`, for example `/opt/codewithkasa`
- `NEXT_PUBLIC_APP_URL`, production frontend URL
- `GHCR_PAT` optional if the server needs a PAT to pull private GHCR images

## Files Kept On Purpose

- `.env.docker.example`: development template
- `.env.production.local.example`: local production test template
- `.env.production.example`: server production template
- `docker-compose.yml`: development stack
- `docker-compose.prod.yml`: production stack for both local production test and server
- `client/Dockerfile`: development and production client targets
- `server/Dockerfile`: development and production server targets
- `.github/workflows/ci.yml`: PR checks
- `.github/workflows/deploy.yml`: deploy on `master`
