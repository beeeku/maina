# Maina agent prompts

System prompts for the verification agents Maina exposes inside the
verify pipeline and the receipt-rendering surface. Each prompt is
loaded by `tryAIGenerate` via the prompt engine; downstream callers
(the receipt walkthrough, `maina review`, `maina explain`) reference
them by file name.

| File | Used by | Output |
|---|---|---|
| `review.md` | `maina review`, receipt two-stage review | "is this safe to merge" 3-sentence verdict |
| `debug.md` | receipt failed-check explanation | why a specific check went red |
| `router.md` | `tryAIGenerate` task classification | one of `review`/`debug`/`spec`/`explain`/`meta` |

The prompts are Maina-original. They follow the
**verification-first** framing the receipt depends on:

- The agent's job is to **explain why a change is or isn't safe to
  merge**, not to generate code.
- Output is grounded in the receipt + diff in front of it. If the
  evidence isn't enough, the prompt asks the model to say so rather
  than invent context.
- Copy discipline (rule C2) — affirmative framing, never "0 findings".

## Overriding per repo

Maina's prompt engine loads user overrides from `.maina/prompts/<task>.md`
(flat — no nested `agents/` directory). To specialise the review prompt for
a repo, drop a `.maina/prompts/review.md` next to the constitution and the
engine picks it up; same pattern for `debug.md`. The agent files in this
directory are the shipped defaults for those task names.

Wiring the templates in this directory through a richer per-agent loader
(e.g. `agents/<name>.md` cascade) is tracked as a follow-up — for now the
flat path is the override surface.
