return {
  "ibhagwan/fzf-lua",
  dependencies = { "nvim-tree/nvim-web-devicons", "nvim-mini/mini.icons" },
  config = function()
    local fzf = require("fzf-lua")

    fzf.setup({
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
      files = {
        prompt = "Files❯ ",
        multiprocess = true,
        file_icons = true,
        color_icons = true,
        git_icons = true,
        fd_opts = "--color=never --type f --type l --hidden --no-ignore --exclude .git --exclude node_modules --exclude .turbo --exclude dist --exclude .next --exclude build --exclude out",
      },
      grep = {
        prompt = "Rg❯ ",
        input_prompt = "Grep For❯ ",
        multiprocess = true,
        git_icons = true,
        file_icons = true,
        color_icons = true,
        rg_opts = '--column --line-number --no-heading --color=always --smart-case --max-columns=4096 --hidden --follow --glob "!.git/" --glob "!node_modules/" --glob "!.next/" --glob "!.obsidian/" --glob "!.smart-env/"',
      },
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
      oldfiles = {
        prompt = "History❯ ",
        cwd_only = false,
        stat_file = true,
        include_current_session = true,
      },
      keymaps = {
        prompt = "Keymaps❯ ",
      },
      colorschemes = {
        prompt = "Colorschemes❯ ",
        live_preview = true,
        actions = {
          ["default"] = function(selected)
            vim.cmd("colorscheme " .. selected[1])
          end,
        },
      },
      complete_path = {
        prompt = "Path❯ ",
        file_icons = true,
        color_icons = true,
        git_icons = true,
      },
    })

    local function map(lhs, picker, desc)
      vim.keymap.set("n", lhs, function()
        picker()
      end, { desc = desc })
    end

    map("<leader>ff", fzf.files, "Fuzzy find files in cwd")
    map("<leader>fg", fzf.live_grep, "Fuzzy find string in cwd")
    map("<leader>fb", fzf.buffers, "Find opened buffers")
    map("<leader>fs", fzf.git_status, "Fuzzy find git status")
    map("<leader>fc", fzf.git_commits, "Find git commits")
    map("<leader>fr", fzf.oldfiles, "Recently open files / old files")
    map("<leader>f?", fzf.keymaps, "Find keymaps")
    map("<leader>fh", fzf.help_tags, "Find help tags")
    map("<leader>ft", fzf.colorschemes, "Find colorschemes with preview")
    map("<leader>fq", fzf.quickfix, "Find quickfix entries")
    map("<leader>fl", fzf.loclist, "Find location list entries")
    map("<leader>fp", function()
      fzf.complete_path({
        previewer = "builtin",
        winopts = { preview = { hidden = "nohidden", layout = "horizontal", horizontal = "right:60%" } },
      })
    end, "Insert file/dir path")
  end,
}
