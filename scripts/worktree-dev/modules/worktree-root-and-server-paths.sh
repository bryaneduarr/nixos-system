# Resolve paths from the worktree where the command is invoked.
repo_root="$(git rev-parse --show-toplevel)"
server_env="$repo_root/apps/server/.env"
