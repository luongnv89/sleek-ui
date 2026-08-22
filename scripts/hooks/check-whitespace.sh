#!/usr/bin/env bash
# Lint hook: reject trailing whitespace and missing trailing newline in staged text files.
set -u

files="$(git diff --cached --name-only --diff-filter=ACM)"
[ -z "$files" ] && exit 0

problems=0
while IFS= read -r f; do
  [ -z "$f" ] && continue
  [ -f "$f" ] || continue
  case "$f" in
    *.png|*.jpg|*.jpeg|*.gif|*.webp|*.ico|*.svg|*.woff|*.woff2|*.ttf|*.mp4) continue ;;
  esac
  if grep -E -q '[[:blank:]]$' "$f" 2>/dev/null; then
    echo "✗ Trailing whitespace in: $f"
    problems=1
  fi
  if [ -s "$f" ] && [ "$(tail -c 1 "$f" | od -An -c | tr -d ' \n')" != "\n" ]; then
    echo "✗ Missing trailing newline in: $f"
    problems=1
  fi
done <<< "$files"

exit $problems
