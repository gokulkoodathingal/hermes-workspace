#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/.local/bin:${PATH}"
ROOT="${WORKSPACE_ROOT:-/workspace}"
cd "${ROOT}"

corepack enable
corepack prepare pnpm@10 --activate

pnpm install

pip3 install --user hermes-agent aiohttp

mkdir -p "${HOME}/.hermes"
