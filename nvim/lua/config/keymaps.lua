local map = vim.keymap.set

map("n", "<leader>q", ":q<CR>", { desc = "Close the current window, exiting Neovim on the last one" })
map("n", "<C-w>", ":bp<bar>sp<bar>bn<bar>bd<CR>", { nowait = true, desc = "Close the current buffer" })
map("n", "<leader>baq", ":w | %bd | e# | bd#<CR>", { desc = "Close all other buffers" })

map("n", "<leader>v", ":vsplit<CR>", { desc = "Split vertically" })
map("n", "<leader>s", ":split<CR>", { desc = "Split horizontally" })
map("n", "<C-Up>", ":wincmd k<CR>", { desc = "Move to top pane" })
map("n", "<C-Down>", ":wincmd j<CR>", { desc = "Move to bottom pane" })
map("n", "<C-Left>", ":wincmd h<CR>", { desc = "Move to left pane" })
map("n", "<C-Right>", ":wincmd l<CR>", { desc = "Move to right pane" })

map("n", "<C-l>", ":bnext<CR>", { silent = true, desc = "Next buffer" })
map("n", "<C-h>", ":bprevious<CR>", { silent = true, desc = "Previous buffer" })

map("n", "<S-k>", "ddkP", { silent = true, desc = "Move line up" })
map("n", "<S-j>", "ddp", { silent = true, desc = "Move line down" })
map("v", "<S-y>", '"+y', { silent = true, desc = "Copy to system clipboard" })

-- Adapted from: https://github.com/MariaSolOs/dotfiles/blob/3f5badf4ba9a810bd5f2b5d94acff144a05e7d5e/.config/nvim/lua/keymaps.lua
map("n", "<C-d>", "<C-d>zz", { desc = "Scroll down and center" })
map("n", "<C-u>", "<C-u>zz", { desc = "Scroll up and center" })
map("n", "n", "nzzzv", { desc = "Next search result and center" })
map("n", "N", "Nzzzv", { desc = "Previous search result and center" })
map("v", "<", "<gv", { desc = "Indent left and keep selection" })
map("v", ">", ">gv", { desc = "Indent right and keep selection" })
map({ "s", "i", "n", "v" }, "<C-s>", "<esc>:w<cr>", { desc = "Exit insert mode and save" })
