# Upstream Pi skills

`upstream-sources.tsv` lists Git repositories, branch or tag names, and paths to **skill directories** (not `SKILL.md` files). Separate the three fields with tabs. The skill directory's basename must match its `SKILL.md` frontmatter `name`.

To add a skill, add a row, then run:

```sh
bash scripts/update-all-packages/modules/sync-pi-skills.sh
```

Commit the updated manifest and `skills/upstream/` directory. Home Manager installs every listed skill under `~/.agents/skills/`, which Pi discovers from any working directory. `update-all-packages.sh` fetches the latest commit on each listed branch before rebuilding. Tags stay at their tagged revision. It copies the entire directory (including supporting files), leaves already installed skills untouched if any fetch or validation fails, and does not remove skills deleted from the manifest; remove their old `upstream/` directories when deleting a row. It rejects symlinks in downloaded skills.

The two Cursor skills currently set `disable-model-invocation: true` upstream. They remain available as `/skill:unslop` and `/skill:technical-writing`, but Pi will not select them automatically. The global harness instructions in `../harness/instructions.md` tell the agent when to read and apply them. This sync preserves the upstream files as-is.
