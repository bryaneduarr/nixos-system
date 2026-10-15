return {
  "nvim-treesitter/nvim-treesitter",
  lazy = false,
  build = ":TSUpdate",
  dependencies = {
    { "nvim-treesitter/nvim-treesitter-textobjects", branch = "main" },
  },
  config = function()
    require("nvim-treesitter").install({
      "json",
      "javascript",
      "typescript",
      "tsx",
      "yaml",
      "html",
      "css",
      "markdown",
      "markdown_inline",
      "bash",
      "lua",
      "vim",
      "vimdoc",
      "query",
      "dockerfile",
      "gitignore",
      "c",
      "cpp",
      "cmake",
      "nix",
    })

    vim.api.nvim_create_autocmd("FileType", {
      group = vim.api.nvim_create_augroup("treesitter_start", { clear = true }),
      desc = "Start treesitter highlighting, indentation, and folding",
      callback = function(args)
        local buf = args.buf
        if vim.bo[buf].buftype ~= "" or not vim.treesitter.language.get_lang(args.match) then
          return
        end

        pcall(vim.treesitter.start, buf)
        vim.bo[buf].indentexpr = "v:lua.require'nvim-treesitter'.indentexpr()"

        local win = vim.fn.bufwinid(buf)
        if win ~= -1 then
          vim.api.nvim_win_call(win, function()
            vim.wo.foldmethod = "expr"
            vim.wo.foldexpr = "v:lua.vim.treesitter.foldexpr()"
          end)
        end
      end,
    })
  end,
}
