-- Inspiration from: https://github.com/MariaSolOs/dotfiles/blob/main/.config/nvim/lua/winbar.lua
local M = {}

--- Window bar that shows the current file path (in a fancy way).
---@return string
function M.render()
  -- Get the path and expand variables.
  local path = vim.fs.normalize(vim.fn.expand("%:p") --[[@as string]])

  -- No special styling for diff views.
  if vim.startswith(path, "diffview") then
    return string.format("%%#Winbar#%s", path)
  end

  -- Replace slashes by arrows.
  local separator = " %#WinbarSeparator# "

  local prefix, prefix_path = "", ""

  -- If the window gets too narrow, shorten the path and drop the prefix.
  if vim.api.nvim_win_get_width(0) < math.floor(vim.o.columns / 3) then
    path = vim.fn.pathshorten(path)
  else
    -- For some special folders, add a prefix instead of the full path (making
    -- sure to pick the longest prefix).
    ---@type table<string, string>
    local special_dirs = {
      -- CODE = vim.g.projects_dir,
      -- DOTFILES = vim.env.XDG_CONFIG_HOME,
      -- GIT = vim.g.work_projects_dir,
      -- HOME = vim.env.HOME .. "/workspace",
      -- PALANTIR = vim.g.work_projects_dir .. "/Palantir",
      -- PERSONAL = vim.g.personal_projects_dir,
    }
    for dir_name, dir_path in pairs(special_dirs) do
      if vim.startswith(path, vim.fs.normalize(dir_path)) and #dir_path > #prefix_path then
        prefix, prefix_path = dir_name, dir_path
      end
    end
    if prefix ~= "" then
      path = path:gsub("^" .. prefix_path, "")
      prefix = string.format("%%#WinBarDir#%s%s", prefix, separator)
    end
  end

  -- Remove leading slash.
  path = path:gsub("^/", "")

  -- Split the path into segments
  local segments = vim.split(path, "/")

  -- Only show the last 4 segments (3 directories + filename)
  -- If path is shorter than 4 segments, show all segments
  local display_segments = {}
  local total_segments = #segments
  local start_idx = math.max(1, total_segments - 3)

  -- Add ellipsis if we're truncating the path
  if start_idx > 1 then
    table.insert(display_segments, string.format("%%#WinBarSeparator#%s", "..."))
  end

  -- Add the last 4 segments (or fewer if path is shorter)
  for i = start_idx, total_segments do
    table.insert(display_segments, string.format("%%#Winbar#%s", segments[i]))
  end

  return table.concat({
    " ",
    prefix,
    table.concat(display_segments, separator),
  })
end

vim.api.nvim_create_autocmd("BufWinEnter", {
  group = vim.api.nvim_create_augroup("bryaneduarr/winbar", { clear = true }),
  desc = "Attach winbar",
  callback = function(args)
    if
      not vim.api.nvim_win_get_config(0).zindex -- Not a floating window
      and vim.bo[args.buf].buftype == "" -- Normal buffer
      and vim.api.nvim_buf_get_name(args.buf) ~= "" -- Has a file name
      and not vim.wo[0].diff -- Not in diff mode
    then
      vim.wo.winbar = "%{%v:lua.require'config.winbar'.render()%}"
    end
  end,
})

return M
