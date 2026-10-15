# Neovim

These rules are mandatory for files under `nvim/`. The configuration stays plain Lua with lazy.nvim and Mason. Do not convert it to Nix.

- Keep editor settings, keymaps, autocommands, and UI pieces in `nvim/lua/config/`, one responsibility per file.
- Keep one plugin spec per file in `nvim/lua/plugins/<plugin>.lua`, returning the lazy.nvim spec table. Plugin-specific keymaps and options live in that spec.
- Format with the repository `nvim/stylua.toml` settings.
- Use `vim.keymap.set` with a `desc` for every mapping, and `vim.api.nvim_create_autocmd` with a named augroup.
- Do not edit `nvim/lazy-lock.json` by hand. Plugin updates happen through lazy.nvim deliberately.
- `modules/home/neovim` links `~/.config/nvim` to this checkout's `nvim/` folder, so edits apply on the next Neovim start without a rebuild. Edit files here, never through another copy.
