# Neovim

These rules are mandatory for files under `nvim/`. The configuration stays plain Lua with lazy.nvim and Mason. Do not convert it to Nix.

- Keep editor settings, keymaps, autocommands, and UI pieces in `nvim/lua/config/`, one responsibility per file.
- Keep one plugin spec per file in `nvim/lua/plugins/<plugin>.lua`, returning the lazy.nvim spec table. Plugin-specific keymaps and options live in that spec.
- Format with the repository `nvim/stylua.toml` settings.
- Use `vim.keymap.set` with a `desc` for every mapping, and `vim.api.nvim_create_autocmd` with a named augroup.
- Do not edit `nvim/lazy-lock.json` by hand. Plugin updates happen through lazy.nvim deliberately.
- Home Manager copies `nvim/` into `~/.config/nvim` during activation, so Neovim changes take effect after a rebuild. Do not edit `~/.config/nvim` directly.
