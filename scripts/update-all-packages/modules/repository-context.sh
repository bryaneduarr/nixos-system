repo_root="$(cd -- "$script_directory/../.." && pwd)"
flake_ref="path:$repo_root"
source "$repo_root/scripts/system-target/select-target.sh"
select_system_target
show_system_target

pi_nix_file="$repo_root/home/packages/pi/pi-tools/default.nix"

# Run a task with a small text-only spinner. Successful command output stays
# hidden; failures replay the captured diagnostics.
run_with_status() {
  local start_message="$1" done_message="$2" log_file command_pid frame_index=0 command_status
  local -a spinner_frames=("[|]" "[/]" "[-]" "[\\]")
  shift 2

  log_file="$(mktemp)"
  "$@" >"$log_file" 2>&1 &
  command_pid=$!

  if [ -t 1 ]; then
    while kill -0 "$command_pid" 2>/dev/null; do
      printf '\r\033[2K%s %s' "${spinner_frames[frame_index]}" "$start_message"
      frame_index=$(( (frame_index + 1) % ${#spinner_frames[@]} ))
      sleep 0.1
    done
  else
    printf '[ ] %s\n' "$start_message"
  fi

  if wait "$command_pid"; then
    command_status=0
  else
    command_status=$?
  fi

  if [ "$command_status" -eq 0 ]; then
    if [ -t 1 ]; then
      printf '\r\033[2K[x] %s\n' "$done_message"
    else
      printf '[x] %s\n' "$done_message"
    fi
    rm -f "$log_file"
    return 0
  fi

  if [ -t 2 ]; then
    printf '\r\033[2K[!] %s\n' "$start_message" >&2
  else
    printf '[!] %s\n' "$start_message" >&2
  fi
  cat "$log_file" >&2
  rm -f "$log_file"
  return "$command_status"
}

# Run package-manager commands quietly, but preserve their diagnostics on failure.
run_quietly() {
  local log_file status
  log_file="$(mktemp)"
  set +e
  "$@" >"$log_file" 2>&1
  status=$?
  set -e
  if [ "$status" -ne 0 ]; then
    cat "$log_file" >&2
    rm -f "$log_file"
    return "$status"
  fi
  rm -f "$log_file"
}
