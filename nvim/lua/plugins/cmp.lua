return {
  "saghen/blink.cmp",
  lazy = false,
  dependencies = {
    "rafamadriz/friendly-snippets",
    "L3MON4D3/LuaSnip",
  },
  version = "1.*",
  opts = {
    completion = {
      menu = { auto_show = true },
      list = {
        selection = { preselect = false, auto_insert = true },
      },
      documentation = { auto_show = true, auto_show_delay_ms = 0 },
    },
    snippets = { preset = "luasnip" },
    sources = {
      default = { "lsp", "path", "snippets", "buffer" },
    },
    fuzzy = { implementation = "prefer_rust_with_warning" },
  },
  opts_extend = { "sources.default" },
  keys = {
    -- Adapted from: https://github.com/MariaSolOs/dotfiles/blob/3f5badf4ba9a810bd5f2b5d94acff144a05e7d5e/.config/nvim/lua/keymaps.lua#L32C1-L39C81
    {
      "<esc>",
      function()
        if require("luasnip").expand_or_jumpable() then
          require("luasnip").unlink_current()
        end
        vim.cmd("noh")
        return "<esc>"
      end,
      mode = { "i", "s", "n" },
      expr = true,
      desc = "Escape, clear hlsearch, and stop snippet session",
    },
  },
}
