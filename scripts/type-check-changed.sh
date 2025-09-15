#!/usr/bin/env bash
set -euo pipefail

# Get staged files (before commit)
staged=$(git diff --cached --name-only || true)

if [ -z "$staged" ]; then
  echo "No staged files detected — skipping changed-package type-check."
  exit 0
fi

declare -A pkgs

while IFS= read -r file; do
  # ignore deleted files
  if [[ -z "$file" ]]; then
    continue
  fi
  if [[ ! -e "$file" ]]; then
    continue
  fi

  # walk up until we find a package.json or reach repo root
  dir=$(dirname "$file")
  while [[ "$dir" != "." && "$dir" != "/" ]]; do
    if [[ -f "$dir/package.json" ]]; then
      pkgName=$(node -e "console.log(require(process.argv[1]).name)" "$dir/package.json")
      pkgs["$pkgName"]="$dir"
      break
    fi
    dir=$(dirname "$dir")
  done
done <<< "$staged"

if [ ${#pkgs[@]} -eq 0 ]; then
  echo "No changed packages found among staged files — skipping type-check."
  exit 0
fi

exitCode=0
for pkgName in "${!pkgs[@]}"; do
  pkgPath=${pkgs[$pkgName]}
  echo "→ Running type-check for package: $pkgName (path: $pkgPath)"
  if ! pnpm --filter "./$pkgPath" run type-check; then
    echo "Type-check failed for $pkgName"
    exitCode=1
  fi
done

exit $exitCode
