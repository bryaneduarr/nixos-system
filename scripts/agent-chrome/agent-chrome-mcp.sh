instance="${AGENT_CHROME_INSTANCE:-default}"
start_arguments=(--background)
is_ephemeral=false
if [[ "$instance" == ephemeral ]]; then
  instance="tmp-$(date +%s)-$$"
  is_ephemeral=true
  start_arguments+=(--ephemeral)
fi
if [[ -n "${AGENT_CHROME_CLONE_FROM:-}" ]]; then
  start_arguments+=(--clone-from "$AGENT_CHROME_CLONE_FROM")
fi

port="$(agent-chrome start "$instance" "${start_arguments[@]}")"

export CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS=1
read -r -a extra_arguments <<<"${AGENT_CHROME_MCP_ARGS:-}"
server_command=(
  node "$AGENT_CHROME_MCP_ENTRY"
  "--browser-url=http://127.0.0.1:$port"
  --no-usage-statistics
  --no-performance-crux
  "${extra_arguments[@]}"
)

if [[ "$is_ephemeral" == false ]]; then
  exec "${server_command[@]}"
fi

"${server_command[@]}" <&0 &
server_process_id=$!

# A harness may SIGKILL this wrapper, which skips the traps below.
setsid agent-chrome stop-when-process-exits "$$" "$instance" >/dev/null 2>&1 </dev/null &

forward_termination() {
  kill "$server_process_id" 2>/dev/null || true # The server may have exited already.
}
trap forward_termination TERM INT HUP
trap 'agent-chrome stop "$instance" >/dev/null 2>&1' EXIT
wait "$server_process_id" || true # The server exit status does not matter; cleanup must run.
