import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest


INSTALLER = Path(__file__).resolve().parents[1] / "install.sh"


class InstallationTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix="t3code-install-test-")
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.home = self.root / "home"
        self.fixtures = self.root / "fixtures"
        self.commands = self.root / "commands"

        for directory in [self.home, self.fixtures, self.commands]:
            directory.mkdir()

        self.appimage = self.home / ".local/share/t3code/T3-Code.AppImage"
        self.cli = self.home / ".local/bin/t3"
        self.payload = b"test AppImage payload"
        (self.fixtures / "AppImage").write_bytes(self.payload)
        (self.fixtures / "installer").write_text(
            'mkdir -p "$T3CODE_INSTALL_BIN_DIR"\n'
            'printf "#!/bin/sh\\nexit 0\\n" > "$T3CODE_INSTALL_BIN_DIR/t3"\n'
            'chmod 755 "$T3CODE_INSTALL_BIN_DIR/t3"\n'
            'printf "%s" "$T3CODE_CHANNEL" > "$TEST_FIXTURES/cli-channel"\n'
        )
        self.release = self.make_release("v1.0.0-nightly.20261002.1")
        self.write_releases([self.release])
        self.write_command(
            "curl",
            '#!/bin/sh\n'
            'output=\nurl=\n'
            'while [ "$#" -gt 0 ]; do\n'
            '  case "$1" in\n'
            '    -o) output="$2"; shift 2 ;;\n'
            '    https://*) url="$1"; shift ;;\n'
            '    *) shift ;;\n'
            '  esac\n'
            'done\n'
            'printf "%s\\n" "$url" >> "$TEST_FIXTURES/requests"\n'
            'case "$url" in\n'
            '  */releases\\?*) file="$TEST_FIXTURES/releases" ;;\n'
            '  *releases/tags/*) file="$TEST_FIXTURES/exact-release" ;;\n'
            '  *.AppImage) file="$TEST_FIXTURES/AppImage" ;;\n'
            '  https://t3.codes/install.sh) file="$TEST_FIXTURES/installer" ;;\n'
            '  *) exit 1 ;;\n'
            'esac\n'
            'if [ -n "$output" ]; then cp "$file" "$output"; else cat "$file"; fi\n',
        )
        self.write_command("uname", '#!/bin/sh\nprintf "x86_64\\n"\n')
        self.environment = dict(
            os.environ,
            HOME=str(self.home),
            XDG_DATA_HOME=str(self.home / ".local/share"),
            PATH=f"{self.commands}:{os.environ['PATH']}",
            TEST_FIXTURES=str(self.fixtures),
        )
        for name in ["T3CODE_CHANNEL", "T3CODE_VERSION", "T3CODE_INSTALL_BIN_DIR"]:
            self.environment.pop(name, None)

    def make_release(self, tag):
        name = f"T3-Code-{tag[1:]}-x86_64.AppImage"
        return {
            "tag_name": tag,
            "draft": False,
            "published_at": "2026-10-02T00:00:00Z",
            "assets": [{
                "name": name,
                "browser_download_url": f"https://github.com/pingdotgg/t3code/releases/download/{tag}/{name}",
                "digest": f"sha256:{hashlib.sha256(self.payload).hexdigest()}",
            }],
        }

    def write_releases(self, releases):
        (self.fixtures / "releases").write_text(json.dumps(releases))
        (self.fixtures / "exact-release").write_text(json.dumps(self.release))

    def write_command(self, name, text):
        path = self.commands / name
        path.write_text(text)
        path.chmod(0o755)

    def run_installer(self, *arguments):
        return subprocess.run(
            ["bash", str(INSTALLER), *arguments],
            env=self.environment,
            text=True,
            capture_output=True,
            timeout=10,
        )

    def install_existing_binaries(self):
        self.appimage.parent.mkdir(parents=True)
        self.appimage.write_bytes(b"existing desktop version")
        self.cli.parent.mkdir(parents=True)
        self.cli.write_text("#!/bin/sh\nexit 0\n")
        self.cli.chmod(0o755)

    def test_fresh_install_defaults_to_nightly(self):
        result = self.run_installer()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.appimage.read_bytes(), self.payload)
        self.assertTrue(os.access(self.appimage, os.X_OK))
        self.assertTrue(os.access(self.cli, os.X_OK))
        self.assertEqual((self.fixtures / "cli-channel").read_text(), "nightly")
        self.assertEqual(list(self.appimage.parent.glob(".install-*")), [])

    def test_activation_preserves_existing_versions_without_network(self):
        self.install_existing_binaries()
        result = self.run_installer()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.appimage.read_bytes(), b"existing desktop version")
        self.assertFalse((self.fixtures / "requests").exists())

    def test_explicit_desktop_update_does_not_update_cli(self):
        self.install_existing_binaries()
        result = self.run_installer("--update-desktop")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.appimage.read_bytes(), self.payload)
        self.assertFalse((self.fixtures / "cli-channel").exists())

    def test_bad_checksum_preserves_desktop(self):
        self.install_existing_binaries()
        (self.fixtures / "AppImage").write_bytes(b"corrupted download")
        result = self.run_installer("--update-desktop")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("checksum mismatch", result.stderr)
        self.assertEqual(self.appimage.read_bytes(), b"existing desktop version")
        self.assertEqual(list(self.appimage.parent.glob(".install-*")), [])

    def test_missing_digest_preserves_desktop(self):
        self.install_existing_binaries()
        self.release["assets"][0]["digest"] = None
        self.write_releases([self.release])
        result = self.run_installer("--update-desktop")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.appimage.read_bytes(), b"existing desktop version")

    def test_missing_cli_does_not_redownload_desktop(self):
        self.install_existing_binaries()
        self.cli.unlink()
        result = self.run_installer()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(self.appimage.read_bytes(), b"existing desktop version")
        self.assertEqual((self.fixtures / "requests").read_text(), "https://t3.codes/install.sh\n")

    def test_stable_channel_excludes_nightly(self):
        stable = self.make_release("v1.0.0")
        self.write_releases([self.release, stable])
        self.environment["T3CODE_CHANNEL"] = "stable"
        result = self.run_installer()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("/v1.0.0/", (self.fixtures / "requests").read_text())
        self.assertEqual((self.fixtures / "cli-channel").read_text(), "stable")

    def test_exact_version_uses_tag_endpoint(self):
        self.environment["T3CODE_VERSION"] = "1.0.0-nightly.20261002.1"
        result = self.run_installer()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("/releases/tags/v1.0.0-nightly.20261002.1", (self.fixtures / "requests").read_text())

    def test_no_matching_release_does_not_install(self):
        self.write_releases([self.make_release("v1.0.0-preview.20261002.1")])
        result = self.run_installer()
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse(self.appimage.exists())

    def test_bad_arguments_do_not_access_network(self):
        result = self.run_installer("--unknown")
        self.assertNotEqual(result.returncode, 0)
        self.assertFalse((self.fixtures / "requests").exists())

    def test_network_failure_preserves_desktop_and_exits(self):
        self.install_existing_binaries()
        self.write_command("curl", "#!/bin/sh\nexit 22\n")
        result = self.run_installer("--update-desktop")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Could not retrieve", result.stderr)
        self.assertEqual(self.appimage.read_bytes(), b"existing desktop version")

    def test_invalid_release_index_exits(self):
        (self.fixtures / "releases").write_text("{}")
        result = self.run_installer()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("not a JSON array", result.stderr)

    def test_broken_cli_symlink_is_repaired(self):
        self.install_existing_binaries()
        self.cli.unlink()
        self.cli.symlink_to(self.home / "missing-cli")
        result = self.run_installer()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertTrue(os.access(self.cli, os.X_OK))

    def test_foreign_download_url_is_rejected(self):
        self.release["assets"][0]["browser_download_url"] = "https://example.invalid/foreign.AppImage"
        self.write_releases([self.release])
        result = self.run_installer()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("not an upstream release", result.stderr)


if __name__ == "__main__":
    unittest.main()
