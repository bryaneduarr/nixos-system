return {
  "saghen/blink.cmp",
  dependencies = {
    "rafamadriz/friendly-snippets",
    "L3MON4D3/LuaSnip",
  },
  version = "1.*",
  opts = {
    completion = {
      menu = { auto_show = false },
      list = {
        -- Insert items while navigating the completion list.
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
}
