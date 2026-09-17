release_json="$(curl --fail --location --retry 3 --silent --show-error "$api_url")"
version="$(jq -r '[.[] | select(.prerelease == true and (.tag_name | contains("nightly")))] | first | .tag_name | ltrimstr("v")' <<<"$release_json")"
asset_url="https://github.com/pingdotgg/t3code/releases/download/v${version}/T3-Code-${version}-x86_64.AppImage"
