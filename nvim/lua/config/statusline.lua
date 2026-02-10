-- Track the LSP progress..
local progress_status = {}

-- Spinner animation frames.
local spinner_frames = { "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" }
local spinner_index = 1

-- Timer for spinner animation.
local spinner_timer = nil

-- Get mini.icons for file type icons.
local mini_icons = require("mini.icons")

-- Show filename with file type icon (minimal approach).
_G.file_name_component = function()
  local filename = vim.fn.expand("%:t")

  -- If no filename, show [No Name]
  if filename == "" then
    return "[No Name]"
  end

  -- Get file type icon and highlight from mini.icons
  local file_icon = mini_icons.get("file", filename)

  -- Format with icon, highlight, and filename
  if file_icon then
    return string.format("%s %s", file_icon, filename)
  else
    return filename
  end
end

-- Word and character count component.
_G.word_count_component = function()
  local mode = vim.api.nvim_get_mode().mode

  -- Check if we're in visual mode (selection).
  if mode == "v" or mode == "V" or mode == "" then
    local start_pos = vim.fn.getpos("'<")
    local end_pos = vim.fn.getpos("'>")
    local lines_selected = end_pos[2] - start_pos[2] + 1
    return string.format("%dL", lines_selected)
  end

  -- Get buffer content.
  local lines = vim.api.nvim_buf_get_lines(0, 0, -1, false)
  local content = table.concat(lines, "\n")

  -- Count words and characters.
  local word_count = 0
  for word in content:gmatch("%S+") do
    word_count = word_count + 1
  end

  local char_count = #content

  return string.format("Wor:%d|Char:%d", word_count, char_count)
end

-- Store last diagnostic component value to avoid flicker in insert mode.
local last_diagnostic_component = ""

-- Simple VCS status showing branch and changes with colors.
_G.vcs_status = function()
  local git_info = vim.b.gitsigns_status_dict

  if not git_info or git_info.head == "" then
    return ""
  end

  local status_parts = {}

  -- Branch name with icon.
  table.insert(status_parts, string.format("%s", git_info.head))

  -- Changes count (added, modified, removed) with colors.
  local changes = {}
  if git_info.added and git_info.added > 0 then
    table.insert(changes, string.format("%%#StatuslineGitAdded#+%d%%*", git_info.added))
  end
  if git_info.changed and git_info.changed > 0 then
    table.insert(changes, string.format("%%#StatuslineGitChanged#~%d%%*", git_info.changed))
  end
  if git_info.removed and git_info.removed > 0 then
    table.insert(changes, string.format("%%#StatuslineGitRemoved#-%d%%*", git_info.removed))
  end

  if #changes > 0 then
    table.insert(status_parts, string.format("[%s]", table.concat(changes, " ")))
  end

  return table.concat(status_parts, " ")
end

-- Create autocmd to track LSP progress for statusline updates.
-- Inspiration from: https://github.com/MariaSolOs/dotfiles/blob/30838ba4e6ba60334b8c2185d40eca8be02e8ff3/.config/nvim/lua/statusline.lua#L128-L154
vim.api.nvim_create_autocmd("LspProgress", {
  group = vim.api.nvim_create_augroup("statusline_lsp_progress", { clear = true }),
  desc = "Update LSP progress in statusline",
  pattern = { "begin", "end" },
  callback = function(args)
    -- This should in theory never happen, but I've seen weird errors.
    if not args.data then
      return
    end

    -- Get the client and progress details.
    progress_status = {
      client = vim.lsp.get_client_by_id(args.data.client_id).name,
      kind = args.data.params.value.kind,
      title = args.data.params.value.title,
    }

    if progress_status.kind == "end" then
      progress_status.title = nil

      -- Stop spinner animation
      if spinner_timer then
        spinner_timer:stop()
        spinner_timer = nil
      end

      -- Wait a bit before clearing the status.
      vim.defer_fn(function()
        vim.cmd.redrawstatus()
      end, 3000)
    else
      -- Start spinner animation
      if not spinner_timer then
        spinner_timer = vim.loop.new_timer()
        spinner_timer:start(
          0,
          100,
          vim.schedule_wrap(function()
            spinner_index = spinner_index % #spinner_frames + 1
            vim.cmd.redrawstatus()
          end)
        )
      end

      vim.cmd.redrawstatus()
    end
  end,
})

--- Display the latest LSP progress message with spinner animation.
---@return string LSP
_G.lsp_progress = function()
  -- If no progress status is available, return an empty string.
  if not progress_status.client or not progress_status.title then
    return ""
  end

  -- Avoid noisy messages while typing.
  if vim.startswith(vim.api.nvim_get_mode().mode, "i") then
    return ""
  end

  -- Get current spinner frame
  local spinner = spinner_frames[spinner_index]

  -- Get LSP icon (using generic LSP icon)
  local lsp_icon = "󰒋" -- LSP icon

  return string.format("%s %s %s %s", spinner, lsp_icon, progress_status.client, progress_status.title)
end

--- Diagnostic counts in the current buffer with colors.
---@return string Formatted diagnostic component for statusline
_G.diagnostics_component = function()
  -- Lazy uses diagnostic icons, but those aren't errors per se.
  if vim.bo.filetype == "lazy" then
    return ""
  end

  -- Use the last computed value if in insert mode.
  if vim.startswith(vim.api.nvim_get_mode().mode, "i") then
    return last_diagnostic_component
  end

  local counts = vim.iter(vim.diagnostic.get(0)):fold({
    ERROR = 0,
    WARN = 0,
    HINT = 0,
    INFO = 0,
  }, function(acc, diagnostic)
    local severity = vim.diagnostic.severity[diagnostic.severity]
    acc[severity] = acc[severity] + 1
    return acc
  end)

  local parts = {}

  -- Add errors
  if counts.ERROR > 0 then
    table.insert(parts, string.format("%%#StatuslineDiagnosticError#E:%d%%*", counts.ERROR))
  end

  -- Add warnings
  if counts.WARN > 0 then
    table.insert(parts, string.format("%%#StatuslineDiagnosticWarn#W:%d%%*", counts.WARN))
  end

  -- Add info
  if counts.INFO > 0 then
    table.insert(parts, string.format("%%#StatuslineDiagnosticInfo#I:%d%%*", counts.INFO))
  end

  -- Add hints
  if counts.HINT > 0 then
    table.insert(parts, string.format("%%#StatuslineDiagnosticHint#H:%d%%*", counts.HINT))
  end

  last_diagnostic_component = table.concat(parts, " ")
  return last_diagnostic_component
end

-- Define highlight groups for each mode, diagnostics, and git changes.
local function setup_highlights()
  -- Make the default StatusLine transparent
  vim.api.nvim_set_hl(0, "StatusLine", { bg = "none" })

  -- Mode highlights
  -- Normal mode
  vim.api.nvim_set_hl(0, "StatuslineModeNormal", {
    fg = "#282828",
    bg = "#83a598",
    bold = true,
  })

  -- Insert mode
  vim.api.nvim_set_hl(0, "StatuslineModeInsert", {
    fg = "#282828",
    bg = "#b8bb26",
    bold = true,
  })

  -- Visual mode
  vim.api.nvim_set_hl(0, "StatuslineModeVisual", {
    fg = "#282828",
    bg = "#fe8019",
    bold = true,
  })

  -- Replace mode
  vim.api.nvim_set_hl(0, "StatuslineModeReplace", {
    fg = "#282828",
    bg = "#fb4934",
    bold = true,
  })

  -- Command mode
  vim.api.nvim_set_hl(0, "StatuslineModeCommand", {
    fg = "#282828",
    bg = "#d3869b",
    bold = true,
  })

  -- Terminal mode
  vim.api.nvim_set_hl(0, "StatuslineModeTerminal", {
    fg = "#282828",
    bg = "#8ec07c",
    bold = true,
  })

  -- Diagnostic highlights
  -- Error
  vim.api.nvim_set_hl(0, "StatuslineDiagnosticError", {
    fg = "#fb4934",
    bold = true,
  })

  -- Warning
  vim.api.nvim_set_hl(0, "StatuslineDiagnosticWarn", {
    fg = "#fabd2f",
    bold = true,
  })

  -- Info
  vim.api.nvim_set_hl(0, "StatuslineDiagnosticInfo", {
    fg = "#83a598",
    bold = true,
  })

  -- Hint
  vim.api.nvim_set_hl(0, "StatuslineDiagnosticHint", {
    fg = "#8ec07c",
    bold = true,
  })

  -- Git change highlights
  -- Added
  vim.api.nvim_set_hl(0, "StatuslineGitAdded", {
    fg = "#b8bb26",
    bold = true,
  })

  -- Modified
  vim.api.nvim_set_hl(0, "StatuslineGitChanged", {
    fg = "#fe8019",
    bold = true,
  })

  -- Removed
  vim.api.nvim_set_hl(0, "StatuslineGitRemoved", {
    fg = "#fb4934",
    bold = true,
  })
end

-- Call this function to set up highlights.
setup_highlights()

-- Mode names and their corresponding highlight groups.
local mode_map = {
  ["n"] = { "NORMAL", "StatuslineModeNormal" },
  ["i"] = { "INSERT", "StatuslineModeInsert" },
  ["v"] = { "VISUAL", "StatuslineModeVisual" },
  ["V"] = { "V-LINE", "StatuslineModeVisual" },
  ["\22"] = { "V-BLOCK", "StatuslineModeVisual" }, -- <C-V>
  ["s"] = { "SELECT", "StatuslineModeVisual" },
  ["S"] = { "S-LINE", "StatuslineModeVisual" },
  ["\19"] = { "S-BLOCK", "StatuslineModeVisual" }, -- <C-S>
  ["R"] = { "REPLACE", "StatuslineModeReplace" },
  ["r"] = { "REPLACE", "StatuslineModeReplace" },
  ["Rv"] = { "V-REPLACE", "StatuslineModeReplace" },
  ["c"] = { "COMMAND", "StatuslineModeCommand" },
  ["cv"] = { "VIM EX", "StatuslineModeCommand" },
  ["ce"] = { "EX", "StatuslineModeCommand" },
  ["!"] = { "SHELL", "StatuslineModeTerminal" },
  ["t"] = { "TERMINAL", "StatuslineModeTerminal" },
}

-- Function to get mode component with color.
_G.mode_component = function()
  local current_mode = vim.api.nvim_get_mode().mode
  local mode_info = mode_map[current_mode] or { "UNKNOWN", "StatuslineModeNormal" }
  local mode_name = mode_info[1]
  local mode_hl = mode_info[2]

  -- Return the formatted string with highlight group
  -- %#HighlightGroup# applies the highlight
  -- %* resets to default StatusLine highlight
  return string.format("%%#%s# %s %%*", mode_hl, mode_name)
end

-- Function to return the complete statusline string.
_G.statusline_builder = function()
  local mode = mode_component()
  local filename = file_name_component()
  local lsp = lsp_progress()
  local vcs = vcs_status()
  local diag = diagnostics_component()

  -- Build left side
  local left = mode .. " " .. filename .. " %h%m%r"

  -- Build right side with proper spacing
  local right_parts = {}
  if lsp ~= "" then
    table.insert(right_parts, lsp)
  end
  if vcs ~= "" then
    table.insert(right_parts, vcs)
  end
  if diag ~= "" then
    table.insert(right_parts, diag)
  end
  table.insert(right_parts, string.format("%d:%d", vim.fn.line("."), vim.fn.col(".")))

  local right = table.concat(right_parts, " ")

  -- Combine with right align
  return left .. "%= " .. right
end

-- Configure the minimal statusline:
-- Left: mode indicator (colored), filename and buffer flags
-- Right: LSP progress, git status, diagnostics, line/column
vim.opt.statusline = "%!v:lua.statusline_builder()"

-- Force statusline redraw on mode change for immediate color updates
vim.api.nvim_create_autocmd("ModeChanged", {
  group = vim.api.nvim_create_augroup("statusline_mode_change", { clear = true }),
  pattern = "*",
  callback = function()
    vim.cmd.redrawstatus()
  end,
})
