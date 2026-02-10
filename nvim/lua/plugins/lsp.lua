-- Using Neovim's new built-in LSP system
return {
  {
    "neovim/nvim-lspconfig",
    event = { "BufReadPre", "BufNewFile" },
    dependencies = {
      "saghen/blink.cmp",
    },
    config = function()
      vim.lsp.config.clangd = {
        cmd = {
          "clangd",
          "--query-driver=/etc/profiles/per-user/bryaneduarr/bin/gcc",
          "--background-index",
        },
      }

      -- Enable LSP servers using the new built-in method.
      vim.lsp.enable({
        "ts_ls",
        "html",
        "cssls",
        "tailwindcss",
        "lua_ls",
        "emmet_ls",
        "clangd",
        "nil_ls",
      })

      -- Keyboard mapping utility.
      local keymap = vim.keymap

      -- Configure diagnostics display
      vim.diagnostic.config({
        virtual_text = true, -- Show diagnostic messages beside the line.
        signs = true, -- Show signs in the sign column of the numbers.
        underline = true, -- Underline text with issues.
        update_in_insert = false, -- Don't update diagnostics in insert mode.
        severity_sort = true, -- Sort diagnostics by severity.
        float = {
          border = "single",
        },
      })

      -- Automatically show line diagnostics in hover window when cursor holds.
      vim.o.updatetime = 250 -- Faster update time for better UX.
      vim.api.nvim_create_autocmd("CursorHold", {
        callback = function()
          vim.diagnostic.open_float(nil, {
            focusable = false,
            close_events = { "BufLeave", "CursorMoved", "InsertEnter", "FocusLost" },
            scope = "cursor",
          })
        end,
      })

      -- Keybindings.
      vim.api.nvim_create_autocmd("LspAttach", {
        group = vim.api.nvim_create_augroup("UserLspConfig", {}),
        callback = function(ev)
          local opts = { buffer = ev.buf, silent = true }

          opts.desc = "See available code actions"
          keymap.set({ "n", "v" }, "<leader>ca", vim.lsp.buf.code_action, opts) -- see available code actions, in visual mode will apply to selection

          opts.desc = "Smart rename"
          keymap.set("n", "<leader>rn", vim.lsp.buf.rename, opts) -- smart rename

          opts.desc = "Show buffer diagnostics"
          keymap.set("n", "<leader>D", "<cmd>FzfLua diagnostics_document<CR>", opts) -- show  diagnostics for file

          opts.desc = "Show line diagnostics"
          keymap.set("n", "<leader>d", vim.diagnostic.open_float, opts) -- show diagnostics for line

          opts.desc = "Show documentation for what is under cursor"
          keymap.set("n", "M", vim.lsp.buf.hover, opts) -- show documentation for what is under cursor

          opts.desc = "Restart LSP"
          keymap.set("n", "<leader>rs", ":LspRestart<CR>", opts) -- mapping to restart lsp if necessary

          opts.desc = "Go to type definition"
          keymap.set("n", "<leader>gt", vim.lsp.buf.type_definition, opts)
          opts.desc = "List references"
          keymap.set("n", "<leader>gr", vim.lsp.buf.references, opts)
        end,
      })
    end,
  },
}
