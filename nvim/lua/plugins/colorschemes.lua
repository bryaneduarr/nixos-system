return {
  "nyoom-engineering/oxocarbon.nvim",
  "sainnhe/everforest",
  "Mofiqul/vscode.nvim",
  "Yazeed1s/oh-lucy.nvim",
  {
    "catppuccin/nvim",
    name = "catppuccin",
    config = function(_, _)
      -- vim.cmd.colorscheme("catppuccin-mocha")
      -- Transparency for the color-scheme.
      -- vim.cmd([[hi Normal guibg=NONE ctermbg=NONE]])
      -- Transparency for inactive windows.
      -- vim.cmd([[hi NormalNC guibg=NONE ctermbg=NONE]])
    end,
  },
  {
    "dgox16/oldworld.nvim",
    opts = {
      variant = "default",
    },
    config = function(_, _)
      vim.cmd.colorscheme("oldworld")
      -- Transparency for the color-scheme.
      vim.cmd([[hi Normal guibg=NONE ctermbg=NONE]])
      -- Transparency for inactive windows.
      vim.cmd([[hi NormalNC guibg=NONE ctermbg=NONE]])
    end,
  },
  {
    "sainnhe/gruvbox-material",
    config = function(_, _)
      -- vim.cmd.colorscheme("gruvbox-material")
      -- Transparency for the color-scheme.
      -- vim.cmd([[hi Normal guibg=NONE ctermbg=NONE]])
      -- Transparency for inactive windows.
      -- vim.cmd([[hi NormalNC guibg=NONE ctermbg=NONE]])
    end,
  },
  {
    "projekt0n/github-nvim-theme",
    name = "github-theme",
    lazy = false,
    priority = 1000,
    config = function()
      -- vim.cmd("colorscheme github_dark_dimmed")
      -- Transparency for the color-scheme.
      -- vim.cmd([[hi Normal guibg=NONE ctermbg=NONE]])
      -- Transparency for inactive windows.
      -- vim.cmd([[hi NormalNC guibg=NONE ctermbg=NONE]])
    end,
  },
  {
    "oskarnurm/koda.nvim",
    lazy = false, -- make sure we load this during startup if it is your main colorscheme
    priority = 1000, -- make sure to load this before all the other start plugins
    config = function()
      -- require("koda").setup({ transparent = true })
      -- vim.cmd("colorscheme koda")

      -- Set spell highlighting after colorscheme loads.
      vim.api.nvim_set_hl(0, "SpellBad", { underline = true })
      vim.api.nvim_set_hl(0, "SpellCap", { underline = true })
      vim.api.nvim_set_hl(0, "SpellRare", { underline = true })
    end,
  },
}
