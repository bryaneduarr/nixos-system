-- Inspired by: https://github.com/MariaSolOs/dotfiles/blob/30838ba4e6ba60334b8c2185d40eca8be02e8ff3/.config/nvim/lua/statusline.lua#L128-L154
local M = {}

local spinner_frames = { "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" }
local spinner_index = 1
local spinner_timer = nil
local progress = {}

local function start_spinner()
  if spinner_timer then
    return
  end
  local timer = vim.uv.new_timer()
  if not timer then
    return
  end
  spinner_timer = timer
  timer:start(
    0,
    100,
    vim.schedule_wrap(function()
      spinner_index = spinner_index % #spinner_frames + 1
      vim.cmd.redrawstatus()
    end)
  )
end

local function stop_spinner()
  if spinner_timer then
    spinner_timer:stop()
    spinner_timer:close()
    spinner_timer = nil
  end
end

vim.api.nvim_create_autocmd("LspProgress", {
  group = vim.api.nvim_create_augroup("statusline_lsp_progress", { clear = true }),
  desc = "Update LSP progress in statusline",
  pattern = { "begin", "end" },
  callback = function(args)
    if not args.data then
      return
    end

    local client = vim.lsp.get_client_by_id(args.data.client_id)
    if not client then
      return
    end

    local value = args.data.params.value
    progress = {
      client = client.name,
      title = value.kind ~= "end" and value.title or nil,
    }

    if value.kind == "end" then
      stop_spinner()
      vim.defer_fn(vim.cmd.redrawstatus, 3000)
    else
      start_spinner()
      vim.cmd.redrawstatus()
    end
  end,
})

---@return string
function M.render()
  if not progress.title or vim.startswith(vim.api.nvim_get_mode().mode, "i") then
    return ""
  end
  return string.format("%s 󰒋 %s %s", spinner_frames[spinner_index], progress.client, progress.title)
end

return M
