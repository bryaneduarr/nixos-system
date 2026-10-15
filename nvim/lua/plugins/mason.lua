return {
  "williamboman/mason.nvim",
  dependencies = {
    "WhoIsSethDaniel/mason-tool-installer.nvim",
  },
  config = function()
    local mason = require("mason")
    local mason_tool_installer = require("mason-tool-installer")

    mason.setup({
      ui = {
        border = "rounded",
      },
    })

    local ensure_installed = {
      -- LSP servers (for the new built-in LSP system)
      "typescript-language-server", -- ts_ls
      "html-lsp", -- html
      "css-lsp", -- cssls
      "tailwindcss-language-server", -- tailwindcss
      "lua-language-server", -- lua_ls
      "emmet-ls", -- emmet_ls
      "nil", -- Nix

      -- Formatters
      "stylua", -- lua formatter.
      "prettier", -- js/ts/html/css formatter (for monorepos).
      "prettierd", -- js/ts/html/css formatter (daemon version).
      "eslint_d", -- js/ts linter.
      "biome", -- js/ts linter and formatter.

      -- Linters
      "cpplint", -- Google C++ style checker
    }

    -- Mason ships clangd and clang-format only for x86_64; aarch64 uses the clang-tools Nix package.
    if vim.uv.os_uname().machine == "x86_64" then
      vim.list_extend(ensure_installed, { "clangd", "clang-format" })
    end

    mason_tool_installer.setup({
      ensure_installed = ensure_installed,
    })
  end,
}
