is_port_free() {
  ! ss -H -ltn "sport = :$1" | grep -q .
}

base_port=3000
while true; do
  block_is_free=true
  for offset in 0 1 2 3; do
    if ! is_port_free "$((base_port + offset))"; then
      block_is_free=false
      break
    fi
  done

  if [ "$block_is_free" = true ]; then
    break
  fi

  base_port=$((base_port + 4))
done

client_port="$base_port"
server_port="$((base_port + 1))"
web_port="$((base_port + 2))"
admin_port="$((base_port + 3))"
