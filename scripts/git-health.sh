=== GIT HYGIENE SCRIPT - DO NOT EDIT ===
#!/usr/bin/env bash
set -euo pipefail

echo "== Doctor =="
echo "Repo: $(git rev-parse --show-toplevel)"
echo "Branch: $(git rev-parse --abbrev-ref HEAD)"

echo "== Git status timing =="
time git status -uno >/dev/null

echo "== Untracked hotspots (top 15) =="
git ls-files --others --exclude-standard -z \
| xargs -0 -I{} bash -lc 'du -sk "{}" 2>/dev/null || true' \
| sort -nr | head -15 || true

echo "== Node & package manager =="
node -v || true
pnpm -v || true

echo "== Health (if running) =="
curl -fsS http://localhost:3000/api/health && echo " /api/health OK" || echo " /api/health DOWN"
