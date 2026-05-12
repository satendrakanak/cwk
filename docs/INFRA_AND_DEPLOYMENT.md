# CodeWithKasa Infra Guide

CodeWithKasa has one clean Docker path with two modes:

- Development: `docker-compose.yml`, hot reload, local-only env from `.env.development`.
- Production: `docker-compose.prod.yml`, production Docker targets, env from `.env`.

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

Status:

```bash
kasa status
```

Development URLs:

- App: http://localhost:3000
- API: http://localhost:8000
- Swagger: http://localhost:8000/api

## Production Server

Server files live at `DEPLOY_PATH`, for example:

```bash
/opt/codewithkasa
```

The server should contain:

- This Git repository cloned from `https://github.com/satendrakanak/cwk.git`
- `.env`
- Docker and Docker Compose plugin installed

First server setup:

```bash
git clone https://github.com/satendrakanak/cwk.git /opt/codewithkasa
cd /opt/codewithkasa
kasa install prod
```

Fill real secrets/domains in `.env`, then start production:

```bash
kasa install prod
```

## GitHub Deploy Flow

1. Create a feature branch locally.
2. Push the branch to GitHub.
3. Open a PR into `master`.
4. Merge the PR into `master` after checks pass.
5. `.github/workflows/deploy.yml` runs client/server checks, SSHs into the server, resets the server checkout to `origin/master`, and rebuilds/restarts `docker-compose.prod.yml` on the server.

Required GitHub secrets:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PORT` optional, defaults to `22`
- `DEPLOY_PATH`, for example `/opt/codewithkasa`

Optional GitHub variables:

- `NEXT_PUBLIC_APP_URL`, defaults to `https://cwk.getkasa.in`

Production routing on the AWS server is handled by Nginx and Certbot:

- `https://cwk.getkasa.in` proxies to the CodeWithKasa client on port `3000`.
- `/api/*` on `cwk.getkasa.in` proxies to the CodeWithKasa server on port `8000`.
- `https://license.getkasa.in` proxies to the licence portal on port `5000`.

## Files Kept On Purpose

- `docker-compose.yml`: development stack
- `docker-compose.prod.yml`: production stack
- `client/Dockerfile`: development and production client targets
- `server/Dockerfile`: development and production server targets
- `.github/workflows/ci.yml`: PR checks
- `.github/workflows/deploy.yml`: deploy on `master`
