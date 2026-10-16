if [ -L "$server_env" ] && [ -e "$server_env" ]; then
  env_state=link
  original_env_target="$(readlink "$server_env")"
elif [ -f "$server_env" ]; then
  env_state=file
  cp "$server_env" "$runtime_dir/original.env"
else
  env_state=missing
fi

cp -L "$env_source" "$runtime_dir/server.env"
sed -i \
  -e "s#^SERVER_URL=.*#SERVER_URL=http://localhost:$server_port#" \
  -e "s#^CLIENT_URL=.*#CLIENT_URL=http://localhost:$client_port#" \
  -e "s#^ADMIN_URL=.*#ADMIN_URL=http://localhost:$admin_port#" \
  -e "s#^PORT=.*#PORT=$server_port#" \
  "$runtime_dir/server.env"
