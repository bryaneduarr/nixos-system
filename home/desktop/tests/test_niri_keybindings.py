import json
from pathlib import Path
import re
import shlex
import subprocess
import unittest


REPOSITORY = Path(__file__).resolve().parents[3]
EVALUATION = REPOSITORY / "home" / "desktop" / "tests" / "evaluate.nix"
BINDING_PATTERN = re.compile(
    r"(?P<key>[^\s{}]+)\s*(?P<properties>[^{}]*?)\{\s*(?P<action>[^{}]*?)\s*\}"
)
APPLICATION_OVERRIDES = {
    "Super+T": 'spawn "kitty";',
    "Super+D": 'spawn "rofi" "-show" "drun";',
}


def normalized_key(key):
    parts = key.lower().split("+")
    modifiers = ["super" if part == "mod" else part for part in parts[:-1]]
    return (*sorted(modifiers), parts[-1])


def parse_bindings(text):
    section = text.split("\nbinds {", 1)[1].rsplit("}", 1)[0]
    bindings = {}

    for line in section.splitlines():
        line = line.strip()
        if not line or line.startswith("//"):
            continue

        match = BINDING_PATTERN.fullmatch(line)
        if match is None:
            raise AssertionError(f"Unsupported binding syntax: {line}")

        key = match["key"]
        normalized = normalized_key(key)
        if normalized in bindings:
            raise AssertionError(f"Duplicate binding: {key}")

        properties = dict(
            property.split("=", 1) for property in shlex.split(match["properties"])
        )
        action = " ".join(match["action"].split())
        bindings[normalized] = {"key": key, "properties": properties, "action": action}

    return bindings


class NiriKeybindingsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        evaluation = subprocess.run(
            ["nix", "eval", "--impure", "--json", "--file", str(EVALUATION)],
            cwd=REPOSITORY,
            check=True,
            capture_output=True,
            text=True,
            timeout=120,
        )
        config = json.loads(evaluation.stdout)["niri"]
        subprocess.run(
            [
                "nix",
                "build",
                "--no-link",
                f'{config["niriSourceDerivation"]}^*',
                f'{config["niriConfigDerivation"]}^*',
            ],
            cwd=REPOSITORY,
            check=True,
            capture_output=True,
            text=True,
            timeout=300,
        )
        cls.upstream = parse_bindings(Path(config["niriDefaultConfig"]).read_text())
        cls.config = parse_bindings(Path(config["niriConfig"]).read_text())

    def test_all_active_upstream_bindings_and_safety_properties_are_available(self):
        overrides = {normalized_key(key): action for key, action in APPLICATION_OVERRIDES.items()}
        self.assertGreater(len(self.upstream), 100)

        for key, upstream in self.upstream.items():
            with self.subTest(binding=upstream["key"]):
                self.assertIn(key, self.config)
                actual = self.config[key]
                self.assertEqual(actual["action"], overrides.get(key, upstream["action"]))

                for name, value in upstream["properties"].items():
                    if name != "hotkey-overlay-title":
                        self.assertEqual(actual["properties"].get(name), value)

    def test_super_is_explicit_and_binding_modifiers_do_not_collide(self):
        self.assertTrue(
            all(not binding["key"].startswith("Mod+") for binding in self.config.values())
        )
        collision = 'binds {\nSuper+Ctrl+Shift+H { quit; }\nSuper+Shift+Ctrl+H { quit; }\n}\n'
        with self.assertRaisesRegex(AssertionError, "Duplicate binding"):
            parse_bindings("\n" + collision)

    def test_custom_desktop_actions_and_window_moves_are_preserved(self):
        expected = {
            "Super+B": 'spawn "zen-twilight";',
            "Super+Shift+D": 'spawn "desktop-theme" "toggle";',
            "Super+Shift+W": r'spawn-sh "bash \"$HOME/.config/wallpapers/awww-wallpaper-switch.sh\"";',
            "Super+P": "switch-preset-column-width;",
            "Super+Alt+Page_Up": "move-window-to-workspace-up;",
            "Super+Alt+Page_Down": "move-window-to-workspace-down;",
        }
        expected.update({
            f"Super+Shift+{workspace}": f'move-window-to-workspace "{workspace}";'
            for workspace in range(1, 6)
        })

        for key, action in expected.items():
            with self.subTest(binding=key):
                self.assertEqual(self.config[normalized_key(key)]["action"], action)

    def test_launcher_and_custom_desktop_actions_have_overlay_titles(self):
        for key in ("Super+T", "Super+D", "Super+B", "Super+Shift+D", "Super+Shift+W"):
            with self.subTest(binding=key):
                properties = self.config[normalized_key(key)]["properties"]
                self.assertTrue(properties.get("hotkey-overlay-title"))


if __name__ == "__main__":
    unittest.main()
