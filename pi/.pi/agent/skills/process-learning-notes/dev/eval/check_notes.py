#!/usr/bin/env python3
"""Static checks for process-learning-notes output.

Usage: check_notes.py <drafts_dir> [--corpus FILE_OR_DIR ...]

Checks structure, absence of audit noise, that every 💬 quote in "我的理解"
appears in the corpus (sources + real answers), and that the triage record
covers every content line of the sources it lists. Semantic quality (is the
Core Idea deep?) still needs human review; this only catches regressions.
"""
import re
import sys
from pathlib import Path

NOISE = re.compile(r"\[C\d+\]|AI-supplemented|User-expressed|Learning State|用户回答|你记录了|用户已解释")
META = re.compile(r"有助于|很重要|重要的概念|本笔记|本文")
REQUIRED_FM = ["type: concept", "status: draft", "mastery:", "aliases:", "sources:", "domain:"]


def norm(s: str) -> str:
    return re.sub(r"\s+", "", s)


def load_corpus(paths):
    text = []
    for p in paths:
        p = Path(p)
        files = [f for f in p.rglob("*") if f.is_file()] if p.is_dir() else [p]
        for f in files:
            if f.suffix in {".md", ".json", ".txt"}:
                text.append(f.read_text(encoding="utf-8", errors="ignore"))
    return norm("\n".join(text).replace('\\"', '"'))


def section(body: str, title: str) -> str:
    m = re.search(rf"^## {title}\s*$(.*?)(?=^## |\Z)", body, re.M | re.S)
    return m.group(1) if m else ""


def check_note(path: Path, corpus: str | None):
    errs, warns = [], []
    text = path.read_text(encoding="utf-8")
    fm = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if not fm:
        return [f"{path.name}: missing frontmatter"], []
    for key in REQUIRED_FM:
        if key not in fm.group(1):
            errs.append(f"missing frontmatter `{key}`")
    body = text[fm.end():]

    core = re.search(r"> \[!abstract\] Core Idea\n((?:>.*\n?)+)", body)
    if not core:
        errs.append("missing `> [!abstract] Core Idea` callout")
    else:
        core_text = core.group(1)
        sentences = [s for s in re.split(r"[。！？]", core_text) if norm(s).strip(">")]
        if len(sentences) > 2:
            warns.append(f"Core Idea has {len(sentences)} sentences (target 1–2)")
        if META.search(core_text):
            errs.append(f"Core Idea contains filler: {META.search(core_text).group(0)}")

    for title in ("我的理解", "参考"):
        if not re.search(rf"^## {title}\s*$", body, re.M):
            errs.append(f"missing section `## {title}`")

    knowledge = body.split("## 我的理解")[0]
    for m in NOISE.finditer(knowledge):
        errs.append(f"audit noise in knowledge body: {m.group(0)}")

    mine = section(body, "我的理解")
    lines = mine.splitlines()
    for i, line in enumerate(lines):
        if "💬" not in line:
            continue
        nxt = lines[i + 1] if i + 1 < len(lines) else ""
        if not re.search(r"[✅◐✗—]", nxt):
            errs.append(f"quote without evaluation line: {line.strip()[:40]}")
        if corpus is not None:
            for quote in re.findall(r"「(.*?)」", line):
                for frag in re.split(r"[；…]", quote):
                    if len(norm(frag)) >= 4 and norm(frag) not in corpus:
                        errs.append(f"quote not found in sources/answers: 「{frag.strip()}」")
    if not mine.strip():
        errs.append("empty 我的理解")
    return [f"{path.name}: {e}" for e in errs], [f"{path.name}: {w}" for w in warns]


def check_triage(path: Path, drafts: Path, source_dirs):
    errs, warns = [], []
    text = path.read_text(encoding="utf-8")
    ids = dict(re.findall(r"^\|\s*(S\d+)\s*\|\s*\[\[([^\]]+)\]\]", text, re.M))
    if not ids:
        return [f"{path.name}: no Sources table (| S1 | [[file]] |)"], []
    covered = {sid: set() for sid in ids}
    for cell in re.findall(r"\|([^|\n]*S\d+ L[^|\n]*)\|", text):
        for sid, rest in re.findall(r"(S\d+)((?:\s*[L、，,]*\s*L?\d+(?:[–-]L?\d+)?)+)", cell):
            for a, b in re.findall(r"(\d+)(?:[–-]L?(\d+))?", rest):
                covered.setdefault(sid, set()).update(range(int(a), int(b or a) + 1))
    for sid, name in ids.items():
        src = next((f for d in source_dirs for f in Path(d).rglob(f"{name}.md")), None)
        if src is None:
            warns.append(f"{sid} [[{name}]] not found in corpus; coverage not checked")
            continue
        lines = src.read_text(encoding="utf-8").splitlines()
        end_fm = lines.index("---", 1) if lines and lines[0] == "---" else -1
        for n, line in enumerate(lines, 1):
            s = line.strip()
            if n <= end_fm + 1 or not s or re.fullmatch(r".{1,20}[：:]", s):
                continue
            if n not in covered.get(sid, set()):
                warns.append(f"{sid} L{n} not referenced in triage: {s[:40]}")
    out_sec = re.split(r"^## (?:产出|生成[^\n]*|文件清单)\s*$", text, maxsplit=1, flags=re.M)
    if len(out_sec) > 1:
        created_part = re.split(r"^### [^\n]*(?:已有笔记|更新|diff)", out_sec[1], maxsplit=1, flags=re.M)[0]
        for note in re.findall(r"`([^`]+\.md)`", created_part):
            if not (drafts / Path(note).name).exists():
                errs.append(f"listed output missing: {note}")
    return [f"{path.name}: {e}" for e in errs], [f"{path.name}: {w}" for w in warns]


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2
    drafts = Path(args[0])
    corpus_paths = args[args.index("--corpus") + 1:] if "--corpus" in args else []
    corpus = load_corpus(corpus_paths) if corpus_paths else None
    errs, warns = [], []
    triages = sorted(drafts.glob("_triage-*.md"))
    if not triages:
        errs.append("no _triage-*.md record")
    for t in triages:
        e, w = check_triage(t, drafts, corpus_paths)
        errs += e
        warns += w
    notes = [p for p in sorted(drafts.glob("*.md")) if not p.name.startswith("_")]
    if not notes:
        warns.append("no concept notes")
    for p in notes:
        e, w = check_note(p, corpus)
        errs += e
        warns += w
    for w in warns:
        print("WARN ", w)
    for e in errs:
        print("FAIL ", e)
    print(f"\n{len(notes)} notes, {len(errs)} failures, {len(warns)} warnings")
    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main())
