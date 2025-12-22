.PHONY: help install install-dev run test test-coverage lint format clean docker-build docker-run docker-stop deploy-dev deploy-staging deploy-prod

# Variables
PYTHON := python3
PIP := pip3
PROJECT_ID := $(shell gcloud config get-value project 2>/dev/null)
SERVICE_NAME := compliance-engine
REGION := us-central1

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m # No Color

help: ## Mostra esta mensagem de ajuda
	@echo "$(BLUE)ComplianceEngine API - Makefile Commands$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Installation
install: ## Instala dependências de produção
	@echo "$(BLUE)Installing production dependencies...$(NC)"
	$(PIP) install -r requirements.txt

install-dev: ## Instala dependências de desenvolvimento
	@echo "$(BLUE)Installing development dependencies...$(NC)"
	$(PIP) install -r requirements.txt
	$(PIP) install -r requirements-dev.txt

# Development
run: ## Executa a aplicação localmente
	@echo "$(BLUE)Starting ComplianceEngine API...$(NC)"
	$(PYTHON) -m app.main

run-reload: ## Executa com hot reload
	@echo "$(BLUE)Starting with hot reload...$(NC)"
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8080

# Testing
test: ## Executa testes
	@echo "$(BLUE)Running tests...$(NC)"
	pytest tests/ -v

test-coverage: ## Executa testes com cobertura
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	pytest tests/ -v --cov=app --cov-report=html --cov-report=term
	@echo "$(GREEN)Coverage report generated in htmlcov/index.html$(NC)"

test-unit: ## Executa apenas testes unitários
	@echo "$(BLUE)Running unit tests...$(NC)"
	pytest tests/ -v -m unit

test-integration: ## Executa apenas testes de integração
	@echo "$(BLUE)Running integration tests...$(NC)"
	pytest tests/ -v -m integration

test-api: ## Executa script de teste da API
	@echo "$(BLUE)Testing API endpoints...$(NC)"
	$(PYTHON) test_api.py

# Code Quality
lint: ## Executa linting (flake8)
	@echo "$(BLUE)Running linter...$(NC)"
	flake8 app/ tests/ --max-line-length=100 --exclude=__pycache__

format: ## Formata código com black
	@echo "$(BLUE)Formatting code...$(NC)"
	black app/ tests/ --line-length=100

format-check: ## Verifica formatação sem modificar
	@echo "$(BLUE)Checking code format...$(NC)"
	black app/ tests/ --check --line-length=100

type-check: ## Verifica tipos com mypy
	@echo "$(BLUE)Running type checker...$(NC)"
	mypy app/ --ignore-missing-imports

# Docker
docker-build: ## Builda imagem Docker
	@echo "$(BLUE)Building Docker image...$(NC)"
	docker build -t $(SERVICE_NAME):latest .

docker-run: ## Executa container Docker
	@echo "$(BLUE)Running Docker container...$(NC)"
	docker run -p 8080:8080 --env-file .env $(SERVICE_NAME):latest

docker-compose-up: ## Inicia serviços com docker-compose
	@echo "$(BLUE)Starting services with docker-compose...$(NC)"
	docker-compose up -d

docker-compose-down: ## Para serviços do docker-compose
	@echo "$(BLUE)Stopping docker-compose services...$(NC)"
	docker-compose down

docker-compose-logs: ## Mostra logs do docker-compose
	docker-compose logs -f

docker-stop: ## Para todos os containers
	@echo "$(BLUE)Stopping all containers...$(NC)"
	docker-compose down

# GCP Deployment
check-project: ## Verifica se projeto GCP está configurado
	@if [ -z "$(PROJECT_ID)" ]; then \
		echo "$(YELLOW)Error: No GCP project configured$(NC)"; \
		echo "Run: gcloud config set project YOUR_PROJECT_ID"; \
		exit 1; \
	fi
	@echo "$(GREEN)Project ID: $(PROJECT_ID)$(NC)"

enable-apis: check-project ## Habilita APIs necessárias no GCP
	@echo "$(BLUE)Enabling GCP APIs...$(NC)"
	gcloud services enable run.googleapis.com
	gcloud services enable cloudbuild.googleapis.com
	gcloud services enable aiplatform.googleapis.com
	gcloud services enable firestore.googleapis.com

deploy-dev: check-project ## Deploy para ambiente de desenvolvimento
	@echo "$(BLUE)Deploying to development...$(NC)"
	./deploy.sh dev

deploy-staging: check-project ## Deploy para ambiente de staging
	@echo "$(BLUE)Deploying to staging...$(NC)"
	./deploy.sh staging

deploy-prod: check-project ## Deploy para ambiente de produção
	@echo "$(YELLOW)Deploying to PRODUCTION...$(NC)"
	./deploy.sh prod

deploy-cloudbuild: check-project ## Deploy usando Cloud Build
	@echo "$(BLUE)Deploying with Cloud Build...$(NC)"
	gcloud builds submit --config cloudbuild.yaml

# GCP Management
logs: check-project ## Mostra logs do Cloud Run
	@echo "$(BLUE)Fetching logs...$(NC)"
	gcloud run services logs read $(SERVICE_NAME)-dev --region $(REGION)

logs-tail: check-project ## Acompanha logs em tempo real
	@echo "$(BLUE)Tailing logs...$(NC)"
	gcloud run services logs tail $(SERVICE_NAME)-dev --region $(REGION)

describe: check-project ## Mostra informações do serviço
	@echo "$(BLUE)Service information...$(NC)"
	gcloud run services describe $(SERVICE_NAME)-dev --region $(REGION)

# Cleanup
clean: ## Remove arquivos temporários
	@echo "$(BLUE)Cleaning up...$(NC)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "htmlcov" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name ".coverage" -delete
	@echo "$(GREEN)Cleanup complete!$(NC)"

clean-docker: ## Remove containers e imagens Docker
	@echo "$(BLUE)Cleaning Docker resources...$(NC)"
	docker-compose down -v
	docker rmi $(SERVICE_NAME):latest 2>/dev/null || true

# Development helpers
setup: install-dev ## Configura ambiente de desenvolvimento completo
	@echo "$(BLUE)Setting up development environment...$(NC)"
	cp .env.example .env
	@echo "$(GREEN)Setup complete!$(NC)"
	@echo "$(YELLOW)Please edit .env with your GCP project ID$(NC)"

verify: format-check lint type-check test ## Verifica código completo (CI)
	@echo "$(GREEN)All checks passed!$(NC)"

# Documentation
docs-serve: ## Inicia servidor de documentação local
	@echo "$(BLUE)Starting documentation server...$(NC)"
	@echo "$(GREEN)API Docs: http://localhost:8080/docs$(NC)"
	@echo "$(GREEN)ReDoc: http://localhost:8080/redoc$(NC)"

.DEFAULT_GOAL := help
