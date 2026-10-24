usage() {
  cat <<'USAGE'
agent-chrome: real, headed Chrome instances for AI agents.

  agent-chrome start [NAME] [--url URL] [--background] [--ephemeral] [--clone-from SRC]
  agent-chrome stop [NAME | --all] [--purge]
  agent-chrome list
  agent-chrome status [NAME]
  agent-chrome port [NAME]
  agent-chrome url [NAME]
  agent-chrome show [NAME] [URL]
  agent-chrome gc

NAME defaults to $AGENT_CHROME_INSTANCE, then "default".
USAGE
}

command_name="${1:-help}"
shift || true # No arguments is the help case.
case "$command_name" in
  start) start_instance "$@" ;;
  stop) stop_instances "$@" ;;
  list) list_instances ;;
  status) show_instance_status "$@" ;;
  port) running_instance_port "$@" ;;
  url) show_instance_url "$@" ;;
  show) open_instance_window "$@" ;;
  gc) remove_dead_ephemeral_instances ;;
  stop-when-process-exits) stop_when_process_exits "$@" ;;
  help | -h | --help) usage ;;
  *) fail "unknown command '$command_name' (try: agent-chrome help)" ;;
esac
