# OpenCode

Install this complete skill into `.opencode/skills/hardlook/` or a configured
user skill directory. OpenCode 1.19.0's TUI excludes commands whose source is
`skill` from slash autocomplete, even when the skill has
`metadata.opencode/slash: "true"`. Backend registration alone does not establish
menu visibility; restarting does not change that filter.

Install the bundled standard command to make `/hardlook` visible. For a global
skill installed under `~/.agents/skills/hardlook/`:

```sh
node "$HOME/.agents/skills/hardlook/scripts/hardlook.mjs" install-opencode-command \
  --dest "$HOME/.config/opencode/commands/hardlook.md"
```

For a project-local skill, run its installed helper with
`--dest .opencode/commands/hardlook.md`. The command loads the installed skill
and forwards the request, including `deep` or `structure`. It uses the current
agent and model. Identical command installations are idempotent; different
existing files and symlinks are refused without modification.

Quit and restart OpenCode after installation or updates to reload its catalog.
Invoke `/hardlook`, `/hardlook deep`, or `/hardlook structure`. `/skills` also
provides a skill picker, and plain-text Hardlook requests work without installing
the menu command.

The bundled CLI uses `opencode run --format json --agent hardlook-peer` with
an invocation-local `OPENCODE_CONFIG_CONTENT` overlay from `config.json`.
It does not edit the user's config, create persistent agents, or overwrite
plugins. The overlay disables edits, shell, delegation, and MCP tools and
allows only read/search tools. Existing provider setup supplies credentials.
These are host tool permissions, not an OS sandbox for plugins or extensions.

Use a real `provider/model` selector when choosing a model. Deep panels launch
fresh CLI sessions and load bundled prompts directly, so no separately
installed reviewer agent is required. The packet identifies the reviewed
revision; a change during the run invalidates the result.

Reference: https://opencode.ai/docs/skills/, https://opencode.ai/docs/agents/,
and https://opencode.ai/config.json
