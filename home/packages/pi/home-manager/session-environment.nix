_: {
  # pi-fff 0.10.x resolves these options from flags/environment variables;
  # keep the declarative config file and environment in sync.
  home.sessionVariables = {
    PI_FFF_MODE = "override";
    FFF_ENABLE_ROOT_SCAN = "0";
    FFF_ENABLE_HOME_SCAN = "0";
  };
}
