#!/usr/bin/env bash
# Run one headless eval case with Pi, then the static checker.
# Usage: run_case.sh <case> [outdir]   cases: math algorithms messy merge batch fallback
# Headless (-p) mode cannot show ask_user, so prompts pre-specify scope and skip
# questions — except `fallback`, which checks the "no interactive UI" path.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
case_name="${1:?case}"
out="${2:-/tmp/pln-eval}/$case_name"
fx="$here/fixtures"
rm -rf "$out" && mkdir -p "$out/drafts"
cd "$out"

skip="本轮跳过提问环节，按当前假设直接定稿。"
case "$case_name" in
  math|algorithms|messy)
    cp -R "$fx/$case_name/sources" .
    prompt="Sources：./sources/ 下全部文件。没有 Vault，Concepts 目录不存在。草稿目录：./drafts/。本轮范围：展开所有“新建”候选。$skip"
    corpus=(sources) ;;
  merge)
    cp -R "$fx/merge/vault" .
    prompt="Sources：./vault/00-Inbox/flomo/2026-11-06_20-00-00.md。Vault：./vault。草稿目录：./drafts/。本轮范围：展开全部候选。$skip 对已有笔记只输出 diff，不要写入。"
    corpus=(vault/00-Inbox) ;;
  batch)
    cp -R "$fx/batch-2026-10-25/sources" "$fx/batch-2026-10-25/answers" .
    prompt="Sources：./sources/ 下全部文件。没有 Vault，Concepts 目录不存在。草稿目录：./drafts/。本轮范围：Stream Compaction、Blelloch Scan、CUDA 执行模型、CUDA 主机-设备编程流程、Functor、极小多项式、Floyd 判圈。用户此前的真实回答在 ./answers/transcript.md（H1–H3、Q-B1、Q-F1、Q-C1），可作为回答使用。不再发起新提问，直接定稿。"
    corpus=(sources answers) ;;
  fallback)
    cp -R "$fx/math/sources" .
    prompt="Sources：./sources/ 下全部文件。没有 Vault，Concepts 目录不存在。草稿目录：./drafts/。"
    corpus=(sources) ;;
  *) echo "unknown case $case_name" >&2; exit 2 ;;
esac

if [ "$case_name" = merge ]; then find vault/30-Concepts -type f -exec shasum {} + > .before; fi
model="${PI_MODEL:-openai/gpt-5.6-sol:medium}"
start=$(date +%s)
pi --model "$model" -p --no-session "/skill:process-learning-notes $prompt" > run.log 2>&1 || echo "pi exit $?" >> run.log
echo "elapsed $(( $(date +%s) - start ))s" >> run.log
if [ "$case_name" = merge ]; then
  find vault/30-Concepts -type f -exec shasum {} + | diff -q .before - >/dev/null \
    && echo "OK existing notes untouched" >> run.log || echo "FAIL existing notes modified" >> run.log
fi
python3 "$here/check_notes.py" drafts --corpus "${corpus[@]}" > check.log 2>&1 || true
tail -n 3 run.log; tail -n 1 check.log
