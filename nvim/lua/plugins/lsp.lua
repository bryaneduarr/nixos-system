local servers = { "bashls", "clangd", "nil_ls", "ts_ls", "html", "cssls", "tailwindcss", "lua_ls", "emmet_ls" }

local function set_lsp_keymaps(bufnr)
  local function map(mode, lhs, rhs, desc)
    vim.keymap.set(mode, lhs, rhs, { buffer = bufnr, silent = true, desc = desc })
  end

  map({ "n", "v" }, "<leader>ca", vim.lsp.buf.code_action, "See available code actions")
  map("n", "<leader>rn", vim.lsp.buf.rename, "Smart rename")
  map("n", "<leader>D", "<cmd>FzfLua diagnostics_document<CR>", "Show buffer diagnostics")
  map("n", "<leader>d", vim.diagnostic.open_float, "Show line diagnostics")
  map("n", "M", vim.lsp.buf.hover, "Show documentation for what is under cursor")
  map("n", "<leader>rs", ":LspRestart<CR>", "Restart LSP")
  map("n", "<leader>gt", vim.lsp.buf.type_definition, "Go to type definition")
  map("n", "<leader>gr", vim.lsp.buf.references, "List references")
end

local function highlight_references(bufnr, group)
  vim.api.nvim_create_autocmd("CursorMoved", {
    group = group,
    buffer = bufnr,
    desc = "Highlight references under cursor",
    callback = function()
      if vim.fn.mode() ~= "i" then
        vim.lsp.buf.clear_references()
        vim.lsp.buf.document_highlight()
      end
    end,
  })
end

return {
  "neovim/nvim-lspconfig",
  event = { "BufReadPre", "BufNewFile" },
  dependencies = { "saghen/blink.cmp" },
  config = function()
    vim.lsp.config("clangd", {
      cmd = { "clangd", "--query-driver=/etc/profiles/per-user/bryaneduarr/bin/gcc", "--background-index" },
    })
    vim.lsp.config("nil_ls", {
      settings = { ["nil"] = { formatting = { command = { "nixfmt" } } } },
    })
    vim.lsp.enable(servers)

    vim.diagnostic.config({
      virtual_text = true,
      signs = true,
      underline = true,
      update_in_insert = false,
      severity_sort = true,
      float = { border = "single" },
    })

    vim.o.updatetime = 250
    vim.api.nvim_create_autocmd("CursorHold", {
      group = vim.api.nvim_create_augroup("lsp_line_diagnostics", { clear = true }),
      desc = "Show line diagnostics when the cursor rests",
      callback = function()
        vim.diagnostic.open_float(nil, {
          focusable = false,
          close_events = { "BufLeave", "CursorMoved", "InsertEnter", "FocusLost" },
          scope = "cursor",
        })
      end,
    })

    local reference_group = vim.api.nvim_create_augroup("lsp_reference_highlight", { clear = true })
    vim.api.nvim_create_autocmd("LspAttach", {
      group = vim.api.nvim_create_augroup("UserLspConfig", { clear = true }),
      desc = "Set LSP keymaps and reference highlighting for the buffer",
      callback = function(args)
        set_lsp_keymaps(args.buf)

        local client = vim.lsp.get_client_by_id(args.data.client_id)
        if client and client:supports_method("textDocument/documentHighlight", args.buf) then
          vim.api.nvim_clear_autocmds({ group = reference_group, buffer = args.buf })
          highlight_references(args.buf, reference_group)
        end
      end,
    })
  end,
}
