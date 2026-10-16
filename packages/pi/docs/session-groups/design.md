# Session group design

Status: approved behavior, not implemented. This reference records the agreed first version. Technical contracts marked as proposed remain subject to the verification gate in the [implementation plan](implementation.md).

The [glossary](../../../../../GLOSSARY.md) defines the domain terms. [ADR 0001](../../../../../docs/adr/0001-manage-on-demand-session-groups.md) records the hierarchy and the decision to build a harness-owned board.

## Purpose and scope

A group supports collaboration around one concrete goal. The main session creates a group when the user requests one or when distinct investigations or an independent review justify collaboration. Autonomous creation includes a stated reason. Ordinary work does not create a group.

Each main session has at most one live group. A paused group remains live. Groups are not permanent assistants, independent terminals, or a background service.

The first version includes persistent member conversations during the group's lifetime, focused tasks, peer messages, bounded delegation, retained debugging history, and an inspector. It excludes member editing tools, unrestricted shell access, automatic recovery after main-session exit, multiple coordinators, and third-party board plugins.

## Roles and authority

```text
User
└── Main session
    └── Coordinator
        ├── Worker
        ├── Worker
        └── Worker
            └── Delegated worker
```

| Role | Responsibility | Boundary |
| --- | --- | --- |
| Main session | Communicate with the user, set the goal and constraints, create or replace the coordinator, check the outcome, and close the group | Only the user authorizes higher resource limits |
| Coordinator | Create and assign tasks, manage dependencies and blockers, inspect evidence, accept or return submissions, and report milestones | No repository searches, commands, edits, or changes to overall scope or permissions |
| Worker | Execute one precise task, communicate with peers, and submit evidence | No silent scope expansion or changes to another member's assignment |
| Delegated worker | Execute a visible subtask within its parent's scope | No further delegation at the default depth limit |

The main session remains authoritative even when the coordinator accepts all individual tasks. A coordinator sends milestone reports, decisions requiring escalation, blockers, and a final summary. It does not directly announce success to the user.

The coordinator receives the group goal as coordination context, not as an assignment to implement the entire project. Only the main session creates or replaces the coordinator.

## Task contracts and ownership

Each task has one owner. Each worker performs one assigned task at a time. A member can complete several tasks without acquiring responsibility for the entire goal.

A task contract contains these fields:

| Field | Requirement |
| --- | --- |
| Objective | One question to answer or one deliverable to produce |
| Scope | Relevant area and explicit exclusions |
| Context | Focused background and references, not the whole main conversation |
| Completion criteria | An observable condition for submitting the task |
| Evidence | Required findings, file references, checks, or other outputs |
| Permissions | Allowed inspection tools and exact approved verification commands |
| Dependencies | Tasks whose accepted results are prerequisites |

Aim for fewer than 150 words, excluding references. This is a writing target, not a substitute for a complete contract. A task that exceeds its scope or expected duration produces a blocker or a proposed separate task.

A typical worker task is:

> Determine whether configuration loading accepts an empty file. Inspect the loader and existing tests. Return the relevant file references and missing coverage. Do not investigate unrelated parsing behavior. Submit a conclusion supported by those references.

Every descendant has a visible subtask before its session starts. Workers may create scoped subtasks within their delegation permissions. Subtasks cannot grant broader tools or commands than their parent permits. Broader work goes to the coordinator and, when it changes the goal, to the main session.

The coordinator owns ordinary assignment and reassignment. Members cannot take over or reassign another member's task.

## Task board and acceptance

The shared board records task contracts, owners, parent tasks, dependencies, status, submissions, and reassignment history. The member hierarchy is a separate view of conversations and current activity.

| Task status | Meaning |
| --- | --- |
| `queued` | The task awaits authorized execution, assignment, or an unmet dependency |
| `active` | The current owner is executing the assignment |
| `blocked` | The task needs a decision, information, or an unavailable resource |
| `submitted` | The owner supplied a result for coordinator acceptance |
| `accepted` | The coordinator found that the result meets the contract |
| `failed` | The assignment failed and needs an explicit recovery decision |
| `cancelled` | The task is no longer being pursued |

Readiness is derived from accepted dependencies, not a separate task status. Idle member status does not establish task completion.

Workers submit a concise result, evidence, and unresolved issues. The coordinator accepts a submission or requests a focused correction. Dependencies unblock only after acceptance. Independent review is optional.

Reassignment first cancels the old assignment and its active descendants. Ownership transfers only after cancellation is confirmed. Partial findings remain available to the new owner. Late submissions from the cancelled assignment are rejected and recorded.

The main session checks required tasks and unresolved blockers before reporting the overall outcome. Early closure identifies unfinished or cancelled work rather than claiming success.

## Messaging and waiting

Members can send direct messages to any member of the same group. Messages remain available in the inspector.

| Kind | Delivery behavior |
| --- | --- |
| Request | References a task and can schedule an idle recipient for work |
| Update | Supplies findings without automatically demanding another activation |

Busy recipients receive requests at a safe boundary without interrupting their current tool. Sending returns promptly. It does not hold a model turn open until a reply arrives.

Actionable messages reference a task ID. Small clarifications remain within that task. New deliverables require a new task or subtask. An update may reference the group without creating work.

Waiting for another member releases an active-work slot. A waiting member remains available but does not generate polling conversations. Paused groups queue requests without activating recipients. Informational messages cannot create automatic acknowledgement loops.

The main session receives concise findings and blockers, not a transcript of every exchange. Targeted user instructions from the inspector are recorded and visible to the main session and coordinator. They do not bypass permissions or budgets.

## Permissions and model settings

The coordinator receives board, messaging, delegation, and member-inspection tools. It can inspect submitted evidence and activity, but it cannot investigate the repository itself.

Workers receive repository inspection tools, group tools, and exact approved verification commands. They do not receive editing tools, arbitrary shell execution, or the legacy generic `task` role as an escalation path.

Permissions are enforced by the host, not inferred from task prose. Delegation cannot increase permissions. Verification commands require an explicit approved list. Approval permits the exact command, not additional flags or shell operators.

These restrictions are not an operating-system sandbox. An approved test can write caches or generated artifacts. The main session must assess command side effects before approving it. No system activation or rebuild is authorized by a worker task.

Members initially inherit the main session's model and reasoning setting when created. The first version does not autonomously switch models or select more expensive alternatives. Future configurable model policies are outside this delivery scope.

## Resource limits

| Group limit | Default | Accounting |
| --- | --- | --- |
| Active members | 4 | Includes an actively working coordinator, excludes the main session |
| Members created | 12 | Includes the coordinator and replacements across the group's lifetime |
| Delegation depth | 3 | Coordinator at depth 1, workers at depth 2, delegated workers at depth 3 |
| Member activations | 40 | Includes initial assignments and actionable follow-ups |
| Messages between members | 100 | Includes requests and updates |
| Active assignment time | 10 minutes | Applies to active work, not idle or peer-waiting periods |

All descendants share the same budgets. Idle and waiting members release active-work slots. Failed activations, cancelled work, and replacement coordinators do not refund consumed resources.

Enforce each limit against the resource it bounds. Four occupied active slots queue additional work. The membership and depth limits reject additional member creation beyond those limits, not work by existing eligible members. Activation and message limits prevent new model-driven activity once their budgets are exhausted. An assignment timeout cancels that assignment.

Preserve findings and notify the main session when a budget prevents progress. Do not silently raise limits or create a new group to reset the budget for the same unfinished goal. Only the user authorizes a higher limit. The proposed boundary accounting below defines how the final permitted activation completes.

These limits bound activity, not monetary cost or token totals. The inspector also reports observed usage. Pause, reassignment, and coordinator recovery preserve accounting.

## Group lifecycle

| State | Behavior |
| --- | --- |
| Running | Authorized tasks and requests can activate members |
| Pausing | New work is rejected while active assignments reach confirmed cancellation |
| Paused | Dispatch and message-triggered activations remain stopped, and conversations remain available |
| Closing | New work is rejected while cancellation and disposal complete |
| Closed | Only historical inspection remains |

Finishing an assignment leaves its member idle and available for follow-ups. Idle members do not spend model tokens.

Interrupting the main session's active work pauses its group. Resume is explicit. The pause action cancels active assignments without erasing their contracts or partial findings.

An ordinary worker failure is isolated. Its parent and coordinator receive the failure and partial findings. The coordinator reports relevant blockers to the main session. Other workers may continue. No replacement is automatically spawned.

A coordinator failure pauses the entire group. The main session explicitly resumes or replaces the coordinator. The board, conversations, and consumed budgets survive replacement.

Explicitly stopping a member cancels its descendants and informs members awaiting their findings. Closing the group disposes of all live member sessions.

Exiting the main session, replacing its conversation, or explicitly closing the group closes all members and descendants. Focusing another terminal does not replace the main conversation and does not close its group.

Historical restoration never silently restarts members. After an abrupt process exit, recovered history represents interrupted work, not a resumable live group. Graceful shutdown must await cancellation acknowledgement where the SDK permits it.

## Inspector and history

Add a dedicated **Groups** page to the existing `Alt+I` inspector. Normal transcript output remains compact.

The page includes these views and actions:

- The task board, owners, dependencies, status, and submissions.
- The member hierarchy, roles, assigned tasks, and current activity.
- Member conversations and addressed messages.
- Tool arguments, results, errors, and referenced output artifacts.
- Model and reasoning settings, observed usage, and consumed budgets.
- Targeted instructions, member stop, group pause, resume, and closure.
- Read-only inspection of closed or interrupted groups.

Inspection exposes recorded activity and model outputs, not a guarantee of access to internal reasoning. Opening or closing the inspector does not activate members.

Retain local transcripts, messages, tool activity, and completion reasons alongside the main session's history. Opening archives creates no model sessions. Archives can contain sensitive repository content and command output. Their storage must remain private and must not be committed to the repository.

## Proposed technical contracts

The following contracts are implementation proposals. Phase 0 verifies their SDK assumptions before production integration.

### Host-owned records

Keep the board and membership outside individual member conversation histories. Serialize mutations through one group controller. Independent session files are evidence, not a transaction mechanism for shared ownership.

| Record | Minimum fields |
| --- | --- |
| Group | Group ID, main conversation identity, goal identity, creation reason, coordinator ID, lifecycle, policy, budget counters, and event sequence |
| Member | Member ID, role, parent ID, depth, conversation reference, lifecycle, current assignment, model settings, and usage |
| Task | Task ID, parent task, contract, dependencies, owner, revision, status, submission, and history |
| Assignment | Assignment ID, task revision, owner, execution generation, active duration, and cancellation state |
| Message | Message ID, sender, recipient, kind, task reference when actionable, correlation reference, body, and delivery state |
| Event | Sequence, timestamp, group and member references, event type, and payload or artifact reference |

Use stable IDs rather than display names for routing. Bind sender identity and role to the tool instance supplied by the host. Never trust a model-provided sender, role, group, or approval claim.

An assignment generation rejects results from cancelled or superseded execution. A task revision prevents acceptance of evidence for a changed contract. Dependency validation rejects missing prerequisites and cycles.

### Scheduling and assignment transitions

Reserve active slots and cumulative budgets atomically before work starts. An activation that reserves the final permitted activation can finish within its remaining assignment time. No later activation starts. At the message cap, no new member message is sent and no further activation starts. Already-reserved activations may finish and submit evidence without creating new requests. Host-generated budget and failure reports remain available without member model calls.

On pause, close dispatch immediately and invalidate active execution generations before awaiting cancellation. After acknowledgement, return unfinished active tasks to `queued` while retaining their owners and partial findings. Cancelled execution records remain historical assignments, not cancelled tasks. Accepted, submitted, failed, and already-blocked tasks retain their statuses. All descendants remain idle rather than restarting independently.

An explicit main-session resume schedules the coordinator first. The coordinator revalidates queued work and dispatches fresh execution generations. Workers do not automatically replay old activations or queued messages. If cancellation is unconfirmed, keep the group in `Pausing` and deny resume, reassignment, and new execution.

Normal task transitions are `queued` to `active`, `active` to `submitted`, and `submitted` to `accepted`. A focused correction returns a submission to `queued` for the same owner. Explicit recovery returns a blocked or failed task to `queued`. Reassignment returns unfinished work to `queued` only after cancellation acknowledgement. Closure can cancel unfinished tasks. Accepted results remain historical evidence.

A worker request references the recipient's assigned task, with optional related task references for the sender's context. A request is a follow-up within the recipient's existing contract, not authority to assign another task. The router checks owner, task revision, permission scope, dependencies, and execution generation before delivery and activation.

A peer can request work on an owned, ready, nonterminal assignment. Requests for a dependency-blocked assignment stay queued. Requests for submitted, accepted, failed, cancelled, or superseded work require coordinator action before another worker activation. Out-of-scope help requires a new task. Coordinator-directed requests can reference tasks under coordination without assigning the coordinator repository work.

Busy workers continue only their current assignment. Before delivering a queued request, revalidate its task references. Reject stale requests and notify the sender rather than applying them to the worker's next task.

### Member runtime and tools

Retain independent SDK `AgentSession` handles until group closure instead of disposing after each mission. Use explicit tools and selected resources. Do not load the full parent extension set into members.

Proposed management tool names are `group`, `group_task`, `group_member`, `group_message`, and `group_wait`. Their schemas and permitted actions are frozen only after Phase 0. Control operations return handles or snapshots promptly, not whole-conversation promises.

The main session can create, pause, resume, and close groups. The coordinator can manage ordinary board execution. Workers can submit their own results, exchange task-linked messages, and create authorized scoped descendants. Every action checks role, scope, lifecycle, assignment generation, and remaining resources before side effects.

A peer wait records a condition and ends the current activation. It does not keep a synchronous tool promise waiting on another model. A later request or relevant event schedules continuation through the same group controller.

Completion follows `agent_settled` or an equivalent verified idle boundary. Settlement alone does not establish task success. Cancellation acknowledgement requires awaited abort and idle checks, including command-process termination where relevant.

### Archives and ownership

The proposed private archive root is `$XDG_STATE_HOME/pi/groups/`, with `~/.local/state/pi/groups/` as the fallback. Group data is keyed by main conversation identity and group ID. This path is not currently installed or used.

Use private directories and files, a versioned event record, and atomic snapshots. Keep finalized conversation and tool events authoritative. Streaming deltas remain live presentation data unless needed for interrupted-output evidence.

Recovery marks incomplete runs interrupted and reconstructs read-only board state. It never calls `createAgentSession()` or replays messages as work. Archive retention must remain consistent with main-session history and explicit deletion, not silent expiry.

The proposed reload adapter closes the live group before extension teardown and restores archive inspection only. Reload does not transfer live session handles to a replacement extension. Phase 0 must verify teardown ordering before this adapter is used.

## Existing implementation boundaries

All paths below are relative to `packages/pi/`.

| Existing path | Current behavior | Planned relationship |
| --- | --- | --- |
| `agent-configuration/harness/services/subagents/tasks/run-task.service.ts` | One SDK prompt with in-memory history, followed by disposal | Reuse verified session construction patterns, not the one-shot lifecycle |
| `agent-configuration/harness/services/subagents/roles/` | Legacy task, explore, implement, and verify permissions | Preserve existing roles and define separate group capabilities |
| `agent-configuration/harness/services/subagents/approved-command/` | Exact command matching | Reuse only after cancellation and side-effect tests |
| `agent-configuration/harness/services/subagents/registry/` | One-shot task status and fire-and-forget cancellation | Do not use as proof of group cancellation acknowledgement |
| `agent-configuration/harness/index.ts` | Main-session tool registration and allowlist | Register group tools without changing legacy task behavior |
| `agent-configuration/harness/{components,services}/inspector/` | Tools, Subagents, and Messages pages | Add Groups without replacing existing pages |
| `agent-configuration/harness/services/activity/events/` | Inspector shortcut and activity subscriptions | Connect group activity and interruption handling |
| `agent-configuration/harness/{commands,components,services}/sessions/` | Interactive Herdr processes and exit flow | Preserve terminal behavior, integrate group shutdown only |
| `home-manager/managed-files.nix` | Installs the harness directory | Keep design docs and `.agents/` out of installed configuration |

The approved behavior requires new host-owned enforcement. Pi's session API does not provide a ready-made group controller or shared task board.

`pi-tools/package-definition.nix` uses the whole Pi package directory as its build source. Tracking documentation can therefore change package and system derivation paths. `pi-tools/install-pinned-npm-packages.sh` installs package manifests and dependencies, not these design documents. A changed source hash alone does not establish a runtime behavior change.
