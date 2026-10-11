# Installation and usage

## One complete skill

Use the skills installer shown in the README and select your harness. The
canonical distributable is `skills/hardlook/`, including all subdirectories.
Pi can also load this repository as a package via its `pi.skills` declaration.
Native discovery locations and invocation notes are bundled under
`skills/hardlook/adapters/<harness>/instructions.md`.

To copy the whole bundle explicitly from a checkout:

```sh
node skills/hardlook/scripts/hardlook.mjs install --dest /absolute/path/to/skills/hardlook
```

The destination must not exist. Existing user work is never overwritten.
Upgrade by selecting a new versioned destination, then switch the host's skill
path using its normal configuration. Restart the harness after skill changes;
running sessions may retain their original skill catalog.

The package can be moved. All helper imports and prompt/schema lookups resolve
relative to the installed bundle. Node standard libraries supply the helpers;
there are no runtime npm dependencies or runtime downloads of upstream rubrics.

## OpenCode slash menu

OpenCode 1.19.0 registers skills in its backend command catalogue but filters
`source: "skill"` entries out of slash autocomplete. The skill's
`metadata.opencode/slash` opt-in alone does not make `/hardlook` visible there.

Use the bundled helper to install a standard global command:

```sh
node <skill>/scripts/hardlook.mjs install-opencode-command \
  --dest "$HOME/.config/opencode/commands/hardlook.md"
```

For project-local scope, use `--dest .opencode/commands/hardlook.md`. The file
must be named `hardlook.md`. It invokes the installed skill with the supplied
arguments and retains the current agent and model. Reinstalling the same command
is a no-op; a different existing command or symlink is preserved and reported as
a conflict. Quit and restart OpenCode to load the command. `/skills` remains an
alternative entrypoint for an installed skill.

## Routine review in the host

Ask the current agent to use Hardlook and name the scope and intent. It loads the
bundled protocol, inspects connected code with its own tools, and reports useful
findings. No extra CLI or model process is required for this baseline.

## Explicit CLI reviewers

Examples below assume `<skill>` is the installed directory. Use actual available
models from your harness; example aliases are not a model-availability promise.

```sh
node <skill>/scripts/hardlook.mjs doctor
node <skill>/scripts/hardlook.mjs context --repo /repo --base main --intent "Implement subtraction"
node <skill>/scripts/hardlook.mjs review --repo /repo --base main --intent "Implement subtraction" --peer opencode
node <skill>/scripts/hardlook.mjs review --repo /repo --scope uncommitted --intent "Fix checkout" --peer claude-code:sonnet
```

Name additional connected files with repeatable `--include` arguments. Branch
review pins the merge base and HEAD and requires a clean tracked checkout.
Staged source comes from the index; uncommitted source comes from the worktree.
Untracked files are not silently added to the changed-file set: include them
explicitly for supporting context or stage them before staged review.

Private environment paths (including `.env.*`), credential/cache paths, and key
files are excluded. Their contents are not captured. Exclusions and partial
coverage prevent the helper from emitting a complete pipeline verdict. Large
packets fail visibly; narrow the change or deliberately raise `--max-bytes`.

For a panel, provide two to four distinct explicit selectors:

```sh
node <skill>/scripts/hardlook.mjs review --repo /repo --base main --mode deep \
  --intent "Preserve settlement idempotency" \
  --peer opencode:provider/actual-model --peer claude-code:actual-model
```

Peers run fresh on the same packet. The lead runs only after all requested
independent reviewers return valid reports. The first selector also selects the
lead; override it with `--lead`. Requested model selectors are recorded; served
model identity and model-family diversity are not inferred from aliases.

The runner detects reviewed-context changes and retains successful peer reports
when another peer fails. It does not perform fixes, commit, push, or control a
pipeline. External CLI stdout/stderr and prompts are not logged as diagnostics.
Returned findings are intentionally user-visible review content.

`--binary harness=/absolute/executable` overrides a CLI path. Cursor defaults to
`agent`; use `--binary cursor=cursor-agent` where needed. Cursor's documented
positional prompt interface exposes the packet to normal process-argument
inspection; use the in-host skill if that transport is unsuitable.

Exit codes: **0** complete without act-on issues/high risk; **1** complete with
act-on issues or high risk; **2** partial/incomplete execution or invalid input.
`--format no-mistakes` emits pipeline fields only for a complete report.

## Boundaries

Native adapters apply host-supported review restrictions. They are not an OS
sandbox for arbitrary extensions or project hooks. The runner also checks packet
identity after execution, but does not undo a mutation if an external component
makes one. The user remains responsible for their installed harness and provider
configuration. Authentication is performed through that harness, never by
reading or copying credential caches into Hardlook.
