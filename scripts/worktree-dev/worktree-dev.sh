# Main worktree development workflow.
trap cleanup EXIT INT TERM HUP

unlink "$server_env" 2>/dev/null || true
ln -s "$runtime_dir/server.env" "$server_env"

configure_next_launchers

PORT="$server_port" \
SERVER_URL="http://localhost:$server_port" \
CLIENT_URL="http://localhost:$client_port" \
ADMIN_URL="http://localhost:$admin_port" \
NEXT_PUBLIC_SERVER_URL="http://localhost:$server_port" \
NEXT_PUBLIC_CLIENT_URL="http://localhost:$client_port" \
bun run dev
