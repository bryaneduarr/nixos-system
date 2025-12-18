-- Leader key (space).
vim.g.mapleader = " "

-- Exit/close file.
vim.keymap.set("n", "<leader>q", ":q<CR>", { desc = "Close the current buffer, if none present, then exit Neovim." })

-- Close the current buffer.
vim.keymap.set("n", "<leader>bq", ":bp<bar>sp<bar>bn<bar>bd<CR>", { desc = "Close the current buffer." })

-- Close all buffers.
vim.keymap.set("n", "<leader>baq", ":w | %bd | e# | bd#<CR>", { desc = "Close all active buffers." })

-- Split the buffer.
vim.keymap.set("n", "<leader>v", ":vsplit<CR>", { desc = "Split vertically the buffer." })
vim.keymap.set("n", "<leader>s", ":split<CR>", { desc = "Split horizontal the buffer." })

-- Navigate panes with key arrows.
vim.keymap.set("n", "<C-Up>", ":wincmd k<CR>", { desc = "Move to top pane." })
vim.keymap.set("n", "<C-Down>", ":wincmd j<CR>", { desc = "Move to bottom pane." })
vim.keymap.set("n", "<C-Left>", ":wincmd h<CR>", { desc = "Move to left pane." })
vim.keymap.set("n", "<C-Right>", ":wincmd l<CR>", { desc = "Move to right pane." })

-- Change between opened buffers.
vim.keymap.set("n", "<c-l>", ":bnext<CR>", { noremap = true, silent = true, desc = "Change to next buffer." })
vim.keymap.set("n", "<c-h>", ":bprevious<CR>", { noremap = true, silent = true, desc = "Change to previous buffer." })

-- Move line up and down in normal mode.
vim.keymap.set("n", "<S-k>", "ddkP", { noremap = true, silent = true, desc = "Move line up in normal mode." })
vim.keymap.set("n", "<S-j>", "ddp", { noremap = true, silent = true, desc = "Move line down in normal mode." })

-- Copy outside editor, commonly this is used with 'tmux' or a clipboard that has to be installed.
vim.keymap.set("v", "<S-y>", '"+y', { noremap = true, silent = true, desc = "Copy line to system clipboard." })

-- Config from: https://github.com/MariaSolOs/dotfiles/blob/3f5badf4ba9a810bd5f2b5d94acff144a05e7d5e/.config/nvim/lua/keymaps.lua#L5C1-L9C64
-- Keeping the cursor centered and scroll.
vim.keymap.set("n", "<C-d>", "<C-d>zz", { desc = "Scroll downwards and keep the content centered." })
vim.keymap.set("n", "<C-u>", "<C-u>zz", { desc = "Scroll upwards and keep the content centered." })

-- Search a string and center the cursor.
vim.keymap.set("n", "n", "nzzzv", { desc = "Next result and keep the content centered." })
vim.keymap.set("n", "N", "Nzzzv", { desc = "Previous result and keep the content centered." })

-- Config from: https://github.com/MariaSolOs/dotfiles/blob/3f5badf4ba9a810bd5f2b5d94acff144a05e7d5e/.config/nvim/lua/keymaps.lua#L11C1-L13C32
-- Indent while remaining in visual mode.
vim.keymap.set("v", "<", "<gv", { desc = "Move to the left the selected text with '<'." })
vim.keymap.set("v", ">", ">gv", { desc = "Move to the right the selected text with '>'." })

-- Config from: https://github.com/MariaSolOs/dotfiles/blob/3f5badf4ba9a810bd5f2b5d94acff144a05e7d5e/.config/nvim/lua/keymaps.lua#L32C1-L39C81
-- Poweful <esc>.
vim.keymap.set({ "i", "s", "n" }, "<esc>", function()
  if require("luasnip").expand_or_jumpable() then
    require("luasnip").unlink_current()
  end
  vim.cmd("noh")
  return "<esc>"
end, { desc = "Escape, clear hlsearch, and stop snippet session", expr = true })

-- Config from: https://github.com/MariaSolOs/dotfiles/blob/3f5badf4ba9a810bd5f2b5d94acff144a05e7d5e/.config/nvim/lua/keymaps.lua#L44C1-L45C112
-- escape and save changes.
vim.keymap.set({ "s", "i", "n", "v" }, "<C-s>", "<esc>:w<cr>", { desc = "Exit insert mode and save changes." })

-- Map 'Shift + m' to show LSP hover info.
vim.keymap.set("n", "M", vim.lsp.buf.hover, { desc = "LSP Hover Info" })

-- Open oil.
-- vim.keymap.set("n", "-", "<CMD>Oil<CR>", { desc = "Open Oil.nvim buffer." })

-- Open Neogit
vim.keymap.set("n", "<leader>gg", "<CMD>Neogit<CR>", { desc = "Open Neogit plugin." })
