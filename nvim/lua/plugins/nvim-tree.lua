-- Git signs reuse the statusline colors: green added, orange changed, red removed.
local git_highlights = {
  NvimTreeGitStagedIcon = "StatuslineGitAdded",
  NvimTreeGitNewIcon = "StatuslineGitAdded",
  NvimTreeGitDirtyIcon = "StatuslineGitChanged",
  NvimTreeGitRenamedIcon = "StatuslineGitChanged",
  NvimTreeGitDeletedIcon = "StatuslineGitRemoved",
  NvimTreeGitMergeIcon = "StatuslineGitRemoved",
}

return {
  "nvim-tree/nvim-tree.lua",
  lazy = false,
  opts = {
    on_attach = function(bufnr)
      local api = require("nvim-tree.api")

      local function opts(desc)
        return { desc = "nvim-tree: " .. desc, buffer = bufnr, noremap = true, silent = true, nowait = true }
      end

      api.map.on_attach.default(bufnr)

      vim.keymap.set("n", "l", api.node.open.edit, opts("Open"))
      vim.keymap.set("n", "h", api.node.navigate.parent_close, opts("Close"))
    end,
    filters = { dotfiles = false },
    disable_netrw = true,
    hijack_cursor = true,
    sync_root_with_cwd = true,
    update_focused_file = {
      enable = true,
      update_root = false,
    },
    view = {
      width = 30,
      preserve_window_proportions = true,
    },
    renderer = {
      root_folder_label = false,
      highlight_git = true,
      indent_markers = { enable = true },
      icons = {
        glyphs = {
          default = "󰈚",
          folder = {
            default = "",
            empty = "",
            empty_open = "",
            open = "",
            symlink = "",
          },
          git = {
            staged = "+",
            untracked = "?",
            unstaged = "~",
            renamed = ">",
            deleted = "-",
            unmerged = "!",
            ignored = ".",
          },
        },
      },
    },
  },
  config = function(_, opts)
    require("nvim-tree").setup(opts)

    -- gruvbox-material gives the sidebar its own background; clear it to match Normal.
    for _, group in ipairs({ "NvimTreeNormal", "NvimTreeEndOfBuffer" }) do
      vim.cmd.highlight(group .. " guibg=NONE ctermbg=NONE")
    end
    for group, target in pairs(git_highlights) do
      vim.api.nvim_set_hl(0, group, { link = target })
    end
  end,
  keys = {
    {
      "<leader>e",
      function()
        local api = require("nvim-tree.api")
        if vim.bo.filetype == "NvimTree" then
          api.tree.toggle()
        else
          api.tree.focus()
        end
      end,
      desc = "Toggle or focus nvim-tree sidebar",
    },
  },
}
