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
- For X (280 chars): **CRITICAL — you MUST write the body in 264 characters or fewer.** The footer uses the remaining 16 characters. If your body exceeds 264 characters, it will be automatically truncated to fit the footer. Always aim for 264 characters or fewer to avoid truncation.
- For Bluesky (300 chars) and Mastodon (500 chars): no special headroom required

Do not append the footer when:
- `attribution: false` is explicitly set in config
- The active profile has `client: true` in `config.json` (client work)

## Character limits (hard limits)

- X: 280 characters (including footer if attribution enabled)
- Bluesky: 300 characters
- Mastodon: 500 characters

## Voice

Write in the user's voice as described in the voice guide. If no voice guide is present, default to: direct, technically precise, no marketing language.

Never use these phrases in any output:
- "excited to share" / "thrilled to announce"
- "game-changing" / "revolutionary" / "groundbreaking"
- "dive into" / "delve into"
- "leverage" (as a verb)
- "seamlessly"
- "the future of [category]"
- any sentence starting with "I'm proud to"

## Output

Write one post per platform. Label each with the platform name. Platforms: x, bluesky, mastodon.
