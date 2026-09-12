#!/usr/bin/env bash
set -euo pipefail
umask 077
cd "$(dirname "$0")/.."
test -f .env.production
mkdir -p backups
backup_dir=$(mktemp -d "$(pwd)/backups/backup-$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")
compose=(docker compose --env-file .env.production)
was_running=$("${compose[@]}" ps --status running --services app)
resume() {
  if [[ "$was_running" == 'app' ]]; then "${compose[@]}" start app; fi
}
trap resume EXIT
# Quiesce app writes so the DB dump and media archive form one consistent backup.
if [[ "$was_running" == 'app' ]]; then "${compose[@]}" stop app; fi
"${compose[@]}" exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup_dir/database.dump"
"${compose[@]}" run --rm --no-deps -T app tar -C /app/data/uploads -czf - . > "$backup_dir/uploads.tar.gz"
test -s "$backup_dir/database.dump"
tar -tzf "$backup_dir/uploads.tar.gz" > /dev/null
git rev-parse HEAD > "$backup_dir/source-commit.txt"
(cd "$backup_dir" && sha256sum database.dump uploads.tar.gz > checksums.sha256)
echo "Backup created: $backup_dir — copy it off-server and test restoration."
