{
  config,
  lib,
  pkgs,
  ...
}:
let
  cfg = config.custom.btop;
in
{
  options.custom.btop.enable = lib.mkEnableOption "btop with NVIDIA GPU monitoring";

  config = lib.mkIf cfg.enable {
    programs.btop = {
      enable = true;

      package = pkgs.btop.override {
        cudaSupport = true;
      };

      settings = {
        color_theme = "Default";
        theme_background = true;
        truecolor = true;
        rounded_corners = true;
        update_ms = 1500;
        check_temp = true;
        temp_scale = "celsius";
        graph_symbol = "braille";

        shown_boxes = "cpu mem net proc";

        show_cpu_freq = true;
        show_uptime = true;

        nvml_measure_pcie_speeds = true;

        proc_sorting = "cpu lazy";
        proc_tree = false;
        proc_colors = true;
        proc_gradient = true;
        proc_per_core = true;
        proc_mem_bytes = true;

        mem_graphs = true;
        show_swap = true;
        show_disks = true;
      };
    };
  };
}
