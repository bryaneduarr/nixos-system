_: {
  nix.settings = {
    max-jobs = 1;
    cores = 2;
  };

  nixpkgs.overlays = [
    (_: previous: {
      pythonPackagesExtensions = previous.pythonPackagesExtensions ++ [
        (_: pythonPrevious: {
          sentence-transformers = pythonPrevious.sentence-transformers.overridePythonAttrs {
            doCheck = false;
            nativeCheckInputs = [ ];
          };

          torchaudio = pythonPrevious.torchaudio.overridePythonAttrs {
            doCheck = false;
            nativeCheckInputs = [ ];
          };

          duckdb = pythonPrevious.duckdb.overrideAttrs (old: {
            env = (old.env or { }) // {
              CMAKE_BUILD_PARALLEL_LEVEL = "1";
              SKBUILD_BUILD_TOOL_ARGS = "-j1";
            };
          });
        })
      ];
    })
  ];
}
