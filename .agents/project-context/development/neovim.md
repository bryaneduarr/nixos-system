# Neovim

Evidence: 2026-10-15 UTC; `cd6e560` plus uncommitted refactor; headless-checked, not activated.

- [modules/home/neovim](../../../modules/home/neovim/default.nix) links `~/.config/nvim` to the checkout and installs Spanish spell files.
- 2026-10-15: the old copied `~/.config/nvim` blocked activation; it was moved to `~/.config/nvim.pre-link-backup`. Switch not yet rerun.
- Mason installs clangd and clang-format only on x86_64.
- [nvim/.luarc.json](../../../nvim/.luarc.json) configures lua_ls for the editor and the CLI check; both reported zero diagnostics.
