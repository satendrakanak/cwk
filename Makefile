.PHONY: install-dev install-prod reset-dev status dev dev-down dev-logs prod prod-down prod-logs

install-dev:
	./scripts/install-dev.sh

install-prod:
	./scripts/install-prod.sh

reset-dev:
	./scripts/reset-dev.sh

status:
	./scripts/status.sh

dev:
	docker compose --env-file .env.docker up --build

dev-down:
	docker compose --env-file .env.docker down

dev-logs:
	docker compose --env-file .env.docker logs -f

prod:
	docker compose --env-file .env.production.local -f docker-compose.prod.yml up --build -d

prod-down:
	docker compose --env-file .env.production.local -f docker-compose.prod.yml down

prod-logs:
	docker compose --env-file .env.production.local -f docker-compose.prod.yml logs -f
