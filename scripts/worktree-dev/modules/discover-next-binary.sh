runtime_dir="$(mktemp -d "${TMPDIR:-/tmp}/worktree-dev.XXXXXX")"
next_binary="$(find "$repo_root/node_modules/.bun" -type f -path '*/next/dist/bin/next' -print -quit)"

if [ -z "$next_binary" ]; then
  echo "Could not find the Next.js binary. Run bun install first." >&2
  exit 1
fi
