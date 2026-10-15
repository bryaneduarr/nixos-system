local tools = {
  "typescript-language-server",
  "html-lsp",
  "css-lsp",
  "tailwindcss-language-server",
  "emmet-ls",
  "stylua",
  "prettier",
  "prettierd",
  "eslint_d",
  "cpplint",
}

-- Mason ships clangd and clang-format only for x86_64; aarch64 uses the clang-tools Nix package.
if vim.uv.os_uname().machine == "x86_64" then
  vim.list_extend(tools, { "clangd", "clang-format" })
end

return {
  "williamboman/mason.nvim",
  dependencies = { "WhoIsSethDaniel/mason-tool-installer.nvim" },
  config = function()
    require("mason").setup({ ui = { border = "rounded" } })
    require("mason-tool-installer").setup({ ensure_installed = tools })
  end,
}
