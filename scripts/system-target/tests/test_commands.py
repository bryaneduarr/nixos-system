import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
import unittest


REPOSITORY = Path(__file__).resolve().parents[3]


class SystemTargetTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.repository = self.root / "nixos-system"
        shutil.copytree(REPOSITORY / "scripts", self.repository / "scripts")
        self.bin = self.root / "bin"
        self.bin.mkdir()
        self.log = self.root / "commands.jsonl"
        self.environment = os.environ.copy()
        for name in ("WSL_DISTRO_NAME", "WSL_INTEROP", "NIXOS_REBUILD_TARGET"):
            self.environment.pop(name, None)
        self.environment.update(
            PATH=f"{self.bin}:{os.environ['PATH']}",
            HOME=str(self.root),
            COMMAND_LOG=str(self.log),
            TEST_HOST="Linux",
            TEST_HOSTNAME="nixos",
            TEST_ARCH="x86_64",
            TEST_RELEASE="6.12.0",
        )
        self.write_executable("uname", """#!/usr/bin/env bash
case "$1" in
  -s) printf '%s\\n' "$TEST_HOST" ;;
  -n) printf '%s\\n' "$TEST_HOSTNAME" ;;
  -m) printf '%s\\n' "$TEST_ARCH" ;;
  -r) printf '%s\\n' "$TEST_RELEASE" ;;
  *) exit 1 ;;
esac
""")
        command_mock = """#!/usr/bin/env python3
import json
import os
import sys
with open(os.environ["COMMAND_LOG"], "a") as output:
    output.write(json.dumps([os.path.basename(sys.argv[0]), *sys.argv[1:]]) + "\\n")
if os.path.basename(sys.argv[0]) == "bun":
    if sys.argv[1:2] == ["update"]:
        sys.exit(int(os.environ.get("TEST_BUN_UPDATE_STATUS", "0")))
    if sys.argv[1:] == ["pm", "--global", "cache", "rm"]:
        sys.exit(int(os.environ.get("TEST_BUN_CLEANUP_STATUS", "0")))
if sys.argv[1:2] == ["build"]:
    print("got: sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=", file=sys.stderr)
    sys.exit(1)
"""
        for command in ("sudo", "nix", "bun"):
            self.write_executable(command, command_mock)
        modules = self.repository / "scripts/update-all-packages/modules"
        (modules / "update-pi-dependencies.sh").write_text(
            'update_pi_dependencies() { nix test-update-pi; }\n'
        )
        (modules / "verify-pi.sh").write_text('verify_pi() { nix test-verify-pi; }\n')
        self.pi_definition = self.repository / "home/packages/pi/pi-tools/default.nix"
        self.pi_definition.parent.mkdir(parents=True)
        self.pi_definition.write_text('  npmDepsHash = "previous";\n')

    def write_executable(self, name, content):
        destination = self.bin / name
        destination.write_text(content)
        destination.chmod(0o755)

    def run_command(self, command):
        return subprocess.run(
            command,
            env=self.environment,
            cwd=self.root,
            text=True,
            capture_output=True,
            timeout=20,
        )

    def commands(self):
        if not self.log.exists():
            return []
        return [json.loads(line) for line in self.log.read_text().splitlines()]

    def select(self):
        selector = self.repository / "scripts/system-target/select-target.sh"
        return self.run_command([
            "bash", "-c",
            'source "$1"; select_system_target || exit; printf "%s %s" "$rebuild_target" "$rebuild_system_architecture"',
            "test", str(selector),
        ])

    def test_selector_matrix(self):
        cases = [
            ("Linux", "x86_64", "6.12", "", "", "nixos x86_64-linux"),
            ("Linux", "x86_64", "6.6-microsoft-standard-WSL2", "", "", "wsl-x86_64 x86_64-linux"),
            ("Linux", "aarch64", "6.6-Microsoft-standard-WSL2", "", "", "wsl-aarch64 aarch64-linux"),
            ("Linux", "arm64", "6.6", "NixOS", "", "wsl-aarch64 aarch64-linux"),
            ("Linux", "x86_64", "6.6", "", "/run/WSL/interop", "wsl-x86_64 x86_64-linux"),
            ("Linux", "aarch64", "6.6", "", "", None),
            ("Linux", "riscv64", "6.6-microsoft", "", "", None),
            ("Darwin", "x86_64", "6.6", "", "", None),
        ]
        for host, architecture, release, distro, interop, expected in cases:
            with self.subTest(host=host, architecture=architecture, release=release):
                self.environment.update(TEST_HOST=host, TEST_ARCH=architecture, TEST_RELEASE=release,
                                        WSL_DISTRO_NAME=distro, WSL_INTEROP=interop)
                result = self.select()
                if expected is None:
                    self.assertNotEqual(result.returncode, 0)
                    self.assertEqual(result.stdout, "")
                else:
                    self.assertEqual(result.returncode, 0, result.stderr)
                    self.assertEqual(result.stdout, expected)

    def test_unknown_native_hostname_stops_before_changes(self):
        self.environment["TEST_HOSTNAME"] = "unregistered-machine"
        self.assertNotEqual(self.select().returncode, 0)
        for script in ("system-target/rebuild.sh", "update-all-packages/update-all-packages.sh"):
            result = self.run_command(["bash", str(self.repository / "scripts" / script)])
            self.assertNotEqual(result.returncode, 0)
            self.assertEqual(self.commands(), [])

    def test_override_is_explicit_and_validated(self):
        self.environment.update(TEST_ARCH="unknown", TEST_HOST="Unknown")
        for target, architecture in (("nixos", "x86_64-linux"), ("wsl-x86_64", "x86_64-linux"),
                                     ("wsl-aarch64", "aarch64-linux")):
            with self.subTest(target=target):
                self.environment["NIXOS_REBUILD_TARGET"] = target
                result = self.select()
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.stdout, f"{target} {architecture}")
        self.environment["NIXOS_REBUILD_TARGET"] = "unlisted"
        self.assertNotEqual(self.select().returncode, 0)

    def shell_function(self, shell, name):
        if shell == "zsh":
            source = (REPOSITORY / "scripts/system-target/commands.zsh").read_text()
            body = re.search(rf"^{name}\(\) \{{\n(.*?)^\}}", source, re.S | re.M).group(1)
            definition = f"{name}() {{\n{body}\n}}"
        else:
            source = (REPOSITORY / "home/packages/fish/default.nix").read_text()
            body = re.search(rf"      {name} = ''\n(.*?)\n      '';", source, re.S).group(1)
            definition = f"function {name}\n{body}\nend"
        return definition.replace("${config.home.homeDirectory}", str(self.root))

    def test_rebuild_and_shell_command_plumbing(self):
        cases = [("x86_64", "6.12", "nixos"), ("x86_64", "6.6-microsoft", "wsl-x86_64"),
                 ("aarch64", "6.6-microsoft", "wsl-aarch64")]
        for architecture, release, target in cases:
            for shell in ("bash", "zsh", "fish"):
                with self.subTest(architecture=architecture, shell=shell):
                    self.environment.update(TEST_ARCH=architecture, TEST_RELEASE=release)
                    self.log.unlink(missing_ok=True)
                    if shell == "bash":
                        command = ["bash", str(self.repository / "scripts/system-target/rebuild.sh"), "--show-trace", "two words"]
                    else:
                        command = [shell, "-c", self.shell_function(shell, "nrs") + '\nnrs --show-trace "two words"']
                    result = self.run_command(command)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    reference = f"path:{self.repository}#{target}"
                    self.assertIn(reference, result.stdout)
                    limits = ["--max-jobs", "1", "--cores", "2"] if target.startswith("wsl-") else []
                    self.assertEqual(self.commands(), [["sudo", "nixos-rebuild", "switch", "--flake", reference,
                                                        *limits, "--show-trace", "two words"]])

    def test_nonactivating_rebuild_actions(self):
        self.environment["TEST_RELEASE"] = "6.6-microsoft"
        for action in ("build", "dry-build"):
            with self.subTest(action=action):
                self.log.unlink(missing_ok=True)
                result = self.run_command([
                    "bash", str(self.repository / "scripts/system-target/rebuild.sh"), action, "--show-trace"
                ])
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(self.commands(), [[
                    "sudo", "nixos-rebuild", action, "--flake",
                    f"path:{self.repository}#wsl-x86_64", "--max-jobs", "1", "--cores", "2", "--show-trace"
                ]])

    def test_update_pipeline_and_nfu_use_one_repository_and_architecture(self):
        for architecture, release, target, system in [
            ("x86_64", "6.12", "nixos", "x86_64-linux"),
            ("x86_64", "6.6-microsoft", "wsl-x86_64", "x86_64-linux"),
            ("aarch64", "6.6-microsoft", "wsl-aarch64", "aarch64-linux"),
        ]:
            for shell in ("bash", "zsh", "fish"):
                with self.subTest(architecture=architecture, shell=shell):
                    self.environment.update(TEST_ARCH=architecture, TEST_RELEASE=release)
                    self.log.unlink(missing_ok=True)
                    if shell == "bash":
                        command = ["bash", str(self.repository / "scripts/update-all-packages/update-all-packages.sh"), "--show-trace"]
                    else:
                        command = [shell, "-c", self.shell_function(shell, "nfu") + "\nnfu --show-trace"]
                    result = self.run_command(command)
                    self.assertEqual(result.returncode, 0, result.stderr)
                    reference = f"path:{self.repository}"
                    self.assertIn(f"{reference}#{target}", result.stdout)
                    limits = ["--max-jobs", "1", "--cores", "2"] if target.startswith("wsl-") else []
                    self.assertEqual(self.commands(), [
                        ["nix", "test-update-pi"],
                        ["nix", "flake", "update", "--flake", reference],
                        ["nix", "build", "--no-link", "--impure", f"{reference}#packages.{system}.pi-tools", *limits],
                        ["sudo", "nixos-rebuild", "switch", "--flake", f"{reference}#{target}", *limits, "--show-trace"],
                        ["nix", "test-verify-pi"],
                    ])
                    self.assertNotIn("fakeHash", self.pi_definition.read_text())

    def test_unsupported_host_stops_before_maintenance_or_rebuild(self):
        for architecture, host in (("aarch64", "Linux"), ("unknown", "Linux"), ("x86_64", "Darwin")):
            for script in ("system-target/rebuild.sh", "update-all-packages/update-all-packages.sh"):
                with self.subTest(architecture=architecture, host=host, script=script):
                    self.environment.update(TEST_ARCH=architecture, TEST_HOST=host)
                    result = self.run_command(["bash", str(self.repository / "scripts" / script)])
                    self.assertNotEqual(result.returncode, 0)
                    self.assertEqual(self.commands(), [])


if __name__ == "__main__":
    unittest.main()
