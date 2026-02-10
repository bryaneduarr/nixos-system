-- Ignore case in search
vim.opt.ignorecase = true

-- Enable auto indentation
vim.opt.autoindent = true

-- Use spaces instead of tabs
vim.opt.expandtab = true

-- Number of spaces for a tab
vim.opt.tabstop = 2

-- Number of spaces for a tab when editing
vim.opt.softtabstop = 2

-- Number of spaces for autoindent
vim.opt.shiftwidth = 2

-- Round indent to multiple of shiftwidth
vim.opt.shiftround = true

-- Show whitespace characters
vim.opt.list = true

-- Characters used when making spaces or tabs
-- vim.opt.listchars = { space = "⋅", trail = "⋅", tab = "  ↦" }

-- Show line numbers
vim.opt.number = true

-- Show relative line numbers
vim.opt.relativenumber = true

-- Width of the line number column
vim.opt.numberwidth = 2

-- Highlight the current line
vim.opt.cursorline = true

-- Shows the effects of a command incrementally in the buffer
vim.opt.inccommand = "nosplit"

-- Directory for undo files
vim.opt.undodir = os.getenv("HOME") .. "/.vim/undodir"

-- Enable persistent undo
vim.opt.undofile = true

-- Display signs at the left side of the editor.
vim.opt.signcolumn = "yes"

-- Enable true color support for terminals that support it (better color rendering).
vim.opt.termguicolors = true

-- Enable spell checking functionality, automatically underlines misspelled words as you type.
vim.opt.spell = true

-- Set spell checking languages to Spanish and English, Neovim will use dictionaries for both languages to check spelling.
vim.opt.spelllang = { "en_us", "es" }

vim.opt.spellfile = {
  vim.fn.stdpath("config") .. "/spell/en.utf-8.add",
  vim.fn.stdpath("config") .. "/spell/es.utf-8.add",
}

-- Options for completion menu
vim.opt.completeopt = { "menuone", "popup", "noinsert" }

-- Use rounded borders for windows
vim.opt.winborder = "single"

-- Enable filetype detection, plugins, and indentation
vim.cmd.filetype("plugin indent on")

-- Hide Netwr banner (the message that appears when you open a directory).
vim.g.netrw_banner = 0

-- Enable Netwr to open files in a preview window.
vim.g.netrw_preview = 1

-- Keep the current directory when opening a file.
vim.g.netrw_keepdir = 0

-- Change the copy command. Mostly to enable recursive copy of directories.
vim.g.netrw_localcopydircmd = "cp -r"

-- Highlight marked files in the same way search matches are.
vim.api.nvim_set_hl(0, "netrwMarkFile", { link = "Search" })

-- Folding.
vim.o.foldcolumn = "1"
vim.o.foldlevel = 99
vim.o.foldlevelstart = 99
vim.wo.foldtext = ""
