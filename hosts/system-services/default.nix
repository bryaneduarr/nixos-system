_: {
  services = {
    libinput.enable = true;

    openssh.enable = true;

    pipewire = {
      enable = true;
      pulse.enable = true;
    };
  };
}
