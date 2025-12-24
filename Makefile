.PHONY: help install test lint format clean docker-build docker-up docker-down deploy

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	pip install -r requirements.txt
	pip install -r requirements-dev.txt

test: ## Run tests
	pytest tests/ -v --cov=app --cov-report=term-missing

test-watch: ## Run tests in watch mode
	pytest-watch tests/

lint: ## Run linters
	black --check app/ tests/
	flake8 app/ tests/ --max-line-length=120 --extend-ignore=E203,W503
	mypy app/ --ignore-missing-imports

format: ## Format code
	black app/ tests/
	isort app/ tests/

clean: ## Clean build artifacts
	find . -type d -name __pycache__ -exec rm -r {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -r {} +
	rm -rf build/ dist/ .eggs/ .pytest_cache/ .coverage htmlcov/

docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start all services
	docker-compose up -d

docker-down: ## Stop all services
	docker-compose down

docker-logs: ## View logs
	docker-compose logs -f

deploy-api: ## Deploy API to Cloud Run
	COMMIT_SHA=$$(git rev-parse --short HEAD) && \
	SHORT_SHA=$${COMMIT_SHA:0:7} && \
	gcloud builds submit \
		--config=cloudbuild.yaml \
		--project=nprocess \
		--region=us-central1 \
		--substitutions=COMMIT_SHA=$$COMMIT_SHA,SHORT_SHA=$$SHORT_SHA

deploy-admin: ## Deploy Admin Dashboard to Cloud Run
	COMMIT_SHA=$$(git rev-parse --short HEAD) && \
	SHORT_SHA=$${COMMIT_SHA:0:7} && \
	cd admin-dashboard && \
	gcloud builds submit \
		--config=cloudbuild.yaml \
		--project=nprocess \
		--region=us-central1 \
		--substitutions=COMMIT_SHA=$$COMMIT_SHA,SHORT_SHA=$$SHORT_SHA

security-scan: ## Run security scans
	bandit -r app/ -f json -o bandit-report.json
	safety check

docs: ## Generate documentation
	@echo "Documentation is in docs/ directory"
