return {
  "catgoose/nvim-colorizer.lua",
  event = "BufReadPre",
  opts = {
    -- Tailwind colors.  boolean|'normal'|'lsp'|'both'.  True sets to 'normal'
    tailwind = true, -- Enable tailwind colors
    tailwind_opts = { -- Options for highlighting tailwind names
      update_names = true, -- When using tailwind = 'both', update tailwind names from LSP results.  See tailwind section
    },
  },
}
