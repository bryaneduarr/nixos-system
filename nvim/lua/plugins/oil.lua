return {
  "stevearc/oil.nvim",
  -- dependencies = { { "echasnovski/mini.icons", opts = {} } },
  opts = {
    columns = {
      -- "icon",
      -- "permissions",
      -- "size",
      -- "mtime",
    },
    skip_confirm_for_simple_edits = true,
    view_options = {
      show_hidden = true,
      -- This function defines what is considered a "hidden" file
      is_hidden_file = function(name, bufnr)
        return vim.startswith(name, ".")
      end,
    },
  },
}
