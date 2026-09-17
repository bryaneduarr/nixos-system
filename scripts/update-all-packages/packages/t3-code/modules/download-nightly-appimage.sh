tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT

curl --fail --location --retry 3 --silent --show-error "$asset_url" --output "$tmp_file"
sha256="$(sha256sum "$tmp_file" | awk '{ print $1 }')"
hash="$(nix hash convert --hash-algo sha256 --from base16 --to sri "$sha256")"
