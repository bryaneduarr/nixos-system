import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


THEME_SCRIPT = Path(__file__).resolve().parents[1] / "theme-mode" / "desktop-theme.sh"
COMPOSITORS = ("Hyprland", "niri")


class ThemeModeTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.home = Path(self.directory.name)
        self.bin_directory = self.home / "bin"
        self.bin_directory.mkdir()
        self.events = self.home / "events.jsonl"
        self.mode_file = self.home / ".local" / "state" / "desktop-theme" / "mode"
        self.wallpaper_cache = self.home / ".cache" / "matugen" / "last-wallpaper"
        self.environment = {
            **os.environ,
            "HOME": str(self.home),
            "PATH": f"{self.bin_directory}:{os.environ['PATH']}",
            "THEME_TEST_EVENTS": str(self.events),
            "XDG_STATE_HOME": str(self.home / ".local" / "state"),
            "XDG_CACHE_HOME": str(self.home / ".cache"),
            "XDG_CONFIG_HOME": str(self.home / ".config"),
        }

        for command in ("gsettings", "matugen", "kitty", "pkill"):
            executable = self.bin_directory / command
            executable.write_text(
                '#!/usr/bin/env python3\n'
                'import json, os, sys, time\n'
                'from pathlib import Path\n'
                'command = Path(sys.argv[0]).name\n'
                'with open(os.environ["THEME_TEST_EVENTS"], "a") as events:\n'
                '    events.write(json.dumps([command, *sys.argv[1:]]) + "\\n")\n'
                'if command == "matugen":\n'
                '    time.sleep(float(os.environ.get("THEME_TEST_DELAY", "0")))\n'
                'sys.exit(int(os.environ.get("THEME_TEST_FAIL_" + command, "0")))\n'
            )
            executable.chmod(0o755)

    def run_theme(self, *arguments, compositor="niri", extra_environment=None):
        return subprocess.run(
            ["bash", str(THEME_SCRIPT), *arguments],
            env={
                **self.environment,
                "XDG_CURRENT_DESKTOP": compositor,
                **(extra_environment or {}),
            },
            capture_output=True,
            text=True,
            timeout=10,
        )

    def recorded_events(self):
        if not self.events.exists():
            return []
        return [json.loads(line) for line in self.events.read_text().splitlines()]

    def assert_mode_applied(self, mode):
        self.assertEqual(self.mode_file.read_text().strip(), mode)
        events = self.recorded_events()
        theme = "Adwaita-dark" if mode == "dark" else "Adwaita"
        self.assertIn(
            ["gsettings", "set", "org.gnome.desktop.interface", "gtk-theme", theme],
            events,
        )
        self.assertIn(
            ["gsettings", "set", "org.gnome.desktop.interface", "color-scheme", f"prefer-{mode}"],
            events,
        )
        matugen_events = [event for event in events if event[0] == "matugen"]
        self.assertEqual(matugen_events[-1][-2:], ["--mode", mode])

    def test_toggle_round_trip_in_each_compositor(self):
        for compositor in COMPOSITORS:
            with self.subTest(compositor=compositor):
                self.mode_file.unlink(missing_ok=True)
                for mode in ("light", "dark"):
                    result = self.run_theme("toggle", compositor=compositor)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assert_mode_applied(mode)

    def test_apply_defaults_to_dark_and_preserves_saved_light_mode(self):
        result = self.run_theme("apply")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assert_mode_applied("dark")

        self.run_theme("light")
        result = self.run_theme("apply", compositor="Hyprland")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assert_mode_applied("light")

    def test_cached_wallpaper_with_spaces_is_used_without_changing_it(self):
        wallpaper = self.home / "image with spaces.png"
        wallpaper.write_bytes(b"image")
        self.wallpaper_cache.parent.mkdir(parents=True)
        self.wallpaper_cache.write_text(str(wallpaper) + "\n")

        result = self.run_theme("light")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.wallpaper_cache.read_text().strip(), str(wallpaper))
        self.assertIn(
            ["matugen", "image", str(wallpaper), "--mode", "light", "--source-color-index", "0"],
            self.recorded_events(),
        )

    def test_explicit_wallpaper_preserves_light_mode(self):
        self.run_theme("light")
        wallpaper = self.home / "new wallpaper.png"
        wallpaper.write_bytes(b"image")

        result = self.run_theme("apply", str(wallpaper))

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.mode_file.read_text().strip(), "light")
        self.assertIn(
            ["matugen", "image", str(wallpaper), "--mode", "light", "--source-color-index", "0"],
            self.recorded_events(),
        )

    def test_deleted_wallpaper_uses_fallback_color(self):
        self.wallpaper_cache.parent.mkdir(parents=True)
        self.wallpaper_cache.write_text(str(self.home / "deleted.png") + "\n")

        result = self.run_theme("light")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn(
            ["matugen", "color", "hex", "#89b4fa", "--mode", "light"],
            self.recorded_events(),
        )

    def test_invalid_mode_file_recovers_to_dark(self):
        self.mode_file.parent.mkdir(parents=True)
        self.mode_file.write_text("invalid\n")

        result = self.run_theme("apply")

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assert_mode_applied("dark")

    def test_invalid_action_does_not_change_settings(self):
        result = self.run_theme("invalid")

        self.assertEqual(result.returncode, 2)
        self.assertFalse(self.mode_file.exists())
        self.assertEqual(self.recorded_events(), [])

    def test_renderer_failure_does_not_commit_mode_or_update_desktop(self):
        self.run_theme("dark")
        self.events.unlink()

        result = self.run_theme("toggle", extra_environment={"THEME_TEST_FAIL_matugen": "1"})

        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.mode_file.read_text().strip(), "dark")
        self.assertEqual([event[0] for event in self.recorded_events()], ["matugen"])

    def test_gsettings_failure_does_not_commit_mode(self):
        self.run_theme("dark")

        result = self.run_theme("toggle", extra_environment={"THEME_TEST_FAIL_gsettings": "1"})

        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.mode_file.read_text().strip(), "dark")

    def test_reload_failure_does_not_fail_toggle(self):
        result = self.run_theme("toggle", extra_environment={"THEME_TEST_FAIL_pkill": "1"})

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assert_mode_applied("light")

    def test_simultaneous_toggles_are_serialized(self):
        environment = {**self.environment, "THEME_TEST_DELAY": "0.2"}
        processes = [
            subprocess.Popen(
                ["bash", str(THEME_SCRIPT), "toggle"],
                env=environment,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
            for _ in range(2)
        ]
        for process in processes:
            stdout, stderr = process.communicate(timeout=10)
            self.assertEqual(process.returncode, 0, stdout + stderr)

        self.assertEqual(self.mode_file.read_text().strip(), "dark")
        matugen_events = [event for event in self.recorded_events() if event[0] == "matugen"]
        self.assertEqual([event[-1] for event in matugen_events], ["light", "dark"])


if __name__ == "__main__":
    unittest.main()
