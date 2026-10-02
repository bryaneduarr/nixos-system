import os
from pathlib import Path
import subprocess
import tempfile
import unittest


SCRIPTS = Path(__file__).resolve().parents[1] / "wallpapers" / "scripts"
COMPOSITORS = ("Hyprland", "niri")


class WallpaperTests(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary_directory.cleanup)

        self.home = Path(self.temporary_directory.name)
        self.bin_directory = self.home / "bin"
        self.bin_directory.mkdir()
        self.events = self.home / "events.log"
        self.cache = self.home / ".cache" / "matugen" / "last-wallpaper"

        self.environment = {
            **os.environ,
            "HOME": str(self.home),
            "PATH": f"{self.bin_directory}:{os.environ['PATH']}",
            "WAYLAND_DISPLAY": "wayland-test",
            "WALLPAPER_TEST_EVENTS": str(self.events),
        }

        for command in ("awww", "matugen", "kitty"):
            executable = self.bin_directory / command
            executable.write_text(
                '#!/usr/bin/env bash\n'
                'printf "%s" "${0##*/}" >> "$WALLPAPER_TEST_EVENTS"\n'
                'printf " <%s>" "$@" >> "$WALLPAPER_TEST_EVENTS"\n'
                'printf "\\n" >> "$WALLPAPER_TEST_EVENTS"\n'
            )
            executable.chmod(0o755)

    def create_wallpaper(self):
        directory = self.home / "wallpapers"
        directory.mkdir()
        wallpaper = directory / "wallpaper with spaces.png"
        wallpaper.write_bytes(b"test wallpaper")
        return wallpaper

    def run_script(self, name, compositor):
        self.events.unlink(missing_ok=True)

        return subprocess.run(
            ["bash", str(SCRIPTS / name)],
            env={**self.environment, "XDG_CURRENT_DESKTOP": compositor},
            capture_output=True,
            text=True,
            timeout=10,
        )

    def assert_wallpaper_applied(self, wallpaper):
        self.assertEqual(self.cache.read_text().strip(), str(wallpaper))
        events = self.events.read_text()
        self.assertIn(f"awww <img> <{wallpaper}>", events)
        self.assertIn(f"matugen <image> <{wallpaper}>", events)

    def test_first_login_applies_wallpaper_in_each_compositor(self):
        wallpaper = self.create_wallpaper()

        for compositor in COMPOSITORS:
            with self.subTest(compositor=compositor):
                self.cache.unlink(missing_ok=True)
                result = self.run_script("awww-matugen-init.sh", compositor)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assert_wallpaper_applied(wallpaper)

    def test_cached_wallpaper_survives_compositor_switch(self):
        wallpaper = self.create_wallpaper()
        self.cache.parent.mkdir(parents=True)
        self.cache.write_text(str(wallpaper) + "\n")

        for compositor in COMPOSITORS:
            with self.subTest(compositor=compositor):
                result = self.run_script("awww-matugen-init.sh", compositor)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assert_wallpaper_applied(wallpaper)

    def test_deleted_cached_wallpaper_falls_back_to_existing_image(self):
        wallpaper = self.create_wallpaper()
        self.cache.parent.mkdir(parents=True)

        for compositor in COMPOSITORS:
            with self.subTest(compositor=compositor):
                self.cache.write_text(str(self.home / "deleted.png") + "\n")
                result = self.run_script("awww-matugen-init.sh", compositor)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assert_wallpaper_applied(wallpaper)

    def test_switch_updates_wallpaper_and_theme_in_each_compositor(self):
        wallpaper = self.create_wallpaper()

        for compositor in COMPOSITORS:
            with self.subTest(compositor=compositor):
                result = self.run_script("awww-wallpaper-switch.sh", compositor)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assert_wallpaper_applied(wallpaper)
                self.assertIn("--transition-type", self.events.read_text())

    def test_empty_directory_does_not_block_login(self):
        for compositor in COMPOSITORS:
            with self.subTest(compositor=compositor):
                result = self.run_script("awww-matugen-init.sh", compositor)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertFalse(self.events.exists())
                self.assertFalse(self.cache.exists())

    def test_empty_directory_reports_no_wallpaper_to_switch(self):
        for compositor in COMPOSITORS:
            with self.subTest(compositor=compositor):
                result = self.run_script("awww-wallpaper-switch.sh", compositor)
                self.assertEqual(result.returncode, 1, result.stderr)
                self.assertIn("No wallpapers found", result.stdout)
                self.assertFalse(self.events.exists())


if __name__ == "__main__":
    unittest.main()
