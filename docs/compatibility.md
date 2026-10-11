# Compatibility and verification

Three different claims are kept separate:

1. **Bundle/contract tests:** real Git, subprocesses, scope capture, relocation,
   output normalization, failure handling, and native-shaped CLI protocol fixtures.
2. **Native acceptance:** the installed harness accepts the actual invocation
   and returns a validated report.
3. **Model quality:** known defects and clean controls reviewed by real models.
   A few smoke cases are not a comparative precision/recall benchmark.

| Harness | Bundled adapter | Protocol fixture tests | Native evidence |
| --- | --- | --- | --- |
| OpenCode | Yes | Automated | 1.18.35: validated review reports; 1.19.0: standard-command registration and TUI menu acceptance |
| Claude Code | Yes | Automated | 2.0.76: invocation attempted; harness reports credential rejection |
| Codex | Yes | Automated | CLI absent on the development machine |
| Cursor | Yes | Automated | CLI absent on the development machine |
| Pi | Yes | Automated | CLI absent on the development machine |

The recorded model-review runs used OpenCode 1.18.35 and Claude Code 2.0.76.
Missing CLIs are an availability limit, not evidence of failed authentication.
Each adapter documents its source interface and model/permission assumptions.
New CLI versions must be exercised before extending native claims.

On 2026-10-11, OpenCode reported the introduced subtraction defect with a
concrete input and returned empty findings for the clean equivalent change.
Claude's installed executable rejected credentials before returning a review.
This is not evidence that its credentials expired or that the adapter reviewed
the fixtures. See the [recorded smoke observations](../evals/results/2026-10-11.json).

The no-mistakes recipe is source-targeted at v1.84.0. Standalone field conversion
is executable-tested; end-to-end gate verification is recorded here when run.

Helper runtime: Node.js 22+ and Git, Linux/macOS. The in-host Markdown protocol
does not require a Node helper. No model keys or credentials are bundled.

## OpenCode 1.19.0 slash autocomplete

The [v1.19.0 TUI autocomplete implementation](https://github.com/anomalyco/opencode/blob/v1.19.0/packages/tui/src/component/prompt/autocomplete.tsx)
skips backend commands with `source === "skill"`. A skill's presence in the
`/command` response is therefore not evidence that the slash menu displays it.
The bundled OpenCode command installer creates a standard `hardlook.md` command
that loads the installed skill and forwards arguments. This leaves review
protocols and provider configuration in their existing owners.

Installer tests exercise emitted command files, relocation, idempotence, and
preservation of conflicting files and symlinks. These are distinct from native
TUI acceptance and from model-quality review evaluations.

On 2026-10-11, the helper installed the standard command in a real OpenCode
1.19.0 configuration. Its `/command` response reported `source: "command"` and
the `$ARGUMENTS` hint, and a fresh TUI rendered the `/hardlook` autocomplete row.
No prompt was submitted and no model review was run for this setup verification.
See the [recorded command observations](../evals/results/2026-10-11-opencode-command.json).
