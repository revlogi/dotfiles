# Focused pstack skills for Pi

Four independent skills for writing cleanup and evidence-based code understanding. No extensions, runtime dependencies, background hooks, model overrides, or global behavior changes beyond making these skills discoverable.

## Installation and scope

The package source lives at:

```text
~/dotfiles/pi/.pi/agent/packages-local/pi-pstack/
```

The global deployment is a symlink at `~/.pi/agent/packages-local/pi-pstack`, following the existing dotfiles layout. The user-level `~/.pi/agent/settings.json` contains `"./packages-local/pi-pstack"` in `packages`. This makes the skills available across projects, not just in the dotfiles directory.

Run `/reload` in an existing Pi session, or start a new session. Only names/descriptions enter the system prompt; detailed instructions and references load as needed. No other pstack skills are installed.

## Commands

| Command | Purpose | Example |
|---|---|---|
| `/unslop` | Rewrite prose without AI filler or lost precision | `/unslop Tighten docs/design.md without changing its claims` |
| `/how` | Trace source-grounded architecture and runtime behavior | `/how How does cancellation reach the worker?` |
| `/why` | Investigate rationale, with cited evidence and uncertainty | `/why Why do we retry this operation three times?` |
| `/teach` | Build a mental model combining mechanics and rationale | `/teach Explain this scheduler so I can safely change it` |

Each also supports Pi's direct skill command: `/skill:unslop`, `/skill:how`, `/skill:why`, `/skill:teach`, followed by the request. The short forms are prompt templates, not extension commands.

With no arguments, the short commands use the current discussion. `/unslop` rewrites the previous response by default. If no useful target is available, provide one. Natural-language requests matching the descriptions can also load the skills; use an explicit command when you want to force selection.

Use How for mechanics, Why for historical motivation, and Teach for a unified explanation. Teach reads the actual How/Why/Unslop instructions and reuses findings already in the conversation. It does not print three separate reports.

## Boundaries

- How, Why, and Teach investigate read-only by default. They do not automatically fix code, install tools, change model settings, or write notes.
- Unslop rewrites the requested text; it edits files only when requested. Technical terms, literal quotations/code, citations, numbers, and meaningful uncertainty take precedence over style heuristics.
- Work stays in the current session/model. No subagent extension, nested `pi` invocation, Cursor configuration, or `poteto-mode` dependency is required.
- Why starts with code, bounded Git history, local docs, and relevant linked sources. It can use exposed read-only service tools when useful. Missing access is reported, not silently treated as an empty search.
- A non-Git directory still works, but historical intent may remain unknown. Source behavior alone does not prove author intent.
- Teach does not quiz, record mastery, run a curriculum, use Anki, or write to the knowledge base. Existing safety guards remain authoritative; these skills do not turn them off or bypass them.
- These are model instructions, not an OS sandbox. Existing tool permissions/guards still determine what can execute. Automatic skill selection and compliance are not deterministic.

## Verification

No dependencies need to be installed for this package. Tests use Node.js and the installed Pi SDK. If Pi is installed unusually, set `PI_SDK_PATH` to its package directory.

```bash
cd ~/dotfiles/pi/.pi/agent/packages-local/pi-pstack
npm test
PSTACK_GLOBAL_TEST=1 PI_OFFLINE=1 npm test
```

The optional global test checks discovery from an unrelated directory, one definition/alias per name, no conflicting extension commands, and preservation of existing personal skills. Ordinary tests check native package discovery, frontmatter, argument expansion, local links, license, and unchanged upstream epistemics/service playbooks.

Model-backed tests use the real global configuration and credentials, create temporary C++ fixtures with known Git history, and leave prompts, JSON events, responses, and results under `/tmp/pi-pstack-live-*`. They consume model usage and are not part of `npm test`:

```bash
# Explicit PI_BIN avoids npm's PATH selecting a different local Pi installation.
PI_BIN=/opt/homebrew/bin/pi npm run test:live
# Optional overrides and focused reruns:
PI_BIN=/opt/homebrew/bin/pi PSTACK_MODEL=gpt-6.1-sol PSTACK_PROVIDER=openai-codex PSTACK_CASE=teach npm run test:live
```

The live suite covers two Unslop tasks, two How tasks (including natural-language selection), three Why tasks (documented reason, unknown reason, and no Git), two Teach tasks, and a same-session How → Why → Teach sequence. It uses a read/search/bash tool allowlist, disables MCP/project configuration for isolation, verifies fixture contents and Git status remain unchanged, and stores tool errors for review. Bash is not a security sandbox; use only disposable fixtures. Test results are documented in [VERIFICATION.md](VERIFICATION.md).

## Upstream and maintenance

See [NOTICE.md](NOTICE.md), [upstream.json](upstream.json), and [LICENSE](LICENSE) for source revisions, attribution, adaptations, and update steps. The upstream reference materials are reused, not replaced with a separate explanation framework. This local reviewed snapshot requires deliberate upstream updates.
