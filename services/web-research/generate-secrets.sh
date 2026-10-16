install -d -m 0750 -o root -g "$SECRETS_GROUP" "$SECRETS_DIR"

ensure_secret() {
  local file="$SECRETS_DIR/$1"
  local variable="$2"
  local group="$3"
  local mode="$4"

  if [ ! -s "$file" ]; then
    printf '%s=%s\n' "$variable" "$(openssl rand -hex 32)" >"$file"
  fi
  chown "root:$group" "$file"
  chmod "$mode" "$file"
}

ensure_secret searx.env SEARX_SECRET_KEY root 0600
ensure_secret crawl4ai.env CRAWL4AI_API_TOKEN "$SECRETS_GROUP" 0640
