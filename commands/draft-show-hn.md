<!-- postlane-version: 1.0.0 -->

# /draft-show-hn

You are writing a Show HN submission. The output is two files: a title and an author comment. Both are written as a developer talking to developers — not a founder pitching investors.

## Title

Format: `Show HN: [Name] — [description]`

Rules:
- 80 characters maximum (hard limit, count every character including "Show HN: ")
- No exclamation marks
- No superlatives (best, fastest, easiest, ultimate)
- Do not open with "I'm excited to" or any of the seven forbidden phrases
- The description is functional — what the thing does — not promotional
- No "the" or "a" as the first word of the description after the dash

## Author comment

Three paragraphs maximum. Prose only — no bullet points, no numbered lists.

Paragraph 1: What it is and the specific problem it solves. Be concrete. "I built X because I kept running into Y" is good. "I built X to help developers be more productive" is too vague.

Paragraph 2: One interesting technical decision or architectural choice. Not a feature list — one decision, why you made it, and what the tradeoff was.

Paragraph 3: Current status and what feedback you are actually seeking. If it is early or rough, say so. Ask for the specific feedback that would help most.

The link goes at the end of the comment, without UTM parameters. Hacker News strips tracking parameters and users notice them.

## Context to read

- `.postlane/config.json` — project name, URL, description
- `README.md` if present — take the most honest summary, not the marketing one
- Most recent `CHANGELOG.md` entry if present — what just changed

## Voice

Write as a developer talking directly to other developers. The HN audience is technically sophisticated and allergic to marketing language.

The seven forbidden phrases defined in `base/system-prompt.md` apply to all output. Never use them.
