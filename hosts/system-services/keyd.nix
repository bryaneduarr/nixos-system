_: {
  services.keyd = {
    enable = true;
    keyboards.default = {
      ids = [ "*" ];
      settings = {
        main = {
          rightalt = "macro(C-b)";
        };
      };
    };
  };
}
