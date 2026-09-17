{ appimage-run }:
''
  runHook preInstall

  install -Dm755 "$src" "$out/libexec/t3code.AppImage"
  makeWrapper "${appimage-run}/bin/appimage-run" "$out/bin/t3code" \
    --add-flags "$out/libexec/t3code.AppImage"

  install -Dm644 /dev/stdin "$out/share/applications/t3code.desktop" <<'EOF'
  [Desktop Entry]
  Name=T3 Code
  Comment=GUI for coding agents
  Exec=t3code %U
  Terminal=false
  Type=Application
  Categories=Development;IDE;
  EOF

  runHook postInstall
''
