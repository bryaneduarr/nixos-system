local lsp_progress = require("config.statusline.lsp-progress")
local mini_icons = require("mini.icons")

local M = {}

local highlights = {
  StatusLine = { bg = "none" },
  StatuslineModeNormal = { fg = "#282828", bg = "#83a598", bold = true },
  StatuslineModeInsert = { fg = "#282828", bg = "#b8bb26", bold = true },
  StatuslineModeVisual = { fg = "#282828", bg = "#fe8019", bold = true },
  StatuslineModeReplace = { fg = "#282828", bg = "#fb4934", bold = true },
  StatuslineModeCommand = { fg = "#282828", bg = "#d3869b", bold = true },
  StatuslineModeTerminal = { fg = "#282828", bg = "#8ec07c", bold = true },
  StatuslineDiagnosticError = { fg = "#fb4934", bold = true },
  StatuslineDiagnosticWarn = { fg = "#fabd2f", bold = true },
  StatuslineDiagnosticInfo = { fg = "#83a598", bold = true },
  StatuslineDiagnosticHint = { fg = "#8ec07c", bold = true },
  StatuslineGitAdded = { fg = "#b8bb26", bold = true },
  StatuslineGitChanged = { fg = "#fe8019", bold = true },
  StatuslineGitRemoved = { fg = "#fb4934", bold = true },
}

for name, highlight in pairs(highlights) do
  vim.api.nvim_set_hl(0, name, highlight)
end

local modes = {
  ["n"] = { "NORMAL", "StatuslineModeNormal" },
  ["i"] = { "INSERT", "StatuslineModeInsert" },
  ["v"] = { "VISUAL", "StatuslineModeVisual" },
  ["V"] = { "V-LINE", "StatuslineModeVisual" },
  ["\22"] = { "V-BLOCK", "StatuslineModeVisual" },
  ["s"] = { "SELECT", "StatuslineModeVisual" },
  ["S"] = { "S-LINE", "StatuslineModeVisual" },
  ["\19"] = { "S-BLOCK", "StatuslineModeVisual" },
  ["R"] = { "REPLACE", "StatuslineModeReplace" },
  ["r"] = { "REPLACE", "StatuslineModeReplace" },
  ["Rv"] = { "V-REPLACE", "StatuslineModeReplace" },
  ["c"] = { "COMMAND", "StatuslineModeCommand" },
  ["cv"] = { "VIM EX", "StatuslineModeCommand" },
  ["ce"] = { "EX", "StatuslineModeCommand" },
  ["!"] = { "SHELL", "StatuslineModeTerminal" },
  ["t"] = { "TERMINAL", "StatuslineModeTerminal" },
}

local function mode()
  local current = modes[vim.api.nvim_get_mode().mode] or { "UNKNOWN", "StatuslineModeNormal" }
  return string.format("%%#%s# %s %%*", current[2], current[1])
end

local function file_name()
  local name = vim.fn.expand("%:t")
  if name == "" then
    return "[No Name]"
  end
  return string.format("%s %s", mini_icons.get("file", name), name)
end

local function colored_counts(counts)
  local parts = {}
  for _, count in ipairs(counts) do
    if count[2] and count[2] > 0 then
      table.insert(parts, string.format("%%#%s#%s%d%%*", count[1], count[3], count[2]))
    end
  end
  return parts
end

local function git_status()
  local git = vim.b.gitsigns_status_dict
  if not git or git.head == "" then
    return ""
  end

  local changes = colored_counts({
    { "StatuslineGitAdded", git.added, "+" },
    { "StatuslineGitChanged", git.changed, "~" },
    { "StatuslineGitRemoved", git.removed, "-" },
  })
  if #changes == 0 then
    return git.head
  end
  return string.format("%s [%s]", git.head, table.concat(changes, " "))
end

-- Reused in insert mode so the counts do not flicker while typing.
local last_diagnostics = ""

local function diagnostics()
  if vim.bo.filetype == "lazy" then
    return ""
  end
  if vim.startswith(vim.api.nvim_get_mode().mode, "i") then
    return last_diagnostics
  end

  local counts = vim.diagnostic.count(0)
  local severity = vim.diagnostic.severity
  last_diagnostics = table.concat(
    colored_counts({
      { "StatuslineDiagnosticError", counts[severity.ERROR], "E:" },
      { "StatuslineDiagnosticWarn", counts[severity.WARN], "W:" },
      { "StatuslineDiagnosticInfo", counts[severity.INFO], "I:" },
      { "StatuslineDiagnosticHint", counts[severity.HINT], "H:" },
    }),
    " "
  )
  return last_diagnostics
end

function M.render()
  local right = vim.tbl_filter(function(part)
    return part ~= ""
  end, { lsp_progress.render(), git_status(), diagnostics() })
  table.insert(right, string.format("%d:%d", vim.fn.line("."), vim.fn.col(".")))

  return string.format("%s %s %%h%%m%%r%%= %s", mode(), file_name(), table.concat(right, " "))
end

vim.o.statusline = "%!v:lua.require'config.statusline'.render()"

vim.api.nvim_create_autocmd("ModeChanged", {
  group = vim.api.nvim_create_augroup("statusline_mode_change", { clear = true }),
  desc = "Redraw the statusline so the mode color updates immediately",
  callback = function()
    vim.cmd.redrawstatus()
  end,
})

return M
