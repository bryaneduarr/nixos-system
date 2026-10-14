_final: prev: {
  herdr = prev.herdr.overrideAttrs (previousAttrs: {
    patches = (previousAttrs.patches or [ ]) ++ [ ./patches/toggle-tab-bar.patch ];
  });
}
