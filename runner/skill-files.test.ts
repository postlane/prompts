// Tests for skill file structure and required content.
// All tests must be RED before any implementation is written.

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function commandPath(name: string): string {
  return resolve(root, 'commands', name);
}

function read(name: string): string {
  return readFileSync(commandPath(name), 'utf8');
}

function firstLine(content: string): string {
  return content.split('\n')[0] ?? '';
}

const FORBIDDEN_PHRASES = [
  'excited to share',
  'thrilled to announce',
  'game-changing',
  'revolutionary',
  'groundbreaking',
  'dive into',
  'delve into',
  'leverage',
  'seamlessly',
  'the future of',
  "i'm proud to",
];

function assertNoForbiddenPhrases(content: string, fileName: string): void {
  const lower = content.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    expect(lower, `${fileName} must not contain "${phrase}"`).not.toContain(phrase);
  }
}

// ---------------------------------------------------------------------------
// §7.7.1 + §7.1.5 + §7.4.1-7.4.3 — draft-post.md
// ---------------------------------------------------------------------------

describe('draft-post.md', () => {
  it('exists at commands/draft-post.md', () => {
    expect(existsSync(commandPath('draft-post.md'))).toBe(true);
  });

  it('first line is the version comment', () => {
    expect(firstLine(read('draft-post.md'))).toBe('<!-- postlane-version: 1.0.0 -->');
  });

  it('sets platforms to x, bluesky, mastodon (short-form bundle)', () => {
    const content = read('draft-post.md');
    expect(content).toMatch(/x.*bluesky.*mastodon|platforms.*x.*bluesky|short.form/i);
  });

  it('prefers CHANGELOG.md over raw git log (§7.1.5)', () => {
    const content = read('draft-post.md').toLowerCase();
    expect(content).toMatch(/changelog/);
  });

  it('applies attribution footer logic (§7.4.1)', () => {
    const content = read('draft-post.md').toLowerCase();
    expect(content).toMatch(/attribution/);
  });

  it('suppresses attribution for client profiles (§7.4.2/7.4.3)', () => {
    const content = read('draft-post.md').toLowerCase();
    expect(content).toMatch(/client/);
  });

  it('does not itself contain any of the seven forbidden phrases', () => {
    assertNoForbiddenPhrases(read('draft-post.md'), 'draft-post.md');
  });
});

describe('draft-post.prompt', () => {
  it('exists at commands/draft-post.prompt', () => {
    expect(existsSync(commandPath('draft-post.prompt'))).toBe(true);
  });

  it('includes natural language triggers', () => {
    const content = read('draft-post.prompt').toLowerCase();
    expect(content).toMatch(/draft.*post|write.*post|social post/);
  });
});

// ---------------------------------------------------------------------------
// §7.7.7 — cross-platform character limits
// ---------------------------------------------------------------------------

describe('cross-platform character limits', () => {
  const platforms: Array<{ file: string; limit: number }> = [
    { file: 'draft-x.md', limit: 280 },
    { file: 'draft-bluesky.md', limit: 300 },
    { file: 'draft-mastodon.md', limit: 500 },
    { file: 'draft-linkedin.md', limit: 3000 },
    { file: 'draft-substack.md', limit: 300 },
  ];

  for (const { file, limit } of platforms) {
    it(`${file} states its ${limit}-character limit`, () => {
      expect(read(file)).toMatch(new RegExp(limit.toLocaleString('en-US').replace(',', ',?')));
    });

    it(`${file} contains no forbidden phrases`, () => {
      assertNoForbiddenPhrases(read(file), file);
    });
  }
});

// ---------------------------------------------------------------------------
// §7.1.1 — draft-changelog.md
// ---------------------------------------------------------------------------

describe('draft-changelog.md', () => {
  it('exists at commands/draft-changelog.md', () => {
    expect(existsSync(commandPath('draft-changelog.md'))).toBe(true);
  });

  it('first line is the version comment', () => {
    expect(firstLine(read('draft-changelog.md'))).toBe('<!-- postlane-version: 1.0.0 -->');
  });

  it('instructs model to identify 3–5 significant user-facing changes', () => {
    const content = read('draft-changelog.md');
    expect(content).toMatch(/3.{0,5}5/);
  });

  it('instructs model to frame changes as user benefits, not implementation detail', () => {
    const content = read('draft-changelog.md').toLowerCase();
    expect(content).toMatch(/benefit|user.facing|what it means|impact/);
  });

  it('instructs model to ignore internal-only changes', () => {
    const content = read('draft-changelog.md').toLowerCase();
    expect(content).toMatch(/refactor|test|ci|dependency|internal/);
  });

  it('instructs model to include the version number naturally', () => {
    const content = read('draft-changelog.md').toLowerCase();
    expect(content).toMatch(/version/);
  });

  it('instructs model to propose one post per platform', () => {
    const content = read('draft-changelog.md').toLowerCase();
    expect(content).toMatch(/platform|per platform/);
  });

  it('references character limit enforcement', () => {
    const content = read('draft-changelog.md').toLowerCase();
    expect(content).toMatch(/character limit|char limit/);
  });

  it('does not itself contain any of the seven forbidden phrases', () => {
    assertNoForbiddenPhrases(read('draft-changelog.md'), 'draft-changelog.md');
  });
});

// ---------------------------------------------------------------------------
// §7.1.2 — draft-changelog.prompt
// ---------------------------------------------------------------------------

describe('draft-changelog.prompt', () => {
  it('exists at commands/draft-changelog.prompt', () => {
    expect(existsSync(commandPath('draft-changelog.prompt'))).toBe(true);
  });

  it('injects the git range as a variable', () => {
    const content = read('draft-changelog.prompt');
    expect(content).toMatch(/\{from\}|\{git_range\}|\{range\}/);
    expect(content).toMatch(/\{to\}|\{git_range\}|\{range\}/);
  });

  it('injects the git log output', () => {
    expect(read('draft-changelog.prompt')).toMatch(/\{git_log/);
  });

  it('injects the diff stat', () => {
    expect(read('draft-changelog.prompt')).toMatch(/\{git_diff_stat\}|\{diff_stat\}/);
  });

  it('references the tag annotation variable', () => {
    expect(read('draft-changelog.prompt')).toMatch(/\{tag_annotation\}|\{annotation\}/);
  });
});

// ---------------------------------------------------------------------------
// §7.2.1 — draft-show-hn.md
// ---------------------------------------------------------------------------

describe('draft-show-hn.md', () => {
  it('exists at commands/draft-show-hn.md', () => {
    expect(existsSync(commandPath('draft-show-hn.md'))).toBe(true);
  });

  it('first line is the version comment', () => {
    expect(firstLine(read('draft-show-hn.md'))).toBe('<!-- postlane-version: 1.0.0 -->');
  });

  it('enforces Show HN title format', () => {
    const content = read('draft-show-hn.md');
    expect(content).toMatch(/Show HN:/);
  });

  it('enforces 80-character title limit', () => {
    const content = read('draft-show-hn.md');
    expect(content).toMatch(/80/);
  });

  it('requires author comment to be prose only (no bullet points)', () => {
    const content = read('draft-show-hn.md').toLowerCase();
    expect(content).toMatch(/prose|no bullet/);
  });

  it('prohibits UTM parameters on the link', () => {
    const content = read('draft-show-hn.md').toLowerCase();
    expect(content).toMatch(/utm/);
  });

  it('describes the three-paragraph comment structure', () => {
    const content = read('draft-show-hn.md').toLowerCase();
    expect(content).toMatch(/three|3.*paragraph|paragraph.*3/);
  });

  it('does not itself contain any of the seven forbidden phrases', () => {
    assertNoForbiddenPhrases(read('draft-show-hn.md'), 'draft-show-hn.md');
  });
});

// ---------------------------------------------------------------------------
// §7.2.2 — draft-show-hn.prompt
// ---------------------------------------------------------------------------

describe('draft-show-hn.prompt', () => {
  it('exists at commands/draft-show-hn.prompt', () => {
    expect(existsSync(commandPath('draft-show-hn.prompt'))).toBe(true);
  });

  it('includes natural language triggers', () => {
    const content = read('draft-show-hn.prompt').toLowerCase();
    expect(content).toMatch(/show hn|hacker news|hn launch/);
  });
});

// ---------------------------------------------------------------------------
// §7.3.1 — draft-product-hunt.md
// ---------------------------------------------------------------------------

describe('draft-product-hunt.md', () => {
  it('exists at commands/draft-product-hunt.md', () => {
    expect(existsSync(commandPath('draft-product-hunt.md'))).toBe(true);
  });

  it('first line is the version comment', () => {
    expect(firstLine(read('draft-product-hunt.md'))).toBe('<!-- postlane-version: 1.0.0 -->');
  });

  it('enforces 60-character tagline limit', () => {
    const content = read('draft-product-hunt.md');
    expect(content).toMatch(/60/);
  });

  it('enforces 260-character description limit', () => {
    const content = read('draft-product-hunt.md');
    expect(content).toMatch(/260/);
  });

  it('embeds a curated PH topic taxonomy list', () => {
    const content = read('draft-product-hunt.md');
    expect(content).toMatch(/Developer Tools|Productivity|Open Source|CLI/);
  });

  it('requires four-part maker comment structure', () => {
    const content = read('draft-product-hunt.md').toLowerCase();
    expect(content).toMatch(/four|4.*part|maker comment/);
  });

  it('prohibits bullet points in maker comment', () => {
    const content = read('draft-product-hunt.md').toLowerCase();
    expect(content).toMatch(/prose|no bullet/);
  });

  it('does not itself contain any of the seven forbidden phrases', () => {
    assertNoForbiddenPhrases(read('draft-product-hunt.md'), 'draft-product-hunt.md');
  });
});

// ---------------------------------------------------------------------------
// §7.3.2 — draft-product-hunt.prompt
// ---------------------------------------------------------------------------

describe('draft-product-hunt.prompt', () => {
  it('exists at commands/draft-product-hunt.prompt', () => {
    expect(existsSync(commandPath('draft-product-hunt.prompt'))).toBe(true);
  });

  it('includes natural language triggers', () => {
    const content = read('draft-product-hunt.prompt').toLowerCase();
    expect(content).toMatch(/product hunt|ph launch/);
  });
});

// ---------------------------------------------------------------------------
// §7.5.1 — redraft-post.md
// ---------------------------------------------------------------------------

describe('redraft-post.md', () => {
  it('exists at commands/redraft-post.md', () => {
    expect(existsSync(commandPath('redraft-post.md'))).toBe(true);
  });

  it('first line is the version comment', () => {
    expect(firstLine(read('redraft-post.md'))).toBe('<!-- postlane-version: 1.0.0 -->');
  });

  it('checks for pending-redraft.json as step 1', () => {
    const content = read('redraft-post.md').toLowerCase();
    expect(content).toMatch(/pending-redraft\.json/);
  });

  it('reads current platform files from post folder', () => {
    const content = read('redraft-post.md').toLowerCase();
    expect(content).toMatch(/post_folder|post folder/);
  });

  it('deletes pending-redraft.json after processing', () => {
    const content = read('redraft-post.md').toLowerCase();
    expect(content).toMatch(/delete|remove/);
  });

  it('updates meta.json status after redraft', () => {
    const content = read('redraft-post.md').toLowerCase();
    expect(content).toMatch(/meta\.json/);
  });

  it('does not itself contain any of the seven forbidden phrases', () => {
    assertNoForbiddenPhrases(read('redraft-post.md'), 'redraft-post.md');
  });
});

// ---------------------------------------------------------------------------
// §7.5.2 — redraft-post.prompt
// ---------------------------------------------------------------------------

describe('redraft-post.prompt', () => {
  it('exists at commands/redraft-post.prompt', () => {
    expect(existsSync(commandPath('redraft-post.prompt'))).toBe(true);
  });

  it('includes natural language triggers', () => {
    const content = read('redraft-post.prompt').toLowerCase();
    expect(content).toMatch(/revise|redraft|make it shorter/);
  });
});

// ---------------------------------------------------------------------------
// §7.7.2 — draft-x.md
// ---------------------------------------------------------------------------

describe('draft-x.md', () => {
  it('exists at commands/draft-x.md', () => {
    expect(existsSync(commandPath('draft-x.md'))).toBe(true);
  });

  it('first line is the version comment', () => {
    expect(firstLine(read('draft-x.md'))).toBe('<!-- postlane-version: 1.0.0 -->');
  });

  it('sets platforms to ["x"]', () => {
    const content = read('draft-x.md');
    expect(content).toMatch(/platforms.*\["x"\]|"x"|platform.*x/i);
  });

  it('enforces 280 char limit', () => {
    expect(read('draft-x.md')).toMatch(/280/);
  });

  it('does not itself contain any of the seven forbidden phrases', () => {
    assertNoForbiddenPhrases(read('draft-x.md'), 'draft-x.md');
  });
});

describe('draft-x.prompt', () => {
  it('exists at commands/draft-x.prompt', () => {
    expect(existsSync(commandPath('draft-x.prompt'))).toBe(true);
  });

  it('includes natural language triggers', () => {
    const content = read('draft-x.prompt').toLowerCase();
    expect(content).toMatch(/draft.*x post|write.*tweet|post to x/);
  });
});

// ---------------------------------------------------------------------------
// §7.7.3 — draft-bluesky.md
// ---------------------------------------------------------------------------

describe('draft-bluesky.md', () => {
  it('exists at commands/draft-bluesky.md', () => {
    expect(existsSync(commandPath('draft-bluesky.md'))).toBe(true);
  });

  it('first line is the version comment', () => {
    expect(firstLine(read('draft-bluesky.md'))).toBe('<!-- postlane-version: 1.0.0 -->');
  });

  it('enforces 300 char limit', () => {
    expect(read('draft-bluesky.md')).toMatch(/300/);
  });

  it('prohibits hashtags', () => {
    const content = read('draft-bluesky.md').toLowerCase();
    expect(content).toMatch(/no hashtag|hashtag/);
  });

  it('does not itself contain any of the seven forbidden phrases', () => {
    assertNoForbiddenPhrases(read('draft-bluesky.md'), 'draft-bluesky.md');
  });
});

describe('draft-bluesky.prompt', () => {
  it('exists at commands/draft-bluesky.prompt', () => {
    expect(existsSync(commandPath('draft-bluesky.prompt'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// §7.7.4 — draft-mastodon.md
// ---------------------------------------------------------------------------

describe('draft-mastodon.md', () => {
  it('exists at commands/draft-mastodon.md', () => {
    expect(existsSync(commandPath('draft-mastodon.md'))).toBe(true);
  });

  it('first line is the version comment', () => {
    expect(firstLine(read('draft-mastodon.md'))).toBe('<!-- postlane-version: 1.0.0 -->');
  });

  it('enforces 500 char limit', () => {
    expect(read('draft-mastodon.md')).toMatch(/500/);
  });

  it('does not itself contain any of the seven forbidden phrases', () => {
    assertNoForbiddenPhrases(read('draft-mastodon.md'), 'draft-mastodon.md');
  });
});

describe('draft-mastodon.prompt', () => {
  it('exists at commands/draft-mastodon.prompt', () => {
    expect(existsSync(commandPath('draft-mastodon.prompt'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// §7.7.5 — draft-linkedin.md
// ---------------------------------------------------------------------------

describe('draft-linkedin.md', () => {
  it('exists at commands/draft-linkedin.md', () => {
    expect(existsSync(commandPath('draft-linkedin.md'))).toBe(true);
  });

  it('first line is the version comment', () => {
    expect(firstLine(read('draft-linkedin.md'))).toBe('<!-- postlane-version: 1.0.0 -->');
  });

  it('enforces 3000 char limit', () => {
    expect(read('draft-linkedin.md')).toMatch(/3,?000/);
  });

  it('sets platforms to ["linkedin"]', () => {
    const content = read('draft-linkedin.md');
    expect(content).toMatch(/linkedin/i);
  });

  it('restricts hashtags to end of post', () => {
    const content = read('draft-linkedin.md').toLowerCase();
    expect(content).toMatch(/hashtag.*end|end.*hashtag|hashtag/);
  });

  it('does not itself contain any of the seven forbidden phrases', () => {
    assertNoForbiddenPhrases(read('draft-linkedin.md'), 'draft-linkedin.md');
  });
});

describe('draft-linkedin.prompt', () => {
  it('exists at commands/draft-linkedin.prompt', () => {
    expect(existsSync(commandPath('draft-linkedin.prompt'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// §7.7.6 — draft-substack.md
// ---------------------------------------------------------------------------

describe('draft-substack.md', () => {
  it('exists at commands/draft-substack.md', () => {
    expect(existsSync(commandPath('draft-substack.md'))).toBe(true);
  });

  it('first line is the version comment', () => {
    expect(firstLine(read('draft-substack.md'))).toBe('<!-- postlane-version: 1.0.0 -->');
  });

  it('enforces 300 char limit', () => {
    expect(read('draft-substack.md')).toMatch(/300/);
  });

  it('sets platform to substack_notes', () => {
    const content = read('draft-substack.md');
    expect(content).toMatch(/substack_notes|substack notes/i);
  });

  it('prohibits hashtags', () => {
    const content = read('draft-substack.md').toLowerCase();
    expect(content).toMatch(/no hashtag|hashtag/);
  });

  it('does not itself contain any of the seven forbidden phrases', () => {
    assertNoForbiddenPhrases(read('draft-substack.md'), 'draft-substack.md');
  });
});

describe('draft-substack.prompt', () => {
  it('exists at commands/draft-substack.prompt', () => {
    expect(existsSync(commandPath('draft-substack.prompt'))).toBe(true);
  });
});
