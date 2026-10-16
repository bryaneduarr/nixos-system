vim.opt.ignorecase = true
vim.opt.expandtab = true
vim.opt.tabstop = 2
vim.opt.softtabstop = 2
vim.opt.shiftwidth = 2
vim.opt.shiftround = true
vim.opt.list = true
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.numberwidth = 2
vim.opt.cursorline = true
vim.opt.undodir = os.getenv("HOME") .. "/.vim/undodir"
vim.opt.undofile = true
vim.opt.signcolumn = "yes"
vim.opt.termguicolors = true
vim.opt.completeopt = { "menuone", "popup", "noinsert" }
vim.opt.winborder = "single"
vim.opt.showtabline = 0
vim.opt.fillchars:append({ diff = "╱" })

vim.opt.foldcolumn = "1"
vim.opt.foldlevel = 99
vim.opt.foldlevelstart = 99
vim.opt.foldtext = ""

vim.opt.spell = true
vim.opt.spelllang = { "en_us" }

-- The Spanish dictionary is installed by packages/neovim.
if vim.fn.filereadable(vim.fn.stdpath("data") .. "/site/spell/es.utf-8.spl") == 1 then
  vim.opt.spelllang = { "en_us", "es" }
  vim.opt.spellfile = {
    vim.fn.stdpath("config") .. "/spell/en.utf-8.add",
    vim.fn.stdpath("config") .. "/spell/es.utf-8.add",
  }
end

vim.filetype.add({
  filename = { [".env"] = "dosini" },
  pattern = { ["%.env%..*"] = "dosini" },
})

if vim.fn.has("wsl") == 1 then
  local osc52 = require("vim.ui.clipboard.osc52")
  vim.g.clipboard = {
    name = "OSC 52",
    copy = { ["+"] = osc52.copy("+"), ["*"] = osc52.copy("*") },
    paste = { ["+"] = osc52.paste("+"), ["*"] = osc52.paste("*") },
  }
end
