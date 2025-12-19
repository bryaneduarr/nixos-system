''
  * {
    border: none;
    border-radius: 0;
    font-family: "JetBrainsMono Nerd Font", monospace;
    font-size: 13px;
    min-height: 0;
  }

  window#waybar {
    background: rgba(30, 30, 46, 0.9);
    color: #cdd6f4;
  }

  #workspaces button {
    padding: 0 10px;
    color: #cdd6f4;
    background: transparent;
    border-bottom: 3px solid transparent;
  }

  #workspaces button.active {
    background: rgba(137, 180, 250, 0.3);
    border-bottom: 3px solid #89b4fa;
  }

  #workspaces button:hover {
    background: rgba(137, 180, 250, 0.2);
  }

  #clock,
  #battery,
  #cpu,
  #memory,
  #temperature,
  #network,
  #pulseaudio,
  #tray {
    padding: 0 10px;
    margin: 0 4px;
    background: rgba(49, 50, 68, 0.8);
    border-radius: 5px;
  }

  #battery.charging {
    color: #a6e3a1;
  }

  #battery.warning:not(.charging) {
    color: #fab387;
  }

  #battery.critical:not(.charging) {
    color: #f38ba8;
    animation: blink 0.5s linear infinite alternate;
  }

  @keyframes blink {
    to {
      background-color: rgba(243, 139, 168, 0.3);
    }
  }

  #temperature.critical {
    color: #f38ba8;
  }
''
