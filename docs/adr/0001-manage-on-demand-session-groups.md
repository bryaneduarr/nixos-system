---
status: accepted
---

# Manage on-demand session groups through a coordinator

The existing `task` tool delegates isolated missions but does not maintain a shared team or task board. Session groups need focused assignments, peer communication, and retained evidence without requiring the main conversation to manage every exchange.

Use one main session with final authority, one coordination-only member, and workers with short task contracts. The coordinator manages execution and accepts individual results. The main session checks the overall outcome and communicates with the user. Groups are optional and belong to the main conversation, not a permanent background service.

## Considered options

- Direct management by the main session avoids a coordination layer but mixes user communication with assignment traffic.
- A permanent peer network supports independent terminals but does not match main-session ownership and shutdown.
- Reusing a task plugin would reduce some board work but couples the design to another task lifecycle. The reviewed [pi-messenger documentation](https://github.com/nicobailon/pi-messenger/blob/main/README.md) describes its own worker launcher and message-triggered steering. [rpiv-todo](https://pi.dev/packages/@juicesharp/rpiv-todo) deliberately isolates lists by session.

## Consequences

Build a harness-owned task board and group orchestration. The extra coordinator consumes model resources, so ordinary work remains in the main session. The coordinator has no repository investigation tools. Workers have inspection, group communication, and exact approved verification commands, but no editing tools or unrestricted shell in the first version.

Closing or replacing the main conversation closes the group. Archives remain inspectable without restarting members. Existing one-shot task behavior remains separate and compatible.

The [approved design](../../home/packages/pi/docs/session-groups/design.md) defines behavior. The [implementation plan](../../home/packages/pi/docs/session-groups/implementation.md) defines delivery phases and verification gates.
