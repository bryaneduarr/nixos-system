# Playwright

Evidence: 2026-10-15 UTC; `8624264` plus uncommitted module; library set smoke-tested, not activated.

- [packages/playwright](../../../packages/playwright/playwright.system.nix) adds nix-ld libraries and skips Playwright's host check; enabled only in [hosts/wsl/wsl.nix](../../../hosts/wsl/wsl.nix).
- On aarch64, downloaded Chromium, headless shell, and Firefox ran headless against that library set.
- WebKit needs library versions nixpkgs does not ship; it runs only in CI.
