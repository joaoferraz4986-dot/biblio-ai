#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
if ! git -C "$PROJECT_DIR" rev-parse --show-toplevel >/dev/null 2>&1; then
  git -C "$PROJECT_DIR" init -b main
fi
ROOT="$(git -C "$PROJECT_DIR" rev-parse --show-toplevel)"
REMOTE_URL="https://github.com/joaoferraz4986-dot/biblio-ai.git"
BRANCH="${PUBLISH_BRANCH:-main}"
MODE="${1:-publish}"

if [[ "$MODE" != "publish" && "$MODE" != "commit-only" ]]; then
  printf 'Uso: %s [publish|commit-only]\n' "$0" >&2
  exit 2
fi

cd "$ROOT"
git config --local user.name "joaoferraz4986-dot"
git config --local user.email "joaoferraz4986@gmail.com"

if [[ -z "$(git rev-parse --verify HEAD 2>/dev/null || true)" ]]; then
  git branch -M "$BRANCH"
elif [[ "$(git branch --show-current)" != "$BRANCH" ]]; then
  printf 'A branch atual não é %s; mude de branch manualmente antes de publicar.\n' "$BRANCH" >&2
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  CURRENT_REMOTE="$(git remote get-url origin)"
  if [[ "$CURRENT_REMOTE" != "$REMOTE_URL" ]]; then
    printf 'O remote origin já aponta para outro endereço; nenhuma alteração foi feita.\n' >&2
    exit 1
  fi
else
  git remote add origin "$REMOTE_URL"
fi

git add -A

if git diff --cached --name-only | grep -Eiq '(^|/)(\.env($|\.)|id_(rsa|ed25519)$|credentials\.json$|secrets?\.json$|.*\.(pem|p12|pfx|key)$)'; then
  printf 'Há um nome de arquivo sensível staged. Remova-o do commit e revise o conteúdo.\n' >&2
  exit 1
fi

if git grep --cached -I -n -E '(gh[pousr]_[A-Za-z0-9]{25,}|github_pat_[A-Za-z0-9_]{30,}|-----BEGIN (OPENSSH|RSA|EC|DSA|PRIVATE) KEY-----)' >/dev/null 2>&1; then
  printf 'Possível credencial detectada nos arquivos staged. Remova-a e revise antes de publicar.\n' >&2
  exit 1
fi

git diff --cached --check -- . ':!assets/vendor/*'

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git commit -m "Initial commit: Biblio AI"
elif ! git diff --cached --quiet; then
  git commit -m "Update Biblio AI"
else
  printf 'Não há alterações para commitar.\n'
fi

if [[ "$MODE" == "commit-only" ]]; then
  printf 'Commit local concluído. Para publicar, execute: %s publish\n' "$0"
  exit 0
fi

REMOTE_REFS="$(git ls-remote --heads origin "$BRANCH")" || {
  printf 'Não foi possível consultar o remote; verifique a autenticação e tente novamente.\n' >&2
  exit 1
}
if [[ -n "$REMOTE_REFS" ]]; then
  git fetch origin "$BRANCH"
  if ! git merge-base --is-ancestor "origin/$BRANCH" HEAD; then
    git merge --no-edit --allow-unrelated-histories "origin/$BRANCH"
  fi
fi

git push --set-upstream origin "$BRANCH"
printf 'Projeto publicado em %s (branch %s).\n' "${REMOTE_URL%.git}" "$BRANCH"
