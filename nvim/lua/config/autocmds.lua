-- Adapted from: https://github.com/MariaSolOs/dotfiles/blob/02e145c92d89280815071128f6c6eb4a59911730/.config/nvim/lua/autocmds.lua#L52-L62
vim.api.nvim_create_autocmd("BufReadPost", {
  group = vim.api.nvim_create_augroup("bryaneduarr/last_location", { clear = true }),
  desc = "Go to the last location when opening a buffer",
  callback = function(args)
    local mark = vim.api.nvim_buf_get_mark(args.buf, '"')
    if mark[1] > 0 and mark[1] <= vim.api.nvim_buf_line_count(args.buf) then
      vim.cmd('normal! g`"zz')
    end
  end,
})

vim.api.nvim_create_autocmd("FileType", {
  group = vim.api.nvim_create_augroup("no_auto_comment", { clear = true }),
  desc = "Do not continue comments on new lines",
  callback = function()
    vim.opt_local.formatoptions:remove({ "c", "r", "o" })
  end,
})

local active_cursorline = vim.api.nvim_create_augroup("active_cursorline", { clear = true })

vim.api.nvim_create_autocmd({ "WinEnter", "BufEnter" }, {
  group = active_cursorline,
  desc = "Show the cursorline in the active window",
  callback = function()
    vim.opt_local.cursorline = true
  end,
})

vim.api.nvim_create_autocmd({ "WinLeave", "BufLeave" }, {
  group = active_cursorline,
  desc = "Hide the cursorline in inactive windows",
  callback = function()
    vim.opt_local.cursorline = false
  end,
})
