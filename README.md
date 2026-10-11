# Hardlook

**Evidence-first code review for coding agents.**

One self-contained Agent Skill: review rubrics, reviewer templates, five harness
adapters, helpers, report schema, and no-mistakes integration assets all travel
inside the installed `hardlook` directory. No separate Ponytail, pstack, or
thermonuclear installation; no runtime upstream prompt downloads.

```sh
npx skills add samjingwen/hardlook --skill hardlook
```

Choose your harness in the installer, then start a new session and ask:

- **Hardlook review this change** — practical routine review.
- **Hardlook deep** — independent reviewers and contextual lead judgment.
- **Hardlook structure** — a targeted maintainability audit.

In OpenCode, quit and restart after installation or updates to reload the slash
menu, then use `/hardlook`, `/hardlook deep`, or `/hardlook structure`.

Hardlook reviews and recommends. Your agent or existing pipeline owns fixes.

Targets **OpenCode, Cursor, Pi, Claude Code, and Codex**. See the
[compatibility matrix](docs/compatibility.md) for tested protocols and native
verification. The CLI helpers need Node.js 22+ and Git; your harness supplies
model access. Deep mode needs actual available model selectors.

[Installation and CLI](docs/usage.md) · [Design](docs/design.md) ·
[no-mistakes](docs/no-mistakes.md) · [Evaluation](docs/evaluation.md)

MIT. Review techniques adapted from Ponytail, pstack, and Cursor's thermonuclear
rubric, with [bundled attribution and license notices](skills/hardlook/THIRD_PARTY_NOTICES.md).
