# Switch between Hyprland and Niri

1. Set `desktop.compositor` in `hosts/configuration.nix` to `"hyprland"` or `"niri"`.

	```nix
	desktop.compositor = "niri";
	```

2. Run `nrs` to rebuild and apply the configuration.
3. Log out, then log in through Ly to start the selected compositor.

Changing the selector does not replace a running compositor. A compositor reload alone does not apply this switch.

NixOS installs only the selected compositor. Home Manager selects its configuration, Waybar modules, and desktop-specific Zen browser defaults. Niri also gets X11 application support through `xwayland-satellite`.

## Use wallpapers in either compositor

1. Put images in `~/wallpapers`. Supported extensions are `.jpg`, `.jpeg`, `.png`, `.gif`, and `.webp`.
2. Log in to restore the last wallpaper or choose a random image on the first login.
3. Press `Super+Shift+W` to choose a random wallpaper and update Matugen colors.

Both compositors use one `awww-daemon` user service and the same `~/.cache/matugen/last-wallpaper` cache. The shared scripts are in `home/desktop/wallpapers/scripts/`. An empty wallpaper directory leaves the session running without a wallpaper.

## Use the Niri key bindings

- Press `Super+T` for Kitty, `Super+R` for Rofi, or `Super+B` for Zen.
- Press `Super+Q` to close a window or `Super+M` to exit Niri.
- Press `Super` with an arrow key or `H`, `J`, `K`, or `L` to move focus.
- Press `Super+Shift` with an arrow key to move a column or a window.
- Press `Super+1` through `Super+5` to select a named workspace.
- Press `Super+Shift+1` through `Super+Shift+5` to move a window to a named workspace.
- Press `Super+V` to toggle floating, `Super+F` to maximize a column, or `Super+Shift+F` for fullscreen.
- Press `Super+P` to change column width or `Super+O` for the overview.
- Press `Print` for the screenshot picker, `Ctrl+Print` for the screen, or `Alt+Print` for the focused window.

## Validate without activating the system

Run the regression checks from the repository root:

```sh
nix eval --impure --json --file home/desktop/tests/evaluate.nix
python3 home/desktop/tests/test_wallpapers.py
```

The checks evaluate both compositor selections, enforce exclusive sessions and packages, and verify the shared wallpaper configuration. They also check portals, browser defaults, Waybar, and both system derivations. Nix validates `home/packages/niri/config.kdl` with the selected Niri package when building the managed file.

The session setup follows [Niri's systemd integration](https://niri-wm.github.io/niri/Example-systemd-Setup.html). Waybar uses its native [Niri workspace](https://github.com/Alexays/Waybar/blob/master/man/waybar-niri-workspaces.5.scd) and [Niri window](https://github.com/Alexays/Waybar/blob/master/man/waybar-niri-window.5.scd) modules.
