# Hardlook

> [!IMPORTANT]
> Hardlook has moved to [samjingwen/agent-toolkit](https://github.com/samjingwen/agent-toolkit).
> This repository is archived and retained for historical reference.
> Use the [current documentation](https://github.com/samjingwen/agent-toolkit/tree/main/docs/hardlook) and [canonical skill](https://github.com/samjingwen/agent-toolkit/tree/main/skills/hardlook) for future development, installations, and updates.
> Existing installations continue to work.

**Evidence-first code review for coding agents.**

One self-contained Agent Skill: review rubrics, reviewer templates, five harness
adapters, helpers, report schema, and no-mistakes integration assets all travel
inside the installed `hardlook` directory. No separate Ponytail, pstack, or
thermonuclear installation; no runtime upstream prompt downloads.

```sh
npx skills add samjingwen/agent-toolkit --skill hardlook
```

Choose your harness in the installer, then start a new session and ask:

- **Hardlook review this change** — practical routine review.
- **Hardlook deep** — independent reviewers and contextual lead judgment.
- **Hardlook structure** — a targeted maintainability audit.

For a global OpenCode install, register the bundled slash-menu command too:

```sh
npx skills add samjingwen/agent-toolkit --skill hardlook --global --agent opencode
node "$HOME/.agents/skills/hardlook/scripts/hardlook.mjs" install-opencode-command \
  --dest "$HOME/.config/opencode/commands/hardlook.md"
```

Then quit and restart OpenCode and use `/hardlook`, `/hardlook deep`, or
`/hardlook structure`. OpenCode 1.19.0 hides skill-backed entries in slash
autocomplete; the standard command provides menu visibility. See the
[bundled OpenCode instructions](skills/hardlook/adapters/opencode/instructions.md)
for project-local setup and the `/skills` picker.

Hardlook reviews and recommends. Your agent or existing pipeline owns fixes.

Targets **OpenCode, Cursor, Pi, Claude Code, and Codex**. See the
[compatibility matrix](docs/compatibility.md) for tested protocols and native
verification. The CLI helpers need Node.js 22+ and Git; your harness supplies
model access. Deep mode needs actual available model selectors.

[Installation and CLI](docs/usage.md) · [Design](docs/design.md) ·
[no-mistakes](docs/no-mistakes.md) · [Evaluation](docs/evaluation.md)

MIT. Review techniques adapted from Ponytail, pstack, and Cursor's thermonuclear
rubric, with [bundled attribution and license notices](skills/hardlook/THIRD_PARTY_NOTICES.md).
