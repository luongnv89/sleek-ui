#!/usr/bin/env bash
# Pre-commit security scan (see the pre-commit security conventions reference in
# ~/.agents/skills/issue-resolver/references/docs/pre-commit-security.md).
# Block secret-bearing filenames and real API-key values; warn on large files.
export IDD_AUTO_MODE="${IDD_AUTO_MODE:-0}"
set -u

files="$(git diff --cached --name-only --diff-filter=ACM)"
if [ -z "$files" ]; then
  files="$(git status --porcelain | awk '{print $2}')"
fi

secrets_found=0
warnings=()

# 1. Block: secret-bearing filenames.
secret_patterns='(^|/)\.env($|\..+$)|\.key$|\.pem$|(^|/)credentials\.json$|(^|/)secrets\.ya?ml$|(^|/)id_rsa($|\.pub$)|\.p12$|\.pfx$|\.cer$'
while IFS= read -r f; do
  [ -z "$f" ] && continue
  if printf '%s\n' "$f" | grep -E -q "$secret_patterns"; then
    echo "✗ Secret-bearing file staged: $f"
    secrets_found=1
  fi
done <<< "$files"

# 2. Block: real API-key values inside text files.
realkey_patterns='(sk-(proj-)?[A-Za-z0-9_-]{20,}|sk_live_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|ASIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|gho_[A-Za-z0-9]{30,}|ghs_[A-Za-z0-9]{30,}|ghu_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|xox[abprs]-[A-Za-z0-9-]{10,}|glpat-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{30,})'
while IFS= read -r f; do
  [ -z "$f" ] && continue
  [ -f "$f" ] || continue
  file --mime "$f" 2>/dev/null | grep -q 'charset=binary' && continue
  if grep -E -n "$realkey_patterns" "$f" 2>/dev/null; then
    echo "✗ Real API key detected in: $f"
    secrets_found=1
  fi
done <<< "$files"

# 3. Warn: large files (>10 MB) without Git LFS.
while IFS= read -r f; do
  [ -z "$f" ] && continue
  [ -f "$f" ] || continue
  size=$(stat -c%s "$f" 2>/dev/null || stat -f%z "$f" 2>/dev/null || echo 0)
  if [ "$size" -gt 10485760 ]; then
    warnings+=("⚠ Large file (>10 MB) without LFS: $f")
  fi
done <<< "$files"

if [ "$secrets_found" -eq 1 ]; then
  cat <<'EOF'

✗ Pre-commit security scan blocked the commit — secrets detected.

  To fix:  remove or rotate the offending value, then re-stage the file.
           If the match was a false positive, replace the literal with a
           placeholder (your-key, xxx, <your-key>, ${YOUR_KEY}) and rerun.

EOF
  exit 1
fi

if [ "${#warnings[@]}" -gt 0 ]; then
  printf '%s\n' "${warnings[@]}"
fi

exit 0
