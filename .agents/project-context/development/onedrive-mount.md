# OneDrive mount

Evidence: 2026-10-16 UTC; `d4358b4` plus uncommitted cache defaults in [onedrive.home.nix](../../../packages/onedrive/onedrive.home.nix); timed on the live mount.

- Uncached directory listing costs ~0.6 s; first file read ~1.9 s; cached reads 0 s.
- Remote reports `ChangeNotify`, so long `--dir-cache-time` stays current via polling.
- Directory cache is memory-only; reboots refill it lazily. Full-drive delta listing exceeded 6 minutes, so `--vfs-refresh` was skipped.
- `cacheDir` option is created but not passed to rclone.
