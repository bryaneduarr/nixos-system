require("config.settings")
require("config.lazy")
require("config.keymaps")
require("config.statusline")
require("config.winbar")
require("config.auto-cmds")

vim.lsp.config("lua_ls", {
  settings = {
    Lua = {
      workspace = {
        library = vim.api.nvim_get_runtime_file("", true),
      },
    },
  },
})
