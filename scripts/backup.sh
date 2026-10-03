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
# Images and PDFs are small, so every backup carries its own full archive of them.
# Videos have no size limit and are handled below, after the shop is back up.
"${compose[@]}" run --rm --no-deps -T app tar -C /app/data/uploads \
  --exclude='*.mp4' --exclude='*.mov' --exclude='*.webm' --exclude='*.part' \
  -czf - . < /dev/null > "$backup_dir/uploads.tar.gz"
test -s "$backup_dir/database.dump"
tar -tzf "$backup_dir/uploads.tar.gz" > /dev/null
resume
trap - EXIT

# Videos: one mirror in backups/videos instead of a copy per backup — gigabytes of video
# must neither keep the shop stopped during a deploy nor double the disk each time.
# Files are write-once with random names, so copying while the app runs is safe.
# A video deleted from the studio moves to backups/videos-deleted and is purged 30 days
# later, which is what actually frees its disk space.
mkdir -p backups/videos backups/videos-deleted
"${compose[@]}" run --rm --no-deps -T --user 0 -v "$(pwd)/backups:/backups" app sh -ec '
  cd /app/data/uploads
  find . -type f \( -name "*.mp4" -o -name "*.mov" -o -name "*.webm" \) | sort > /backups/videos/.current
  while IFS= read -r f; do
    [ -e "/backups/videos/$f" ] && continue
    mkdir -p "/backups/videos/$(dirname "$f")"
    cp "$f" "/backups/videos/$f.part" && mv "/backups/videos/$f.part" "/backups/videos/$f"
  done < /backups/videos/.current
  cd /backups/videos
  find . -type f ! -name .current ! -name "*.part" | sort | comm -13 .current - |
    while IFS= read -r f; do
      mkdir -p "/backups/videos-deleted/$(dirname "$f")"
      mv "$f" "/backups/videos-deleted/$f"
    done
  find /backups/videos-deleted -type f -ctime +30 -delete
' < /dev/null
cp backups/videos/.current "$backup_dir/videos.list"
git rev-parse HEAD > "$backup_dir/source-commit.txt"
(cd "$backup_dir" && sha256sum database.dump uploads.tar.gz videos.list > checksums.sha256)
echo "Backup created: $backup_dir ($(wc -l < "$backup_dir/videos.list") videos mirrored in backups/videos) — copy both off-server and test restoration."
