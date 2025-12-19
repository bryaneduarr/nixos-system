{ pkgs, ... }:
{
  programs.btop = {
    enable = true;

    # Override btop package to enable nvidia gpu support.
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

      # CPU settings
      show_cpu_freq = true;
      show_uptime = true;

      # GPU settings
      nvml_measure_pcie_speeds = true;

      # Process settings
      proc_sorting = "cpu lazy";
      proc_tree = false;
      proc_colors = true;
      proc_gradient = true;
      proc_per_core = true;
      proc_mem_bytes = true;

      # Memory settings
      mem_graphs = true;
      show_swap = true;
      show_disks = true;
    };
  };
}
