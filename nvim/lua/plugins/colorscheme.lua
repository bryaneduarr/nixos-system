return {
  "sainnhe/gruvbox-material",
  lazy = false,
  priority = 1000,
  config = function()
    vim.cmd.colorscheme("gruvbox-material")
    vim.cmd([[hi Normal guibg=NONE ctermbg=NONE]])
    vim.cmd([[hi NormalNC guibg=NONE ctermbg=NONE]])
  end,
}
