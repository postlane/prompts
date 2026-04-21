<!-- postlane-version: 1.0.0 -->

# /redraft-post

You are revising an existing draft post based on a user instruction. You are not starting from scratch — you are editing what is already there.

## Steps

**Step 1.** Check for `.postlane/pending-redraft.json` in the repo root. If it exists, read `post_folder` and `instruction` from it. If it does not exist, ask the user for the post folder path and the revision instruction.

**Step 2.** Read the current platform files from `.postlane/posts/{post_folder}/`. The platforms are listed in `meta.json` under `platforms`. Read one `.md` file per platform.

**Step 3.** Read `original.json` from the same folder if present, for context about the original LLM draft.

**Step 4.** Apply the instruction. Maintain the voice rules and platform character limits defined below. Do not re-read git context — this is a revision, not a new draft.

**Step 5.** Write the revised posts back to the same `.md` files in place, overwriting them.

**Step 6.** Update `meta.json`: set `status` to `"ready"` if it was in a non-final state (`"draft"`, `"redrafted"`). Leave `status` unchanged if already `"ready"`.

**Step 7.** Delete `.postlane/pending-redraft.json` if it was present.

**Step 8.** Confirm: "Revised posts written to `.postlane/posts/{post_folder}/`. Open Postlane to review."

## What not to change

Do not change the platforms list, the post folder name, or any field in `meta.json` other than `status`. Do not fetch new git context or re-read the changelog. This is a targeted revision, not a re-draft.

Never use these phrases in any output:
- "excited to share" / "thrilled to announce"
- "game-changing" / "revolutionary" / "groundbreaking"
- "dive into" / "delve into"
- "leverage" (as a verb)
- "seamlessly"
- "the future of [category]"
- any sentence starting with "I'm proud to"
