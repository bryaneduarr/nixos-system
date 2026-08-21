_: ''
  cmd="''${1:-}"
  case "$cmd" in
    status)  cmd_status ;;
    start)   cmd_start ;;
    stop)    cmd_stop ;;
    restart) cmd_stop; cmd_start ;;
    help|-h|--help)
      echo "usage: onedrive {status|start|stop|restart}";;
    *)
      echo "onedrive: unknown subcommand '$cmd'" >&2
      echo "usage: onedrive {status|start|stop|restart}" >&2
      exit 1 ;;
  esac
''
