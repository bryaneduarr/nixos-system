return {
  "stevearc/conform.nvim",
  event = { "BufReadPre", "BufNewFile" },
  config = function()
    local conform = require("conform")

    local function is_biome_project(ctx)
      return vim.fs.find({ "biome.json", "biome.jsonc" }, { path = ctx.dirname, upward = true })[1] ~= nil
    end

    local function is_not_biome_project(_, ctx)
      return not is_biome_project(ctx)
    end

    conform.setup({
      formatters_by_ft = {
        javascript = { "biome", "script_prettierd", "eslint_d" },
        typescript = { "biome", "script_prettierd", "eslint_d" },
        javascriptreact = { "biome", "script_prettierd", "eslint_d" },
        typescriptreact = { "biome", "script_prettierd", "eslint_d" },
        css = { "prettierd" },
        html = { "prettierd" },
        json = { "prettierd" },
        yaml = { "prettierd" },
        markdown = { "prettierd" },
        lua = { "stylua" },
        c = { "clang_format" },
        cpp = { "clang_format" },
        nix = { "nixfmt" },
        sh = { "shfmt" },
        bash = { "shfmt" },
        ["_"] = { "trim_whitespace", "trim_newlines" },
      },
      formatters = {
        biome = {
          command = "biome",
          args = { "format", "--stdin-file-path", "$FILENAME" },
          stdin = true,
          condition = function(_, ctx)
            return is_biome_project(ctx)
          end,
        },
        script_prettierd = { inherit = "prettierd", condition = is_not_biome_project },
        eslint_d = { condition = is_not_biome_project },
        stylua = {
          args = { "--config-path", vim.fn.stdpath("config") .. "/stylua.toml", "-" },
        },
        clang_format = {
          prepend_args = { "--style=file", "--fallback-style=LLVM" },
        },
      },
    })

    vim.keymap.set({ "n", "v" }, "<leader>lf", function()
      conform.format({
        lsp_fallback = true,
        async = false,
        timeout_ms = 1000,
      })
    end, { desc = "Format file or range (in visual mode)" })
  end,
}
