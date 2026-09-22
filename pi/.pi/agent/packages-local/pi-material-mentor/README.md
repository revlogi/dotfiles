# Pi Material Mentor

A local Pi package for material-first courses. It provides the
`material-mentor` and `youtube-transcript` skills, learning prompts including
`/teach`, source-grounded HTML lessons with automatic answer/feedback exchange,
evidence-based course state, and material write protection.

Course data remains outside this package: readable Markdown state and immutable
JSON lesson/evidence files. The browser service is local and session-scoped. See
[`docs/usage.md`](docs/usage.md) for the workflow and state ownership rules.

## Development

```bash
npm ci
npm run check
```

The optional CII PDF importer has separate Python dependencies under
`tools/cii-import/`.
