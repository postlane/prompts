# CLAUDE.md — postlane/prompts

## Non-negotiable rules

**No `Co-Authored-By: Claude` or any AI attribution in commits or PRs.** Never
add `Co-Authored-By:`, "Generated with Claude Code", or any AI tool attribution
to a commit message or PR description.

**Never** `git commit --no-verify`. **Never** `git push --force`.

---

## What this repo is

A library of prompt skill files and voice guides. The product here is prompt
quality, not compiled code. The specification is `base/system-prompt.md` — read
it before touching anything.

---

## The seven forbidden phrases

Any prompt that produces output containing these is wrong. No exceptions.

1. "Excited to share" / "Thrilled to announce"
2. "Game-changing" / "Revolutionary" / "Groundbreaking"
3. "Dive into" / "Delve into"
4. "Leverage" (as a verb)
5. "Seamlessly"
6. "The future of [category]"
7. Any sentence starting with "I'm proud to"

---

## Skill file requirements

- First line must be `<!-- postlane-version: 1.0.0 -->`
- Character limits are hard limits, not targets
- Test against at least two real triggers before committing
- Do not edit `base/system-prompt.md` without running the test suite in
  `test-cases/` before and after

---

## Commit messages

Explain *why* the prompt changed (what behaviour was wrong, what the fix
achieves). Do not describe *what* lines were edited.
