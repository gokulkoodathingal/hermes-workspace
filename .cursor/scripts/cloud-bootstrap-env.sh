#!/usr/bin/env bash
set -euo pipefail

API_KEY="${HERMES_DEV_API_KEY:-dev-cloud-agent-local-key}"
ROOT="${WORKSPACE_ROOT:-/workspace}"

mkdir -p "${HOME}/.hermes"

ensure_env_key() {
  local file="$1"
  local key="$2"
  local value="$3"
  if [[ -f "${file}" ]] && grep -q "^${key}=" "${file}"; then
    return 0
  fi
  echo "${key}=${value}" >>"${file}"
}

ensure_env_key "${HOME}/.hermes/.env" API_SERVER_ENABLED true
ensure_env_key "${HOME}/.hermes/.env" API_SERVER_HOST 127.0.0.1
ensure_env_key "${HOME}/.hermes/.env" API_SERVER_KEY "${API_KEY}"

cd "${ROOT}"
if [[ ! -f .env ]]; then
  cp .env.example .env
fi
ensure_env_key .env HERMES_API_URL http://127.0.0.1:8642
ensure_env_key .env HERMES_DASHBOARD_URL http://127.0.0.1:9119
ensure_env_key .env HERMES_API_TOKEN "${API_KEY}"
