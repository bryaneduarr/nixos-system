return {
  "stevearc/oil.nvim",
  lazy = false,
  dependencies = { { "echasnovski/mini.icons", opts = {} } },
  opts = {
    columns = { "icon" },
    skip_confirm_for_simple_edits = true,
    view_options = {
      show_hidden = true,
      is_hidden_file = function(name)
        return vim.startswith(name, ".")
      end,
    },
  },
  keys = {
    { "-", "<CMD>Oil<CR>", desc = "Open Oil.nvim buffer" },
  },
}
