return {
  "stevearc/conform.nvim",
  event = { "BufReadPre", "BufNewFile" },
  config = function()
    local conform = require("conform")

    conform.setup({
      formatters_by_ft = {
        javascript = { "prettierd", "eslint_d" },
        typescript = { "prettierd", "eslint_d" },
        javascriptreact = { "prettierd", "eslint_d" },
        typescriptreact = { "prettierd", "eslint_d" },
        css = { "prettierd" },
        html = { "prettierd" },
        json = { "prettierd" },
        yaml = { "prettierd" },
        markdown = { "prettierd" },
        lua = { "stylua" },
        c = { "clang_format" },
        cpp = { "clang_format" },
        nix = { "nixfmt" },
        -- For filetypes without a formatter:
        ["_"] = { "trim_whitespace", "trim_newlines" },
      },
      formatters = {
        stylua = {
          args = { "--config-path", vim.fn.stdpath("config") .. "/stylua.toml", "-" },
        },
        clang_format = {
          prepend_args = { "--style=file", "--fallback-style=LLVM" },
        },
      },

      -- format_on_save = {
      --   lsp_fallback = true,
      --   timeout_ms = 1000,
      -- },
      -- format_after_save = {
      --   lsp_format = "first",
      -- },
    })

    vim.keymap.set({ "n", "v" }, "<leader>lf", function()
      conform.format({
        lsp_fallback = true,
        async = false,
        timeout_ms = 1000,
      })
      vim.g.autoformat = true
    end, { desc = "Format file or range (in visual mode)" })
  end,
}
