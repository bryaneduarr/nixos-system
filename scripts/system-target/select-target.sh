select_system_target() {
  local architecture host kernel_release hostname

  if [ -n "${NIXOS_REBUILD_TARGET:-}" ]; then
    rebuild_target="$NIXOS_REBUILD_TARGET"
    case "$rebuild_target" in
      nixos|wsl-x86_64) rebuild_system_architecture="x86_64-linux" ;;
      wsl-aarch64) rebuild_system_architecture="aarch64-linux" ;;
      *) printf 'Unknown NIXOS_REBUILD_TARGET: %s\n' "$rebuild_target" >&2; return 1 ;;
    esac
    set_system_build_limits
    return 0
  fi

  host="$(uname -s)" || return 1
  architecture="$(uname -m)" || return 1
  kernel_release="$(uname -r)" || return 1

  if [ "$host" != Linux ]; then
    printf 'Unsupported host: %s\n' "$host" >&2
    return 1
  fi

  case "$architecture" in
    x86_64) rebuild_system_architecture="x86_64-linux" ;;
    aarch64|arm64) rebuild_system_architecture="aarch64-linux" ;;
    *) printf 'Unsupported architecture: %s\n' "$architecture" >&2; return 1 ;;
  esac

  if [[ "${kernel_release,,}" == *microsoft* || -n "${WSL_DISTRO_NAME:-}" || -n "${WSL_INTEROP:-}" ]]; then
    rebuild_target="wsl-${rebuild_system_architecture%-linux}"
  elif [ "$rebuild_system_architecture" = x86_64-linux ]; then
    hostname="$(uname -n)" || return 1
    if [ "$hostname" != nixos ]; then
      printf 'No native configuration for host %s. Set NIXOS_REBUILD_TARGET explicitly if this machine uses the existing hardware configuration.\n' "$hostname" >&2
      return 1
    fi
    rebuild_target=nixos
  else
    printf 'No native configuration for %s\n' "$rebuild_system_architecture" >&2
    return 1
  fi

  set_system_build_limits
}

set_system_build_limits() {
  build_limit_args=()
  case "$rebuild_target" in
    wsl-*) build_limit_args=(--max-jobs 1 --cores 2) ;;
  esac
}

show_system_target() {
  printf 'NixOS target: %s#%s (%s)\n' "$flake_ref" "$rebuild_target" "$rebuild_system_architecture"
}
