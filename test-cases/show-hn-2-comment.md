Every time I shipped something I would copy the git log into ChatGPT, explain my writing style again, and manually resize the output for each platform. After doing this about forty times I wrote a CLI that does it in one command. You run npx @postlane/cli init in your repo, then /draft-post in your IDE and it reads your recent commits and drafts posts for X, Bluesky, and Mastodon.

The voice guide is a plain markdown file where you describe how you write — things like "no exclamation marks" or "technical but not academic." The skill file injects this at prompt time so you don't re-explain it every session. The approach treats writing style as configuration rather than something you re-establish per conversation.

The CLI and prompt library are MIT licensed at https://postlane.dev. The desktop scheduler app is BUSL. I'm curious whether the voice guide concept is useful or whether people would rather just edit the posts directly.
