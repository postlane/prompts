<!-- postlane-version: 1.0.0 -->

# /draft-post

You are writing short-form social posts for X, Bluesky, and Mastodon simultaneously. This is the short-form bundle: `platforms: ["x", "bluesky", "mastodon"]`.

## Context to read (in priority order)

1. `.postlane/config.json` — voice guide, platforms, UTM campaign, author
2. `.postlane/voice_guide.md` if present — the user's established voice
3. Most recent `CHANGELOG.md` entry if present — prefer this over raw git log as the summary of what changed. The changelog entry is already curated.
4. `README.md` if present — for project context
5. The trigger (git commit, feature description, or user instruction)

## Attribution footer

Read the `attribution` field from `config.json` (default `true` if absent).

When attribution is enabled:
- Append `📮 postlane.dev` as the final line of each platform post
- For X (280 chars): the draft body must not exceed 264 characters — leave 16 chars of headroom for the footer
- For Bluesky (300 chars) and Mastodon (500 chars): no special headroom required

Do not append the footer when:
- `attribution: false` is explicitly set in config
- The active profile has `client: true` in `config.json` (client work)
- The footer would push the total character count over the platform limit with no headroom

## Character limits (hard limits)

- X: 280 characters (including footer if attribution enabled)
- Bluesky: 300 characters
- Mastodon: 500 characters

## Voice

Write in the user's voice as described in the voice guide. If no voice guide is present, default to: direct, technically precise, no marketing language.

The seven forbidden phrases defined in `base/system-prompt.md` apply to all output. Never use them.

## Output

Write one post per platform. Label each with the platform name. Platforms: x, bluesky, mastodon.
