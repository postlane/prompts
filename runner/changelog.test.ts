// Tests for 7.1.3–7.1.4 — draft-changelog runner integration
// All tests must be RED before any implementation is written.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GitRunner, LlmRunner } from './types.js';
import { runDraftChangelog } from './changelog.js';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const REALISTIC_GIT_LOG = `abc1234 Add dark mode support
def5678 Fix timezone offset bug in scheduler
ghi9012 Update README with new install steps`;

const REALISTIC_DIFF_STAT = `src/settings/AppearanceTab.tsx | 45 +++++++++---
src/scheduler/timing.rs        | 12 +++--
README.md                      | 8 ++--
3 files changed, 57 insertions(+), 8 deletions(-)`;

const TAG_ANNOTATION = 'Release v0.4.0';

// Minimal LLM response: one post per platform
const LLM_RESPONSE = `---
x: |
  Dark mode, timezone fix, and cleaner docs — v0.4.0 is out.

  https://example.com
---
bluesky: |
  v0.4.0: dark mode support and a long-standing timezone bug fixed.

  https://example.com
---`;

function makeGitRunner(overrides?: Partial<GitRunner>): GitRunner {
  return {
    log: vi.fn().mockReturnValue(REALISTIC_GIT_LOG),
    diffStat: vi.fn().mockReturnValue(REALISTIC_DIFF_STAT),
    tagAnnotation: vi.fn().mockReturnValue(TAG_ANNOTATION),
    latestTags: vi.fn().mockReturnValue(['v0.3.1', 'v0.4.0']),
    initialCommit: vi.fn().mockReturnValue('abc0001'),
    ...overrides,
  };
}

function makeLlmRunner(): LlmRunner {
  return {
    complete: vi.fn().mockResolvedValue(LLM_RESPONSE),
  };
}

// ---------------------------------------------------------------------------
// 7.1.6 — test 1: valid git log → correct post folder and meta.json
// ---------------------------------------------------------------------------

describe('runDraftChangelog — happy path', () => {
  it('produces a post folder named {YYYYMMDD}-{version-slug}-changelog', async () => {
    const git = makeGitRunner();
    const llm = makeLlmRunner();

    const result = await runDraftChangelog({
      from: 'v0.3.1',
      to: 'v0.4.0',
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    });

    expect(result.postFolder).toMatch(/^\d{8}-v040-changelog$/);
  });

  it('writes meta.json with status "draft" and command "draft-changelog"', async () => {
    const git = makeGitRunner();
    const llm = makeLlmRunner();

    const result = await runDraftChangelog({
      from: 'v0.3.1',
      to: 'v0.4.0',
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    });

    expect(result.meta.status).toBe('draft');
    expect(result.meta.command).toBe('draft-changelog');
  });

  it('calls git log with the correct range', async () => {
    const git = makeGitRunner();
    const llm = makeLlmRunner();

    await runDraftChangelog({
      from: 'v0.3.1',
      to: 'v0.4.0',
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    });

    expect(git.log).toHaveBeenCalledWith({
      repoPath: '/fake/repo',
      from: 'v0.3.1',
      to: 'v0.4.0',
    });
  });

  it('includes git context in the LLM prompt', async () => {
    const git = makeGitRunner();
    const llm = makeLlmRunner();

    await runDraftChangelog({
      from: 'v0.3.1',
      to: 'v0.4.0',
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    });

    const promptArg: string = ((llm.complete as ReturnType<typeof vi.fn>).mock.calls[0] ?? [])[0] as string;
    expect(promptArg).toContain('v0.3.1..v0.4.0');
    expect(promptArg).toContain(REALISTIC_GIT_LOG);
    expect(promptArg).toContain(REALISTIC_DIFF_STAT);
  });
});

// ---------------------------------------------------------------------------
// 7.1.6 — test 2: one tag only → uses initial commit as [from]
// ---------------------------------------------------------------------------

describe('runDraftChangelog — one tag fallback', () => {
  it('uses the initial commit as [from] when only one tag exists', async () => {
    const git = makeGitRunner({
      latestTags: vi.fn().mockReturnValue(['v0.1.0']),
      initialCommit: vi.fn().mockReturnValue('abc0001'),
    });
    const llm = makeLlmRunner();

    const result = await runDraftChangelog({
      // No explicit from/to — runner must derive them
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    });

    expect(git.log).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'abc0001', to: 'v0.1.0' }),
    );
    expect(result.meta.status).toBe('draft');
  });
});

// ---------------------------------------------------------------------------
// Two-tag auto-derive (no explicit from/to)
// ---------------------------------------------------------------------------

describe('runDraftChangelog — two-tag auto-derive', () => {
  it('derives from/to from the two most recent tags when none are passed explicitly', async () => {
    const git = makeGitRunner({
      latestTags: vi.fn().mockReturnValue(['v0.3.1', 'v0.4.0']),
    });
    const llm = makeLlmRunner();

    await runDraftChangelog({
      // No explicit from/to
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    });

    expect(git.log).toHaveBeenCalledWith(
      expect.objectContaining({ from: 'v0.3.1', to: 'v0.4.0' }),
    );
  });
});

// ---------------------------------------------------------------------------
// 7.1.6 — test 3: no tags → error, no crash, no silent failure
// ---------------------------------------------------------------------------

describe('runDraftChangelog — no tags', () => {
  it('throws a ChangelogError with a clear message when no tags exist', async () => {
    const git = makeGitRunner({
      latestTags: vi.fn().mockReturnValue([]),
    });
    const llm = makeLlmRunner();

    await expect(
      runDraftChangelog({
        repoPath: '/fake/repo',
        skillPath: '/fake/prompts/commands/draft-changelog.md',
        git,
        llm,
      }),
    ).rejects.toThrow('No tags found. Tag your release first with `git tag v0.1.0`.');
  });

  it('does not call the LLM when no tags exist', async () => {
    const git = makeGitRunner({
      latestTags: vi.fn().mockReturnValue([]),
    });
    const llm = makeLlmRunner();

    await runDraftChangelog({
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    }).catch(() => {/* expected */});

    expect(llm.complete).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Slug generation
// ---------------------------------------------------------------------------

describe('version slug derivation', () => {
  it('converts v0.4.0 to v040', async () => {
    const git = makeGitRunner();
    const llm = makeLlmRunner();

    const result = await runDraftChangelog({
      from: 'v0.3.1',
      to: 'v0.4.0',
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    });

    expect(result.postFolder).toContain('v040');
  });

  it('converts v1.10.2 to v1102', async () => {
    const git = makeGitRunner({
      latestTags: vi.fn().mockReturnValue(['v1.9.0', 'v1.10.2']),
    });
    const llm = makeLlmRunner();

    const result = await runDraftChangelog({
      from: 'v1.9.0',
      to: 'v1.10.2',
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    });

    expect(result.postFolder).toContain('v1102');
  });
});

// ---------------------------------------------------------------------------
// Tag annotation injection
// ---------------------------------------------------------------------------

describe('runDraftChangelog — tag annotation', () => {
  it('includes tag annotation in the LLM prompt when present', async () => {
    const git = makeGitRunner();
    const llm = makeLlmRunner();

    await runDraftChangelog({
      from: 'v0.3.1',
      to: 'v0.4.0',
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    });

    const promptArg: string = ((llm.complete as ReturnType<typeof vi.fn>).mock.calls[0] ?? [])[0] as string;
    expect(promptArg).toContain('Tag annotation');
    expect(promptArg).toContain(TAG_ANNOTATION);
  });

  it('omits the tag annotation section when annotation is empty', async () => {
    const git = makeGitRunner({
      tagAnnotation: vi.fn().mockReturnValue(''),
    });
    const llm = makeLlmRunner();

    await runDraftChangelog({
      from: 'v0.3.1',
      to: 'v0.4.0',
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    });

    const promptArg: string = ((llm.complete as ReturnType<typeof vi.fn>).mock.calls[0] ?? [])[0] as string;
    expect(promptArg).not.toContain('Tag annotation');
  });
});

// ---------------------------------------------------------------------------
// LLM response length guard
// ---------------------------------------------------------------------------

describe('runDraftChangelog — response length guard', () => {
  it('throws ChangelogError when LLM response exceeds 50,000 chars', async () => {
    const git = makeGitRunner();
    const llm: LlmRunner = {
      complete: vi.fn().mockResolvedValue('a'.repeat(50_001)),
    };

    await expect(
      runDraftChangelog({
        from: 'v0.3.1',
        to: 'v0.4.0',
        repoPath: '/fake/repo',
        skillPath: '/fake/prompts/commands/draft-changelog.md',
        git,
        llm,
      }),
    ).rejects.toThrow(/LLM response exceeded maximum length/);
  });

  it('includes the actual length in the error message', async () => {
    const git = makeGitRunner();
    const llm: LlmRunner = {
      complete: vi.fn().mockResolvedValue('a'.repeat(50_001)),
    };

    await expect(
      runDraftChangelog({
        from: 'v0.3.1',
        to: 'v0.4.0',
        repoPath: '/fake/repo',
        skillPath: '/fake/prompts/commands/draft-changelog.md',
        git,
        llm,
      }),
    ).rejects.toThrow('50001 chars');
  });

  it('does not throw when response is exactly 50,000 chars', async () => {
    const git = makeGitRunner();
    const llm: LlmRunner = {
      complete: vi.fn().mockResolvedValue('a'.repeat(50_000)),
    };

    await expect(
      runDraftChangelog({
        from: 'v0.3.1',
        to: 'v0.4.0',
        repoPath: '/fake/repo',
        skillPath: '/fake/prompts/commands/draft-changelog.md',
        git,
        llm,
      }),
    ).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Git log size limit (Fix 2)
// ---------------------------------------------------------------------------

describe('runDraftChangelog — git log size limit', () => {
  it('passes git log through unchanged when it is under 40KB', async () => {
    const smallLog = 'a'.repeat(39_999);
    const git = makeGitRunner({
      log: vi.fn().mockReturnValue(smallLog),
    });
    const llm = makeLlmRunner();

    await runDraftChangelog({
      from: 'v0.3.1',
      to: 'v0.4.0',
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    });

    const promptArg: string = ((llm.complete as ReturnType<typeof vi.fn>).mock.calls[0] ?? [])[0] as string;
    expect(promptArg).toContain(smallLog);
    expect(promptArg).not.toContain('[Note: git log truncated');
  });

  it('truncates git log and prepends a note when it exceeds 40KB', async () => {
    // Build a log with 40 commits, each ~1100 bytes, total > 40KB
    const commitLine = 'x'.repeat(1_100) + '\n';
    const commits = Array.from({ length: 40 }, (_, i) => `commit${String(i).padStart(3, '0')} ${commitLine}`);
    const bigLog = commits.join('');

    const git = makeGitRunner({
      log: vi.fn().mockReturnValue(bigLog),
    });
    const llm = makeLlmRunner();

    await runDraftChangelog({
      from: 'v0.3.1',
      to: 'v0.4.0',
      repoPath: '/fake/repo',
      skillPath: '/fake/prompts/commands/draft-changelog.md',
      git,
      llm,
    });

    const promptArg: string = ((llm.complete as ReturnType<typeof vi.fn>).mock.calls[0] ?? [])[0] as string;
    expect(promptArg).toContain('[Note: git log truncated to most recent 30 commits.');
    expect(promptArg).toContain('Full history had');
    expect(promptArg).toContain('commits.]');
  });
});
