PY ?= python3
PORT ?= 8090

.DEFAULT_GOAL := help
.PHONY: help validate build check serve admin watch clean

help: ## Show this help
	@echo "DATC — available make targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

validate: ## Check storage schema + referential integrity
	@$(PY) scripts/validate.py

build: ## Regenerate web/data.js from storage/
	@$(PY) scripts/build.py

check: validate build ## Validate then rebuild (run before committing)

serve: ## Live-reload dev server for the app (auto-builds on storage change)
	@$(PY) scripts/serve.py

admin: ## Local CRUD admin server for editing storage/
	@$(PY) scripts/admin.py

clean: ## Remove Python caches
	@find . -name __pycache__ -type d -prune -exec rm -rf {} + ; echo "cleaned"
