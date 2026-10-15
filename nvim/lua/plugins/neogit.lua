return {
  "NeogitOrg/neogit",
  cmd = "Neogit",
  dependencies = {
    "nvim-lua/plenary.nvim",
    "sindrets/diffview.nvim",
    "ibhagwan/fzf-lua",
  },
  opts = {
    disable_hint = true,
  },
  keys = {
    { "<leader>gg", "<CMD>Neogit<CR>", desc = "Open Neogit" },
  },
}
