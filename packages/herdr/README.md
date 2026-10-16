# Herdr

Herdr comes from nixpkgs. `overlay.nix` adds `patches/toggle-tab-bar.patch`, which upstream Herdr does not have yet: `Ctrl+B`, then `T`, hides or shows the tab bar, and `tab_bar_start_hidden = true` starts it hidden.

## Update

`nfu` updates nixpkgs and rebuilds, which reapplies the patch. After switching, detach with `Ctrl+B`, then `Q`, and run `herdr` again to use the new client.

## Fix a patch that no longer applies

If the build fails in `patchPhase`:

1. Check whether upstream added a tab bar toggle. If it did, delete `overlay.nix`, `patches/`, and `herdrOverlay` in `flake.nix`, and use the upstream setting.
2. Otherwise, apply the patch to the new source with `git apply --3way`, resolve the conflicts, and write it back with `git diff > patches/toggle-tab-bar.patch`.
3. Run `nrs build` before `nrs`.
