# Niri key bindings

`config.kdl` includes every active binding from [Niri 26.04's default configuration](https://github.com/niri-wm/niri/blob/v26.04/resources/default-config.kdl). The terminal and launcher commands use Kitty and Rofi instead of Alacritty and Fuzzel.

`Super` is the Windows key. The configuration uses `Super` instead of Niri's context-dependent `Mod` alias. In the tables, `Direction` means an arrow key or `H`, `J`, `K`, or `L`. The letters mean left, down, up, and right, respectively.

Commented-out examples in the upstream configuration are not default bindings. Media commands require a compatible player. Brightness commands require a backlight device. Monitor navigation requires a monitor in the requested direction.

## Applications and session

| Shortcut | Action |
| --- | --- |
| `Super+Shift+/` | Show the important-hotkeys overlay |
| `Super+T` | Open Kitty |
| `Super+D` | Open Rofi |
| `Super+Alt+L` | Lock the screen with Swaylock |
| `Super+Alt+S` | Toggle the Orca screen reader |
| `Super+O` | Toggle the overview |
| `Super+Q` | Close the focused window |
| `Super+Escape` | Toggle shortcut inhibition, even when an application inhibits shortcuts |
| `Super+Shift+E` or `Ctrl+Alt+Delete` | Show the confirmation dialog to exit Niri |
| `Super+Shift+P` | Turn off monitors until the next input |

## Window and column movement

| Shortcut | Action |
| --- | --- |
| `Super+Direction` | Focus a column horizontally or a window vertically |
| `Super+Ctrl+Direction` | Move a column horizontally or a window vertically |
| `Super+Home` or `Super+End` | Focus the first or last column |
| `Super+Ctrl+Home` or `Super+Ctrl+End` | Move the column to the first or last position |
| `Super+Shift+Direction` | Focus a monitor |
| `Super+Ctrl+Shift+Direction` | Move the column to a monitor |
| `Super+[` or `Super+]` | Move the window into or out of the neighboring column |
| `Super+,` | Add a window from the right to the bottom of the current column |
| `Super+.` | Move the bottom window out of the column to the right |
| `Super+V` | Move the window between tiled and floating layouts |
| `Super+Shift+V` | Switch focus between tiled and floating windows |
| `Super+W` | Toggle tabs for the current column |

## Window size and position

| Shortcut | Action |
| --- | --- |
| `Super+R` | Cycle column widths |
| `Super+Shift+R` | Cycle column widths backward |
| `Super+Ctrl+Shift+R` | Cycle window heights |
| `Super+Ctrl+R` | Reset the window height |
| `Super+F` | Maximize the column while keeping gaps |
| `Super+Shift+F` | Toggle fullscreen |
| `Super+M` | Maximize the window to the screen edges without gaps |
| `Super+Ctrl+F` | Expand the column into available space |
| `Super+C` | Center the column |
| `Super+Ctrl+C` | Center all fully visible columns |
| `Super+-` or `Super+=` | Decrease or increase column width by 10 percentage points |
| `Super+Shift+-` or `Super+Shift+=` | Decrease or increase window height by 10 percentage points |

## Workspaces and scrolling

The number bindings select workspace indices, not workspace names. An index beyond the current workspace count selects the last empty workspace. The existing named workspaces remain configured.

| Shortcut | Action |
| --- | --- |
| `Super+Page Up` or `Super+I` | Focus the workspace above |
| `Super+Page Down` or `Super+U` | Focus the workspace below |
| `Super+Ctrl+Page Up` or `Super+Ctrl+I` | Move the column to the workspace above |
| `Super+Ctrl+Page Down` or `Super+Ctrl+U` | Move the column to the workspace below |
| `Super+Shift+Page Up` or `Super+Shift+I` | Reorder the workspace upward |
| `Super+Shift+Page Down` or `Super+Shift+U` | Reorder the workspace downward |
| `Super+1` through `Super+9` | Focus a workspace by index |
| `Super+Ctrl+1` through `Super+Ctrl+9` | Move the column to a workspace by index |
| `Super` with vertical wheel scrolling | Focus a workspace, with a 150 ms cooldown |
| `Super+Ctrl` with vertical wheel scrolling | Move the column to a workspace, with a 150 ms cooldown |
| `Super` with horizontal wheel scrolling | Focus a column |
| `Super+Ctrl` with horizontal wheel scrolling | Move a column |
| `Super+Shift` with vertical wheel scrolling | Focus a column horizontally |
| `Super+Ctrl+Shift` with vertical wheel scrolling | Move a column horizontally |

## Screenshots and media

| Shortcut | Action |
| --- | --- |
| `Print` | Open the screenshot picker |
| `Ctrl+Print` | Capture the screen |
| `Alt+Print` | Capture the focused window |
| Volume up or down keys | Change volume by 10 percent, with increases limited to 100 percent |
| Audio mute key | Toggle output mute |
| Microphone mute key | Toggle microphone mute |
| Play or pause key | Toggle media playback |
| Stop key | Stop media playback |
| Previous or next track key | Change the media track |
| Brightness up or down keys | Change backlight brightness by 10 percent |

Volume, media, brightness, and screen-reader shortcuts also work when the session is locked. The pause key is an addition from Niri's newer default configuration.

## Retained custom shortcuts

| Shortcut | Action |
| --- | --- |
| `Super+B` | Open Zen |
| `Super+Shift+D` | Toggle light and dark mode |
| `Super+Shift+W` | Change the wallpaper |
| `Super+P` | Cycle column widths |
| `Super+Shift+1` through `Super+Shift+5` | Move the window to the corresponding named workspace |
| `Super+Alt+Page Up` or `Super+Alt+Page Down` | Move the window to the workspace above or below |

## Changes from the previous custom bindings

- Rofi moves from `Super+R` to `Super+D`. `Super+R` now cycles column widths.
- Window movement uses `Super+Ctrl+Direction`. `Super+Shift+Direction` now focuses monitors.
- `Super+M` maximizes a window instead of exiting Niri. Exit uses `Super+Shift+E` or `Ctrl+Alt+Delete`.
- `Super+Shift+Page Up` and `Super+Shift+Page Down` reorder workspaces. Window movement between adjacent workspaces uses `Super+Alt+Page Up` and `Super+Alt+Page Down`.
- `Super+1` through `Super+9` select workspace indices. The single-window shortcuts still target the named workspaces `1` through `5`.
