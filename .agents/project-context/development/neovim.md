# Neovim

Evidence: 2026-10-16 UTC; `d4358b4`; only this note changed; activation not rerun.

- [packages/neovim](../../../packages/neovim/neovim.home.nix) links `~/.config/nvim` to the checkout and installs Spanish spell files.
- Unmanaged `~/.config/nvim` and `~/.local/bin/t3code` blocked activation; both were renamed with suffix `.pre-home-manager-20261016T032118Z`. Keep the backups until a rebuild succeeds.
- Mason installs clangd and clang-format only on x86_64.
- [nvim/.luarc.json](../../../nvim/.luarc.json) configures lua_ls; the CLI check needs `VIMRUNTIME` exported, else it reports two false warnings. Zero diagnostics on 2026-10-15.
