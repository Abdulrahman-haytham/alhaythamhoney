#!/usr/bin/env bash
# shellcheck disable=SC2206  # $SUDO is word-split on purpose ("sudo -n" or empty)
# Runs ON the VPS. GitHub Actions pipes it over SSH (see .github/workflows/server.yml
# and the deploy job in ci.yml), so the server can be driven from the Claude app or
# the GitHub mobile app without a laptop.
#
#   bash remote.sh <action> <app_dir> [arg_base64]
#
# The workflow uploads this file to a mktemp path and runs it with stdin closed,
# so docker/compose commands cannot swallow the rest of the script.
#
# Actions logs are visible to everyone who can see the repository: never print
# secrets, .env.production, or customer data from here.
set -euo pipefail

action=${1:?action required}
app_dir=${2:-/opt/alhaytham}
arg=$(printf '%s' "${3:-}" | base64 -d 2>/dev/null || true)
repo_url=https://github.com/Abdulrahman-haytham/alhaythamhoney.git
branch=nextjs

SUDO=''
[ "$(id -u)" -eq 0 ] || SUDO='sudo -n'
DOCKER=(docker)
if command -v docker >/dev/null && ! docker info >/dev/null 2>&1; then DOCKER=($SUDO docker); fi

compose() { "${DOCKER[@]}" compose --env-file .env.production "$@"; }

need_app() {
  cd "$app_dir" 2>/dev/null || { echo "::error::$app_dir is missing — run the bootstrap action first"; exit 1; }
  [ -f .env.production ] || { echo "::error::.env.production is missing — run the bootstrap action first"; exit 1; }
}

health() {
  for _ in $(seq 1 40); do
    if curl -fsS --max-time 5 http://127.0.0.1:3005/api/health >/dev/null 2>&1; then echo 'health: ok'; return 0; fi
    sleep 3
  done
  echo '::error::health check failed'
  compose ps
  compose logs --tail 80 --no-color app || true
  return 1
}

section() { echo; echo "── $* ──"; }

case "$action" in
  status)
    section host;   uname -srm; uptime; (command -v lsb_release >/dev/null && lsb_release -ds) || head -1 /etc/os-release
    section disk;   df -h / | tail -1
    section memory; free -h | head -2
    section tools;  for c in docker git nginx certbot; do printf '%-8s %s\n' "$c" "$(command -v $c >/dev/null && echo yes || echo MISSING)"; done
    if [ -d "$app_dir/.git" ]; then
      cd "$app_dir"
      section source; git log -1 --format='%h %ci %s'
      [ -f .env.production ] && echo '.env.production: present' || echo '.env.production: MISSING'
      if [ -f .env.production ] && command -v docker >/dev/null; then
        section containers; compose ps --format 'table {{.Service}}\t{{.Status}}' || true
        section health; curl -fsS --max-time 5 http://127.0.0.1:3005/api/health && echo || echo 'app not answering on 127.0.0.1:3005'
      fi
    else
      section source; echo "$app_dir not set up yet"
    fi
    if command -v nginx >/dev/null; then section nginx; $SUDO systemctl is-active nginx || true; $SUDO nginx -t 2>&1 | tail -1 || true; fi
    if command -v systemctl >/dev/null; then section timers; systemctl list-timers --no-pager 'alhaytham*' 2>/dev/null | head -3 || true; fi
    ;;

  deploy)
    need_app
    target=${arg:-origin/$branch}
    prev=$(git rev-parse HEAD)
    git fetch --quiet origin "$branch"
    git merge --ff-only --quiet "$target"
    now=$(git rev-parse HEAD)
    echo "source: ${prev:0:7} → ${now:0:7}"
    echo "$(date -u +%FT%TZ) $prev $now" >> .deploy-history
    section build;   compose build
    section backup;  bash scripts/backup.sh
    section migrate; compose run --rm migrate
    section start;   compose up -d app
    health
    echo "Deployed ${now:0:7}. Previous: ${prev:0:7} (use rollback with this SHA if needed)."
    ;;

  logs)
    need_app
    read -r svc lines <<<"${arg:-app 150}"
    case "$svc" in app|db|migrate) ;; *) echo '::error::service must be app, db or migrate'; exit 1 ;; esac
    [[ "${lines:-150}" =~ ^[0-9]+$ ]] || lines=150
    compose logs --tail "${lines:-150}" --no-color "$svc"
    ;;

  restart)  need_app; compose up -d app; compose restart app; health ;;
  backup)   need_app; bash scripts/backup.sh; ls -1t backups | head -5 ;;
  migrate)  need_app; compose run --rm migrate ;;
  seed)     need_app; compose --profile tools run --rm seed ;;
  jobs)     need_app; $SUDO systemctl start alhaytham-jobs.service; $SUDO journalctl -u alhaytham-jobs.service -n 20 --no-pager ;;

  rollback)
    need_app
    [[ "$arg" =~ ^[0-9a-f]{7,40}$ ]] || { echo '::error::rollback needs a commit SHA'; exit 1; }
    echo 'Note: database migrations are NOT reversed by a rollback.'
    git fetch --quiet origin "$branch"
    git -c advice.detachedHead=false checkout --quiet "$arg"
    compose build; compose up -d app; health
    echo "Now on $(git rev-parse --short HEAD) (detached). The next deploy returns to $branch."
    ;;

  bootstrap)
    # One-time setup of a fresh server. Idempotent: never overwrites an existing .env.production.
    export DEBIAN_FRONTEND=noninteractive
    if ! command -v docker >/dev/null; then section 'install docker'; curl -fsSL https://get.docker.com | $SUDO sh; DOCKER=($SUDO docker); fi
    missing=()
    for p in git nginx certbot openssl curl; do command -v $p >/dev/null || missing+=("$p"); done
    command -v certbot >/dev/null || missing+=(python3-certbot-nginx)
    if [ ${#missing[@]} -gt 0 ]; then section "install ${missing[*]}"; $SUDO apt-get update -qq; $SUDO apt-get install -y -qq "${missing[@]}"; fi
    if [ ! -d "$app_dir/.git" ]; then section clone; $SUDO mkdir -p "$app_dir"; $SUDO chown "$(id -u):$(id -g)" "$app_dir"; git clone --branch "$branch" "$repo_url" "$app_dir"; fi
    cd "$app_dir"
    if [ ! -f .env.production ]; then
      section 'create .env.production'
      site=${arg:-https://alhaythamhoney.sy}
      admin_pw=${ADMIN_PASSWORD:-$(openssl rand -base64 18)}
      umask 077
      sed -e "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$(openssl rand -hex 32)|" \
          -e "s|^ADMIN_SESSION_SECRET=.*|ADMIN_SESSION_SECRET=$(openssl rand -hex 32)|" \
          -e "s|^CRON_SECRET=.*|CRON_SECRET=$(openssl rand -hex 32)|" \
          -e "s|^ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$admin_pw|" \
          -e "s|^NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=$site|" \
          .env.production.example > .env.production
      chmod 600 .env.production
      echo "created with random secrets (site: $site). Values are not printed."
      [ -n "${ADMIN_PASSWORD:-}" ] || echo "::warning::ADMIN_PASSWORD secret was not set; a random one was written to .env.production on the server."
    else
      echo '.env.production already exists — left untouched'
    fi
    ;;

  shell)
    [ -n "$arg" ] || { echo '::error::no command given'; exit 1; }
    cd "$app_dir" 2>/dev/null || cd ~
    echo "\$ $arg"
    bash -c "$arg"
    ;;

  *) echo "::error::unknown action: $action"; exit 1 ;;
esac
