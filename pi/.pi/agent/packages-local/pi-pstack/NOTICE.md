# Upstream provenance and local adaptations

These four skills and their reference materials derive from pstack by Lauren Tan, distributed under the MIT license in `LICENSE`.

- Original: https://github.com/cursor/plugins/tree/main/pstack
- Original repository revision inspected: `1ba91fc25c0977741dd0e267849e6234b037ed0a`
- Standalone mirror used as the import base: https://github.com/backnotprop/pstack
- Mirror revision: `25abb38559ddbabec563646224d09eff9a250eca`
- Imported only `skills/{unslop,how,why,teach}` and the license. No other pstack modes, agents, automations, model settings, scripts, or dependencies are installed.
- `upstream.json` records SHA-256 hashes of every imported upstream file before local adaptation, for comparison during future updates.

At the revisions inspected, Unslop, Teach, and all How/Why references were identical between the original and mirror. The mirror's How and Why entry points added cross-harness guidance and a sequential Pi fallback, but still retained Cursor-style role/model configuration and orchestration defaults.

## Local changes

- **All four entry points:** allow relevant model selection instead of upstream's explicit-only `disable-model-invocation: true`. Short, specific descriptions keep them situational. Full skill bodies are still loaded lazily.
- **Unslop:** retain the upstream rules and stable rule numbers. Add scoped editing, language matching, source-text-as-data handling, and priority for technical precision, quotations, citations, and genuine uncertainty. Terms such as mathematical vectors and synchronization primitives are not banned merely because they appear in a style heuristic.
- **How:** use the current session/model and sequential explorer/explainer roles. Keep the upstream complexity split, exploration structure, and explanation format. Add file/line citations verified against numbered source output, explicit observed-versus-inferred runtime behavior, and read-only scope. Adapt role templates to available Pi tools.
- **Why:** retain the upstream epistemic framework byte-for-byte. Replace the mandatory seven-source parallel sweep with a bounded, evidence-led search over Git, local docs, and available linked sources. Keep honest coverage accounting across all seven categories, grouping unused categories for narrow answers. Handle absent/shallow Git history and unavailable GitHub or service access. Require numbered-source verification for file/line citations. Retain optional service playbooks without requiring their tools. Adapt investigator/synthesizer references to sequential execution and flexible report length; remove assumptions that Git/`gh` always work. Replace a placeholder Markdown link with an example URL.
- **Teach:** load the actual sibling skills via relative paths; compose How, Why, and Unslop in the same session. Reuse findings instead of rerunning work. Retain upstream's conversational mental-model teaching and no-quiz posture. Remove mandatory parallel delegation, image generation, and repeated diagrams. Allow a requested detailed walkthrough immediately rather than forcing multiple turns. Match the user's language and preserve uncertainty.
- **Packaging:** add a native local Pi manifest, four lightweight prompt aliases, documentation, structural tests, and opt-in model-backed tests. No executable extension is loaded by this package.

## Updating

This is a reviewed snapshot with local adaptations, not an automatically updating fork. `pi update --extensions` does not replace local package files.

1. Clone the mirror at a selected revision into a temporary directory. Inspect its changes against the revision above, especially these four skill trees.
2. Use `git diff --no-index <new-checkout>/skills/<name> <this-package>/skills/<name>` to compare. Reapply useful upstream changes without restoring unavailable orchestration, mandatory broad searches, or style rules that remove technical meaning. Do not blindly overwrite the adapted entry points.
3. Keep MIT attribution, update revision identifiers and source hashes in `upstream.json`, and describe changed adaptations here.
4. Run package tests and the representative live tests in `README.md`. Reload Pi afterward.

Local adaptation is necessary because a direct filtered install would retain behavioral assumptions that do not fit this setup. Keeping upstream references and source hashes makes future review possible without adding a package manager or a background updater.
