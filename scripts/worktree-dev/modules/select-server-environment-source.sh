has_server_env() {
  [ -f "$1" ] && grep -q '^SERVER_URL=' "$1" && grep -q '^PORT=' "$1"
}

env_source="${WORKTREE_ENV_SOURCE:-}"
if [ -n "$env_source" ] && ! has_server_env "$env_source"; then
  echo "WORKTREE_ENV_SOURCE does not point to a valid server .env file." >&2
  exit 1
fi

if [ -z "$env_source" ] && has_server_env "$server_env"; then
  env_source="$server_env"
fi

if [ -z "$env_source" ]; then
  while IFS= read -r worktree_root; do
    candidate="$worktree_root/apps/server/.env"
    if has_server_env "$candidate"; then
      env_source="$candidate"
      break
    fi
  done < <(git worktree list --porcelain | sed -n 's/^worktree //p')
fi

if [ -z "$env_source" ]; then
  echo "Could not find a valid server .env file. Set WORKTREE_ENV_SOURCE to one." >&2
  exit 1
fi
