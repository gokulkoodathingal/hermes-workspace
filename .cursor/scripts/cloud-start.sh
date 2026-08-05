#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/.local/bin:${PATH}"
ROOT="${WORKSPACE_ROOT:-/workspace}"
LOG_DIR="${HOME}/.hermes/logs"
API_KEY="${HERMES_DEV_API_KEY:-dev-cloud-agent-local-key}"

mkdir -p "${LOG_DIR}" "${HOME}/.hermes"

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

port_open() {
  python3 -c "import socket; s=socket.socket(); s.settimeout(0.5); raise SystemExit(0 if s.connect_ex(('127.0.0.1', ${1})) == 0 else 1)"
}

start_if_needed() {
  local name="$1"
  shift
  if port_open "${1}"; then
    return 0
  fi
  if pgrep -f "${name}" >/dev/null 2>&1; then
    return 0
  fi
  nohup "$@" >>"${LOG_DIR}/${name}.log" 2>&1 &
  disown || true
}

start_if_needed gateway 8642 hermes gateway run
start_if_needed dashboard 9119 hermes dashboard --port 9119 --host 127.0.0.1 --no-open
start_if_needed workspace 3000 pnpm --dir "${ROOT}" dev

for _ in $(seq 1 45); do
  gateway_ok=0
  dashboard_ok=0
  workspace_ok=0

  if curl -fsS -H "Authorization: Bearer ${API_KEY}" http://127.0.0.1:8642/health >/dev/null 2>&1; then
    gateway_ok=1
  fi
  if curl -fsS http://127.0.0.1:9119/api/status >/dev/null 2>&1; then
    dashboard_ok=1
  fi
  if curl -fsS http://127.0.0.1:3000/api/sessions >/dev/null 2>&1; then
    workspace_ok=1
  fi

  if [[ ${gateway_ok} -eq 1 && ${dashboard_ok} -eq 1 && ${workspace_ok} -eq 1 ]]; then
    exit 0
  fi

  sleep 2
done

echo "Hermes Workspace services failed readiness checks within timeout" >&2
exit 1
