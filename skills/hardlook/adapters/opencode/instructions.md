# OpenCode

Install this complete skill into `.opencode/skills/hardlook/` or a configured
user skill directory. Quit and restart OpenCode after installation or updates
to reload the skill catalog and slash-command menu. The bundled `SKILL.md`
opts into the menu with `metadata.opencode/slash: "true"`. Invoke `/hardlook`,
`/hardlook deep`, or `/hardlook structure`; plain-text Hardlook requests also
work.

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
