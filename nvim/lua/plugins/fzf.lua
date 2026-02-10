return {
  "ibhagwan/fzf-lua",
  dependencies = { "nvim-tree/nvim-web-devicons", "nvim-mini/mini.icons" },
  config = function()
    local fzf = require("fzf-lua")

    fzf.setup({
      -- Global settings.
      global_resume = true,
      global_resume_query = true,
      winopts = {
        border = "single",
        preview = {
          border = "single",
          wrap = "nowrap",
          hidden = "nohidden",
        },
      },
      keymap = {
        builtin = {
          ["<c-d>"] = "preview-page-down",
          ["<c-u>"] = "preview-page-up",
        },
        fzf = {
          ["ctrl-d"] = "delete-char",
          ["ctrl-a"] = "beginning-of-line",
          ["ctrl-e"] = "end-of-line",
        },
      },
      -- Files configuration with ignore patterns.
      files = {
        prompt = "Files❯ ",
        multiprocess = true,
        file_icons = true,
        color_icons = true,
        git_icons = true,
        fd_opts = "--color=never --type f --type l --hidden --no-ignore --exclude .git --exclude node_modules --exclude .turbo --exclude dist --exclude .next --exclude build --exclude out",
      },
      -- Grep configuration.
      grep = {
        prompt = "Rg❯ ",
        input_prompt = "Grep For❯ ",
        multiprocess = true,
        git_icons = true,
        file_icons = true,
        color_icons = true,
        rg_opts = '--column --line-number --no-heading --color=always --smart-case --max-columns=4096 --hidden --follow --glob "!.git/" --glob "!node_modules/" --glob "!.next/" --glob "!.obsidian/" --glob "!.smart-env/"',
      },
      -- Buffers configuration.
      buffers = {
        prompt = "Buffers❯ ",
        file_icons = true,
        color_icons = true,
        sort_lastused = true,
        actions = {
          ["ctrl-d"] = function(selected)
            local buf = selected[1]:match("(%d+)")
            if buf then
              vim.cmd("bdelete " .. buf)
            end
          end,
        },
      },
      -- Git configuration
      git = {
        status = {
          prompt = "GitStatus❯ ",
          preview_pager = "delta --width=$COLUMNS",
        },
        commits = {
          prompt = "Commits❯ ",
          preview_pager = "delta --width=$COLUMNS",
        },
      },
      -- Oldfiles configuration
      oldfiles = {
        prompt = "History❯ ",
        cwd_only = false,
        stat_file = true,
        include_current_session = true,
      },
      -- Keymaps configuration
      keymaps = {
        prompt = "Keymaps❯ ",
      },
      -- Colorschemes with preview
      colorschemes = {
        prompt = "Colorschemes❯ ",
        live_preview = true,
        actions = {
          ["default"] = function(selected)
            vim.cmd("colorscheme " .. selected[1])
          end,
        },
      },
      -- Complete path configuration with icons
      complete_path = {
        prompt = "Path❯ ",
        file_icons = true,
        color_icons = true,
        git_icons = true,
      },
    })

    local keymap = vim.keymap

    keymap.set("n", "<leader>ff", function()
      fzf.files()
    end, { desc = "Fuzzy find files in cwd" })
    keymap.set("n", "<leader>fg", function()
      fzf.live_grep()
    end, { desc = "Fuzzy find string in cwd" })
    keymap.set("n", "<leader>fb", function()
      fzf.buffers()
    end, { desc = "Find opened buffers" })
    keymap.set("n", "<leader>fs", function()
      fzf.git_status()
    end, { desc = "Fuzzy find git status" })
    keymap.set("n", "<leader>fc", function()
      fzf.git_commits()
    end, { desc = "Find git commits" })
    keymap.set("n", "<leader>fr", function()
      fzf.oldfiles()
    end, { desc = "Recently open files / old files" })
    keymap.set("n", "<leader>f?", function()
      fzf.keymaps()
    end, { desc = "Find keymaps" })

    -- Additional useful fzf-lua specific keymaps
    keymap.set("n", "<leader>fh", function()
      fzf.help_tags()
    end, { desc = "Find help tags" })
    keymap.set("n", "<leader>ft", function()
      fzf.colorschemes()
    end, { desc = "Find colorschemes with preview" })
    keymap.set("n", "<leader>fq", function()
      fzf.quickfix()
    end, { desc = "Find quickfix entries" })
    keymap.set("n", "<leader>fl", function()
      fzf.loclist()
    end, { desc = "Find location list entries" })

    -- Insert file path with preview and icons
    keymap.set("n", "<leader>fp", function()
      fzf.complete_path({
        file_icons = true,
        color_icons = true,
        git_icons = true,
        previewer = "builtin",
        winopts = {
          preview = {
            hidden = "nohidden",
            layout = "horizontal",
            horizontal = "right:60%",
          },
        },
      })
    end, { noremap = true, silent = true, desc = "Insert file/dir path" })
  end,
}
