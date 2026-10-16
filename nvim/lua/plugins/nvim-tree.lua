local git_highlights = {
  NvimTreeGitStagedIcon = "StatuslineGitAdded",
  NvimTreeGitNewIcon = "StatuslineGitAdded",
  NvimTreeGitDirtyIcon = "StatuslineGitChanged",
  NvimTreeGitRenamedIcon = "StatuslineGitChanged",
  NvimTreeGitDeletedIcon = "StatuslineGitRemoved",
  NvimTreeGitMergeIcon = "StatuslineGitRemoved",
}

---@param status nvim_tree.git.Status
---@return boolean
local function has_pending_changes(status)
  if status.file and status.file ~= "!!" then
    return true
  end
  for _, xys in pairs(status.dir or {}) do
    for _, xy in ipairs(xys) do
      if xy ~= "!!" then
        return true
      end
    end
  end
  return false
end

-- The builtin Git decorator lists every child status on a folder; folders only show one pending mark instead.
local function create_git_folder_decorator()
  ---@class (exact) GitFolderDecorator: nvim_tree.api.Decorator
  ---@field private pending_icon nvim_tree.api.highlighted_string
  local GitFolderDecorator = require("nvim-tree.api").Decorator:extend()

  function GitFolderDecorator:new()
    self.enabled = true
    self.highlight_range = "name"
    self.icon_placement = "right_align"
    self.pending_icon = { str = "~", hl = { "NvimTreeGitDirtyIcon" } }
  end

  ---@param node nvim_tree.api.Node
  ---@return boolean
  local function is_pending_folder(node)
    return node.type == "directory" and node.git_status ~= nil and has_pending_changes(node.git_status)
  end

  ---@param node nvim_tree.api.Node
  ---@return nvim_tree.api.highlighted_string[]?
  function GitFolderDecorator:icons(node)
    return is_pending_folder(node) and { self.pending_icon } or nil
  end

  ---@param node nvim_tree.api.Node
  ---@return string?
  function GitFolderDecorator:highlight_group(node)
    return is_pending_folder(node) and "NvimTreeGitFolderDirtyHL" or nil
  end

  return GitFolderDecorator
end

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
    git = { show_on_dirs = false },
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
      indent_markers = {
        enable = true,
        icons = { corner = "|", edge = "|", item = "|", bottom = "-" },
      },
      icons = {
        git_placement = "right_align",
        show = { folder_arrow = false },
        symlink_arrow = " -> ",
        web_devicons = { file = { enable = false } },
        glyphs = {
          default = "-",
          symlink = "@",
          bookmark = "m",
          modified = "*",
          folder = {
            default = "/",
            empty = "/",
            empty_open = "/",
            open = "/",
            symlink = "@",
            symlink_open = "@",
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
    -- The decorator class needs nvim-tree loaded, so it cannot be built in the spec table.
    opts.renderer.decorators =
      { "Git", create_git_folder_decorator(), "Open", "Hidden", "Modified", "Bookmark", "Diagnostics", "Copied", "Cut" }
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
