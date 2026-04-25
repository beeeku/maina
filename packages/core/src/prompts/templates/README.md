# Maina prompt templates

These markdown templates ship inside `@mainahq/core` and are the
default scaffolding `maina plan`, `maina spec`, and `maina design`
generate when a feature directory is created. Repos that have written
their own templates can override them by placing a same-named file in
`.maina/templates/`.

| File | Owner step | Purpose |
|---|---|---|
| `spec-template.md` | `maina spec` | WHAT a feature must do |
| `plan-template.md` | `maina plan` | HOW it gets built |
| `tasks-template.md` | `maina spec --tasks` | WHEN each step lands |

The templates are Maina-original. They follow the
*spec → plan → tasks* progression because that's the discipline the
verifier expects, not because any one upstream invented it. Edit them
freely for your repo; the verifier will read whatever shape lands in
`.maina/templates/`.

## Conventions in the templates

- **Three-document split**: WHAT in spec, HOW in plan, WHEN in tasks.
  Mixing them across files is an immediate slop signal.
- **`[NEEDS CLARIFICATION: question]`** markers for ambiguity. The
  verifier blocks `maina pr` when any marker is unresolved.
- **Affirmative framing** in every user-facing string ("passed N of M
  checks", never "0 findings") — see `.maina/constitution.md` rule C2.
- **Tasks must trace** to spec items and plan modules; an untraced
  task is a task whose justification is missing.
