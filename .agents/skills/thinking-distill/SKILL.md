---
name: thinking-distill
description: "Distill what the user actually wants through short structured questions, challenge the request in every area it touches, and save the agreed plan to .agents/plans/<slug>/. Use for any kind of work, such as building, changing, replacing, or designing something, and whenever the goal, scope, or direction is unclear. Also use without being asked when there is not enough context to know what to build."
---

# Thinking distill

Assume the user does not yet know exactly what they want. The request is a starting point, not a specification. Find the real goal, expose what they did not consider, and agree on a direction before any work starts.

## When to start

- The user asks to plan, scope, clarify, or be questioned about a request.
- Without being asked, when the request lacks the context needed to know what to build, and guessing would risk building the wrong thing. Say briefly that you are starting this skill and why.

## Boundaries

- This skill only interviews and writes the plan. Do not edit code, run migrations, commit, or start the work until the plan is saved and the user answers yes in the final step.
- Do not agree just because the user said it. Treat each stated solution as one option and test it against the goal.

## Asking questions

Ask every question through the host's structured question tool, such as `AskUserQuestion` in Claude Code, with up to 4 questions per call.

If the host has no question tool, print the questions in chat in batches of 5, laid out as the tool would show them, then wait for the answers:

```text
1. [API] Should the rewrite keep the current public API?
   a. Keep it (Recommended): existing callers keep working; rewrite ships in steps.
   b. Break it once: cleaner design, but every caller must change at once.
   c. Version it: old and new run side by side; more code to maintain.
   d. Other: describe your own answer.
```

## Before the first question

1. Read the request and inspect the relevant files, docs, and Git state. Anything the project already answers is not a question.
2. If `.agents/plans/<slug>/` already exists for this goal, read it and continue from its open points instead of starting over.
3. Note for yourself the likely goal, your assumptions, and which areas the request touches.

## Question rules

- One decision per question. Keep the question under about 20 words, in plain language. Explain any term the user might not know.
- Never ask the obvious: skip questions with only one sensible answer, answers found in the project, or preferences already stated. State those as assumptions in a single yes/no confirmation instead.
- Give 2 to 4 concrete options. Put your recommended option first with `(Recommended)` in its label. With the tool, do not add "Other"; it is provided.
- Every option description is one short line saying what it brings: the benefit, the cost, or the risk it avoids. This is the user's "why".
- Include at least one option the user likely did not consider when one exists: a smaller scope, a safer alternative, an existing solution, or not doing it at all.
- Use yes/no questions to confirm assumptions, accept a recommendation, or approve a trade-off. Use multiple selection only when choices truly combine.
- Use a preview when comparing shapes, layouts, interfaces, or output formats.
- Group each batch by one topic. Order from goal to details; later answers often remove earlier questions.
- After each answer, re-evaluate: drop questions it settled, follow up on anything vague, and challenge answers that conflict with the goal or with earlier answers.

## Challenge the request

Challenge the request in every area it actually touches, and only those. A document needs no infrastructure questions; a service needs no writing-style questions. Derive the areas from the request itself; the list below is a starting point, not a checklist.

- **Goal:** the problem behind the request, who benefits, and how success is measured.
- **Scope:** what is in, what is out, and the smallest version that delivers the goal.
- **Risk:** what can go wrong, what it would cost, and how to prevent or recover from it. Include security, reliability, and data where they apply.
- **Quality:** whether the result stays clear, correct, and easy to change.
- **Growth:** what happens as use, size, or audience grows, and whether planning for it now is premature.
- **Environment:** where the result lives or runs, who maintains it, and what it depends on.
- **Verification:** how the user will know it worked.
- **Long run:** upkeep, lock-in, and what this makes easier or harder later.

For each touched area, name the likely causes of trouble, the errors the user may hit, and a mitigation, then ask about the ones that need a decision.

## Suggest extensions

The user often knows the destination but not the whole path. Map the path from what exists today to the goal, and propose what would make the result more useful: missing steps, natural next features, and capabilities the user did not mention.

- Offer each suggestion as its own question, framed as "This would be great to add: <idea>. Add it?", with options such as add now, add later, or skip, and one line on what it brings and what it costs.
- Suggest only what serves the goal. Prefer a few strong ideas over a long wish list, and recommend "later" when an idea would delay the core result.
- Every accepted suggestion is a new decision with its own consequences. Run it through the same challenge and question rules, and suggest its own extensions, until it is as clear as the main request.
- Keep the core goal deliverable on its own; extensions build on it, not replace it.

For example, "show where my storage is wasted" may lead to: grouping by folder or file type, finding duplicates, tracking growth over time, alerts when space runs low, and safe cleanup actions. Cleanup then raises its own questions: what may be deleted, whether it needs confirmation, and how to undo it.

## When to stop

There is no question limit. Keep iterating until all of these are true:

- You could carry out the plan without guessing any decision.
- Every touched area has a decision, an accepted risk, or an explicit out-of-scope note.
- Every accepted extension is as clear as the main request, and every suggestion is marked now, later, or skipped.
- No answer contradicts another or the stated goal.

Then present a short summary of the goal, decisions, and accepted risks and ask a yes/no question to save it. If the user says no, ask what is wrong and keep iterating.

## Save the plan

Write to `.agents/plans/<slug>/`, where `<slug>` is a short kebab-case name of what the user wants, such as `api-v2-rewrite`. Re-read existing files before editing and update them in place. Keep each file concise, link to source paths instead of copying content, and never include secrets.

- `brief.md`: date (UTC), Git revision when available, the original request, success criteria, in scope, out of scope, and the chosen direction.
- `decisions.md`: each decision with the chosen option, the short reason, and rejected alternatives.
- `extensions.md`: each suggestion marked now, later, or skipped, with what it brings and the decisions it raised.
- `risks.md`: per touched area, the risks found, their mitigations, and risks the user accepted.
- `next-steps.md`: ordered steps and how each will be verified.
- `goal.md`: written last, once everything above is settled. State in a few sentences what the user finally wants and why, and list the observable conditions that mean it is done. It may differ from the original request; that difference is the point of the distillation.

## Finish

1. List the saved files and show the final goal from `goal.md`.
2. Ask a yes/no question with the question tool, or in chat when there is none: start the work now?
3. On yes, start from the first step in `next-steps.md`. On no, stop; the plan stays saved for later.
