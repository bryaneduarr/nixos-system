sed -i -E "s/version = \"[^\"]+\";/version = \"$version\";/" "$package_file"
sed -i -E "s|url = \"https://github.com/pingdotgg/t3code/releases/download/[^\"]+\";|url = \"https://github.com/pingdotgg/t3code/releases/download/v${version}/T3-Code-${version}-x86_64.AppImage\";|" "$package_file"
sed -i -E "s|hash = \"sha256-[^\"]+\";|hash = \"$hash\";|" "$package_file"

git -C "$repo_root" diff -- "$package_file"
printf '\nUpdated T3 Code nightly to %s. Build with: nix build .#t3code\n' "$version"
