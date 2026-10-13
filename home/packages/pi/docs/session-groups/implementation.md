# Implement session groups in phases

Status: prepared for implementation. No phase is implemented by this documentation change.

Implement the behavior in the [approved design](design.md). Use the [glossary](../../../../../GLOSSARY.md) for naming and [ADR 0001](../../../../../docs/adr/0001-manage-on-demand-session-groups.md) for scope decisions.

## Prepare the worktree

1. Inspect staged, unstaged, and untracked changes before starting each phase.
2. Preserve existing session, inspector, dependency, test, and Nix work. Do not restore or commit unrelated changes.
3. Read the current repository skills and relevant Pi documentation before implementation.
4. Make the declared Pi dependencies available before running tests. Do not update package versions to solve an unrelated environment problem.
5. Run `bun test home/packages/pi/tests` from the repository root to establish a baseline.
6. Keep group creation unavailable until lifecycle and permission gates pass. Do not expose partially protected persistent members to the main session.

When local dependencies are absent, the test suite can fail at module resolution before behavior tests run. Resolve that environment issue or use an isolated test workspace with the declared dependencies. Record which workspace and dependency version produced each result.

## Organize the feature

Keep group state and execution in the proposed `agent-configuration/harness/groups/` directory. These paths are relative to `home/packages/pi/` and do not exist yet.

- Keep lifecycle, role policy, and budgets at the feature root.
- Put task contracts, dependencies, ownership, and acceptance in `groups/board/`.
- Put session creation, activation, and confirmed cancellation in `groups/runtime/`.
- Put message routing and deferred waits in `groups/messaging/`.
- Put private archives and read-only recovery in `groups/history/`.
- Put tool schemas and registration in `groups/tools/`.
- Put Groups-specific presentation in `ui/inspector/groups/`.
- Add focused tests under `tests/session-groups/`.

Create modules when a phase needs them, not as empty scaffolding. Keep each mutation or runtime operation small enough to test independently. Extract code from legacy subagents only when both features actually reuse the same responsibility.

Preserve `subagents/` as the one-shot task implementation. Preserve `sessions/` as the Herdr terminal implementation. Neither directory becomes a second group controller.

## Phase 0: verify SDK contracts

Complete this gate before choosing production session and interruption adapters.

1. Verify that two SDK sessions keep independent histories and can each perform a second activation without replacement.
2. Verify request delivery to idle and busy sessions. Observe follow-up queues, automatic continuation, `message_end`, and `agent_settled` ordering.
3. Verify awaited `abort()`, idle acknowledgement, and `dispose()` behavior. Include an active tool and an approved command with a descendant process.
4. Verify how user interruption, `/new`, resume, fork, reload, and shutdown reach the main extension. Distinguish these events from normal settlement and terminal focus. Test the proposed reload-close adapter before extension teardown.
5. Verify that explicit tools, custom tools, resource loading, inactive deferred tools, and codemode cannot bypass member capabilities.
6. Verify model and reasoning inheritance, context policy, and persistent transcript creation. Include a group closed before any model message creates a session file.
7. Freeze the management tool names, event schema, archive path, and identity rules after recording the observations.

Use the installed host's `docs/sdk.md`, `docs/extensions.md`, `docs/tui.md`, `docs/sessions.md`, and `docs/session-format.md`. Follow their relevant local cross-references. Review declarations and source when documentation does not establish a required guarantee.

Gate: provide reproducible tests for cancellation acknowledgement and capability denial. Do not replace either guarantee with prompt instructions. If the SDK cannot establish safe cancellation for a tool, exclude that tool from group workers and report the limitation.

Keep the agreed hierarchy and policies unchanged. Escalate any SDK limitation that would require a product-policy change.

## Phase 1: implement the board and policy model

Build pure state transitions without creating SDK sessions.

1. Define group, member, task, assignment, message, and event records with stable IDs and schema versions.
2. Validate focused task contracts, missing dependencies, dependency cycles, subtask scope, and permission inheritance.
3. Implement task creation, assignment, submission, acceptance, focused correction, blocking, failure, cancellation, and reassignment state.
4. Enforce one live group, one coordinator, one owner per task, and one current task per worker.
5. Implement shared accounting for active slots, lifetime membership, depth, activations, messages, and active assignment time.
6. Track a stable goal identity across recovery and replacement. Reject fresh-group budget resets for the same unfinished goal without user authorization.

Add proposed `tests/session-groups/board.test.ts` and `policy.test.ts`. Use fake clocks and deterministic IDs.

Gate: prove that acceptance alone unblocks dependencies, generation checks reject stale submissions, and pause or reassignment never resets consumed budgets. Prove the default depth chain of main session, coordinator, worker, and delegated worker. Distinguish queued capacity from exhausted cumulative budgets. Test the final allowed activation and member creation at the depth boundary.

Treat each numbered item as a separate bounded implementation assignment. Split any item that cannot be completed within a focused task contract.

## Phase 2: implement private archives

Build history storage before live persistent members become available.

1. Implement versioned events and atomic snapshots under the private archive root selected in Phase 0.
2. Persist board mutations, identities, permissions, counters, message delivery state, and termination reasons.
3. Store finalized member transcripts and tool outputs with references to large artifacts.
4. Enforce private directory and file modes. Reject unsafe IDs and path traversal.
5. Recover closed and interrupted groups as read-only records without creating SDK sessions.
6. Handle incomplete final writes, corrupt records, missing artifacts, and unsupported schema versions without dispatching work.

Add proposed `tests/session-groups/history.test.ts`.

Gate: opening history performs zero model calls, sends zero messages, and starts zero member sessions. Recover a setup-only group with no conversation file. Preserve interrupted evidence without treating the group as live.

Keep archive deletion consistent with explicit main-history deletion. Do not introduce automatic retention expiry in this phase.

## Phase 3: implement member runtime and cancellation

Connect the tested controller to SDK sessions behind an internal, unavailable-to-model entry point.

1. Create independent coordinator and worker sessions with explicit capabilities, selected resources, and focused briefings.
2. Retain session handles after an assignment settles. Separate member lifetime from activation lifetime.
3. Count model-driven activations and active assignment duration. Release active slots for idle or peer-waiting members.
4. Implement awaited cancellation with execution-generation invalidation before awaiting shutdown.
5. Implement pause, explicit resume, member stop with descendant cancellation, and group closure.
6. Connect main conversation replacement and shutdown to group closure. Connect user interruption to pause using the adapter verified in Phase 0.
7. Isolate worker failures and pause on coordinator failure. Require explicit main-session recovery.

Add proposed `tests/session-groups/runtime.test.ts` and `lifecycle.test.ts`. Use an injectable session factory for deterministic tests and a small real-SDK integration test for the verified boundary.

Gate: prove that a second assignment reuses the member conversation, closed members cannot activate, and old executions cannot mutate board state. Confirm cancellation before transferring ownership. Do not report closure merely because abort was requested.

Include main-session exit during a tool call, repeated close, pause during spawn, coordinator failure during acceptance, and delayed tool completion after cancellation. Assert that pause returns unfinished active tasks to `queued` after acknowledgement without losing owners. Assert that resume activates the coordinator first and requires fresh worker execution generations. Keep unconfirmed cancellation in `Pausing`.

## Phase 4: implement peer messaging and scheduling

Route messages through the same controller that owns assignments and budgets.

1. Validate addressed request and update envelopes. Bind sender identity to the host's tool instance.
2. Enforce same-group recipients and task references for actionable messages. Bind worker requests to the recipient's owned assignment, not the sender's task as a new assignment.
3. Queue requests at safe boundaries for busy recipients. Return from sends promptly.
4. Store updates without automatic recipient activation or acknowledgement loops.
5. Implement deferred peer waits that settle the current activation and release its slot.
6. Schedule authorized follow-ups fairly within the four-active-member limit. Keep queued work dormant while paused.
7. Record delivery failure, stopped recipients, duplicate message handling, and members awaiting cancelled descendants.

Add proposed `tests/session-groups/messaging.test.ts` and `scheduling.test.ts`.

Gate: fill every active slot, then exercise queued delegation and peer waits without deadlock. Demonstrate that updates do not spend activations. Demonstrate that a paused group cannot be awakened by message arrival. Reject stale and out-of-scope requests. Keep requests for dependency-blocked assignments dormant and require coordinator action for submitted or terminal tasks.

Reject circular task dependencies. Surface unsatisfied peer waits as blockers instead of generating polling turns or unlimited messages.

## Phase 5: implement role tools and coordination

Expose only complete, host-enforced operations. Keep group startup explicitly gated until the remaining inspector and rollout checks pass.

1. Register the schemas frozen in Phase 0. Return member handles, task records, or status snapshots instead of waiting for whole conversations.
2. Enforce role, task scope, lifecycle, generation, and budget checks before every side effect.
3. Restrict the coordinator to management and member evidence. Deny repository investigation and command tools.
4. Restrict workers to inspection, group operations, and exact approved verification commands. Exclude legacy task delegation, editing, arbitrary shell, and deferred execution bypasses.
5. Require a visible subtask before worker-created descendants start. Reserve membership and depth atomically before session creation.
6. Add coordinator instructions for short contracts, focused corrections, acceptance, escalation, and milestone reporting.
7. Add main-session guidance for selective group creation, final outcome checks, and explicit closure.
8. Integrate management tool names with `harness/index.ts` registration and allowlist enforcement. Preserve all legacy task parameters and roles.

Add proposed `tests/session-groups/tools.test.ts` and `coordination.test.ts`. Retain existing `subagent-roles.test.ts`, `subagent-implementation-queue.test.ts`, and `subagent-card.test.ts` coverage.

Gate: reject forged sender identities, unauthorized coordinator creation, cross-group routing, broader child permissions, and autonomous limit increases. Verify that no group starts for an ordinary main-session task.

Require the main session to approve each task's exact verification-command list. The coordinator can delegate a permitted subset but cannot expand command authority.

## Phase 6: add the Alt+I Groups page

Integrate into the existing inspector instead of opening a competing overlay.

1. Add the Groups destination to `ui/inspector/input.ts` and `frame.ts`. Preserve existing numeric destinations and keyboard behavior.
2. Add Groups-specific board and member views under `ui/inspector/groups/`.
3. Connect group state and history subscriptions through `ui/inspector/index.ts`, `navigation.ts`, and `view.ts`.
4. Render groups even when the legacy activity store is empty. Keep selection and scrolling stable during live updates.
5. Show contracts, dependencies, submissions, member transcripts, messages, tool outputs, errors, and budgets.
6. Add targeted instruction, member stop, group pause, resume, and close actions through the authorized controller.
7. Make archived groups read-only. Disable runtime controls for closed, interrupted, or incompatible history.
8. Preserve narrow-terminal layouts, mouse navigation, copying, and output-artifact inspection.

Add proposed `tests/session-groups/inspector.test.ts`. Run existing activity-navigation, inspector-task-detail, inspector-usage, prompt-browser, and thinking-box tests.

Gate: the Groups page works without tool-history entries and without member activation. User interventions appear in the audit history and reach the main session and coordinator. Inspector exit does not pause or close the group.

## Phase 7: validate and enable on-demand groups

Enable group creation only after every previous gate passes.

1. Run the complete Pi suite with the declared dependencies.
2. Run deterministic adversarial lifecycle and authorization tests.
3. Run one bounded interactive collaboration with a coordinator and two workers.
4. Exercise worker follow-ups, a scoped delegated worker, evidence acceptance, and final main-session reporting.
5. Exercise interruption and explicit resume, coordinator failure, safe reassignment, exhausted budgets, and main-session exit.
6. Reopen the resulting history and verify that no members restart.
7. Confirm ordinary tasks and legacy one-shot delegation behave as before.
8. Update the Pi README with implemented commands and controls. Remove the planned-feature label only after these checks pass.

Keep the core controller usable without TUI rendering, but do not create unattended groups automatically in print, JSON, or RPC mode. Test the interactive startup gate explicitly before expanding supported entry points.

Check that Home Manager continues to install only runtime configuration. Do not import or install repository `.agents/` skills or design documents through Nix modules.

## Verify each delivery

Run these checks from the repository root:

```sh
bun test home/packages/pi/tests
git diff --check
git diff --cached --check
nix eval --offline --no-write-lock-file --raw .#packages.x86_64-linux.pi-tools.drvPath
nix eval --offline --no-write-lock-file --raw .#nixosConfigurations.nixos.config.system.build.toplevel.drvPath
```

If dependencies are unavailable, record the unresolved imports instead of reporting a passing suite. If offline evaluation lacks an input, report that limitation before attempting a different validation path.

Inspect every existing Nix file in the current change set, including unrelated files. Run `statix check`, format with `nixfmt`, and run `nixfmt --check` on each changed Nix file. Fix `W20` diagnostics and check mixed parent-set and dotted declarations manually. Preserve unrelated behavior and staging state.

For structure-only changes, compare evaluated settings before and after the change. Do not activate the system to validate a refactor. Use `nrs` only when an approved installation or rebuild is required.

## Check the release scenarios

- Start two competing creation requests and verify that only one live group exists.
- Start competing claims and verify that a task has one owner.
- Fill the active limit while the coordinator receives a blocker. Verify eventual coordination without deadlock.
- Send repeated updates and verify that no model acknowledgement loop starts.
- Attempt a new group for an exhausted unfinished goal and verify that the budget is not reset.
- Stop a parent worker while its delegated worker runs an approved command. Verify process termination before reassignment.
- Deliver an old result after a task contract changes. Verify rejection by revision and generation.
- Fail the coordinator during a worker submission. Verify pause and preserved evidence.
- Replace the main conversation while requests are queued. Verify closure rather than message replay.
- Exit abruptly and reopen history. Verify interrupted records with no live sessions.
- Open Groups before any legacy activity exists. Verify rendering and empty-state navigation.
- Attempt editing, arbitrary shell, codemode, deferred tool execution, and forged management authority from a member. Verify denial.

## Commit and delivery boundaries

Keep each phase independently reviewable, with its tests in the same commit as the behavior they verify. Split distinct schema, runtime, messaging, UI, and rollout changes when their dependencies permit it. Keep group startup unavailable until the complete policy is enforced.

Use concise Conventional Commit titles. Stage explicit paths or hunks and preserve unrelated work. Do not include existing package, session, inspector, or Nix changes solely because they appear in the same worktree.

The proposed phase order is:

```text
0. Verified SDK contracts
1. Board and policy model
2. Private archives
3. Member runtime and cancellation
4. Peer messaging and scheduling
5. Role tools and coordination
6. Alt+I Groups page
7. Validated on-demand startup
```

Before assigning a phase item to a worker, convert it into one task contract with precise paths, exclusions, completion evidence, and exact permitted checks. Do not assign an entire phase as a worker's mission.
