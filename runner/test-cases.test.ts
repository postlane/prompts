// Tests for §7.2.3 (Show HN test cases) and §7.3.3 (Product Hunt test cases)
// Validates format constraints against fixture outputs in test-cases/

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const testCasesDir = resolve(root, 'test-cases');

function readFixture(name: string): string {
  return readFileSync(resolve(testCasesDir, name), 'utf8');
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

function assertNoForbiddenPhrases(content: string, name: string): void {
  const lower = content.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    expect(lower, `${name} must not contain "${phrase}"`).not.toContain(phrase);
  }
}

// ---------------------------------------------------------------------------
// §7.2.3 — Show HN test cases
// ---------------------------------------------------------------------------

describe('Show HN test cases', () => {
  describe('test-case-1: postlane launch', () => {
    it('title file exists', () => {
      expect(existsSync(resolve(testCasesDir, 'show-hn-1-title.md'))).toBe(true);
    });

    it('comment file exists', () => {
      expect(existsSync(resolve(testCasesDir, 'show-hn-1-comment.md'))).toBe(true);
    });

    it('title starts with "Show HN:"', () => {
      const title = readFixture('show-hn-1-title.md').trim();
      expect(title).toMatch(/^Show HN:/);
    });

    it('title is under 80 characters', () => {
      const title = readFixture('show-hn-1-title.md').trim();
      expect([...title].length).toBeLessThan(80);
    });

    it('title contains no exclamation marks', () => {
      expect(readFixture('show-hn-1-title.md')).not.toContain('!');
    });

    it('comment has three paragraphs or fewer', () => {
      const comment = readFixture('show-hn-1-comment.md').trim();
      const paragraphs = comment.split(/\n\n+/).filter(p => p.trim().length > 0);
      expect(paragraphs.length).toBeLessThanOrEqual(3);
    });

    it('comment contains no bullet points', () => {
      const comment = readFixture('show-hn-1-comment.md');
      expect(comment).not.toMatch(/^[-*•]\s/m);
      expect(comment).not.toMatch(/^\d+\.\s/m);
    });

    it('comment link has no UTM parameters', () => {
      const comment = readFixture('show-hn-1-comment.md');
      const urls = comment.match(/https?:\/\/\S+/g) ?? [];
      for (const url of urls) {
        expect(url, `URL ${url} must not contain UTM params`).not.toMatch(/utm_/i);
      }
    });

    it('title has no forbidden phrases', () => {
      assertNoForbiddenPhrases(readFixture('show-hn-1-title.md'), 'show-hn-1-title.md');
    });

    it('comment has no forbidden phrases', () => {
      assertNoForbiddenPhrases(readFixture('show-hn-1-comment.md'), 'show-hn-1-comment.md');
    });
  });

  describe('test-case-2: alternative trigger', () => {
    it('title file exists', () => {
      expect(existsSync(resolve(testCasesDir, 'show-hn-2-title.md'))).toBe(true);
    });

    it('comment file exists', () => {
      expect(existsSync(resolve(testCasesDir, 'show-hn-2-comment.md'))).toBe(true);
    });

    it('title starts with "Show HN:"', () => {
      const title = readFixture('show-hn-2-title.md').trim();
      expect(title).toMatch(/^Show HN:/);
    });

    it('title is under 80 characters', () => {
      const title = readFixture('show-hn-2-title.md').trim();
      expect([...title].length).toBeLessThan(80);
    });

    it('comment has three paragraphs or fewer', () => {
      const comment = readFixture('show-hn-2-comment.md').trim();
      const paragraphs = comment.split(/\n\n+/).filter(p => p.trim().length > 0);
      expect(paragraphs.length).toBeLessThanOrEqual(3);
    });

    it('comment contains no bullet points', () => {
      const comment = readFixture('show-hn-2-comment.md');
      expect(comment).not.toMatch(/^[-*•]\s/m);
      expect(comment).not.toMatch(/^\d+\.\s/m);
    });

    it('comment link has no UTM parameters', () => {
      const comment = readFixture('show-hn-2-comment.md');
      const urls = comment.match(/https?:\/\/\S+/g) ?? [];
      for (const url of urls) {
        expect(url, `URL ${url} must not contain UTM params`).not.toContain('utm_');
      }
    });

    it('title has no forbidden phrases', () => {
      assertNoForbiddenPhrases(readFixture('show-hn-2-title.md'), 'show-hn-2-title.md');
    });

    it('comment has no forbidden phrases', () => {
      assertNoForbiddenPhrases(readFixture('show-hn-2-comment.md'), 'show-hn-2-comment.md');
    });
  });
});

// ---------------------------------------------------------------------------
// §7.3.3 — Product Hunt test cases
// ---------------------------------------------------------------------------

describe('Product Hunt test cases', () => {
  describe('test-case-1: postlane launch', () => {
    it('tagline file exists', () => {
      expect(existsSync(resolve(testCasesDir, 'ph-1-tagline.md'))).toBe(true);
    });

    it('description file exists', () => {
      expect(existsSync(resolve(testCasesDir, 'ph-1-description.md'))).toBe(true);
    });

    it('maker comment file exists', () => {
      expect(existsSync(resolve(testCasesDir, 'ph-1-maker-comment.md'))).toBe(true);
    });

    it('topics file exists', () => {
      expect(existsSync(resolve(testCasesDir, 'ph-1-topics.md'))).toBe(true);
    });

    it('tagline is 60 characters or fewer', () => {
      const tagline = readFixture('ph-1-tagline.md').trim();
      expect([...tagline].length).toBeLessThanOrEqual(60);
    });

    it('description is 260 characters or fewer', () => {
      const desc = readFixture('ph-1-description.md').trim();
      expect([...desc].length).toBeLessThanOrEqual(260);
    });

    it('description contains no exclamation marks', () => {
      expect(readFixture('ph-1-description.md')).not.toContain('!');
    });

    it('maker comment has no bullet points', () => {
      const comment = readFixture('ph-1-maker-comment.md');
      expect(comment).not.toMatch(/^[-*•]\s/m);
      expect(comment).not.toMatch(/^\d+\.\s/m);
    });

    it('maker comment has four paragraphs (four-part structure)', () => {
      const comment = readFixture('ph-1-maker-comment.md').trim();
      const paragraphs = comment.split(/\n\n+/).filter(p => p.trim().length > 0);
      expect(paragraphs.length).toBe(4);
    });

    it('topics are from the embedded taxonomy', () => {
      const VALID_TOPICS = [
        'Developer Tools', 'Productivity', 'Open Source', 'CLI', 'Design Tools',
        'Writing Tools', 'Marketing', 'Social Media Tools', 'Analytics', 'No-Code',
        'Automation', 'API', 'SaaS', 'Mac', 'Windows', 'Linux', 'Mobile',
        'Scheduling', 'Content Creation', 'Email',
      ];
      const topics = readFixture('ph-1-topics.md')
        .split('\n')
        .map(l => l.replace(/^[-*•\s]+/, '').trim())
        .filter(l => l.length > 0);
      for (const topic of topics) {
        expect(VALID_TOPICS, `"${topic}" is not in the embedded PH taxonomy`).toContain(topic);
      }
      expect(topics.length).toBeGreaterThanOrEqual(3);
      expect(topics.length).toBeLessThanOrEqual(5);
    });

    it('tagline has no forbidden phrases', () => {
      assertNoForbiddenPhrases(readFixture('ph-1-tagline.md'), 'ph-1-tagline.md');
    });

    it('description has no forbidden phrases', () => {
      assertNoForbiddenPhrases(readFixture('ph-1-description.md'), 'ph-1-description.md');
    });

    it('maker comment has no forbidden phrases', () => {
      assertNoForbiddenPhrases(readFixture('ph-1-maker-comment.md'), 'ph-1-maker-comment.md');
    });
  });

  describe('test-case-2: pgwatch', () => {
    it('tagline is 60 characters or fewer', () => {
      const tagline = readFixture('ph-2-tagline.md').trim();
      expect([...tagline].length).toBeLessThanOrEqual(60);
    });

    it('description is 260 characters or fewer', () => {
      const desc = readFixture('ph-2-description.md').trim();
      expect([...desc].length).toBeLessThanOrEqual(260);
    });

    it('maker comment has four paragraphs', () => {
      const comment = readFixture('ph-2-maker-comment.md').trim();
      const paragraphs = comment.split(/\n\n+/).filter(p => p.trim().length > 0);
      expect(paragraphs.length).toBe(4);
    });

    it('maker comment has no bullet points', () => {
      const comment = readFixture('ph-2-maker-comment.md');
      expect(comment).not.toMatch(/^[-*•]\s/m);
    });

    it('topics are from the embedded taxonomy', () => {
      const VALID_TOPICS = [
        'Developer Tools', 'Productivity', 'Open Source', 'CLI', 'Design Tools',
        'Writing Tools', 'Marketing', 'Social Media Tools', 'Analytics', 'No-Code',
        'Automation', 'API', 'SaaS', 'Mac', 'Windows', 'Linux', 'Mobile',
        'Scheduling', 'Content Creation', 'Email',
      ];
      const topics = readFixture('ph-2-topics.md')
        .split('\n')
        .map(l => l.replace(/^[-*•\s]+/, '').trim())
        .filter(l => l.length > 0);
      for (const topic of topics) {
        expect(VALID_TOPICS, `"${topic}" is not in the embedded PH taxonomy`).toContain(topic);
      }
    });

    it('no forbidden phrases', () => {
      assertNoForbiddenPhrases(readFixture('ph-2-tagline.md'), 'ph-2-tagline.md');
      assertNoForbiddenPhrases(readFixture('ph-2-description.md'), 'ph-2-description.md');
      assertNoForbiddenPhrases(readFixture('ph-2-maker-comment.md'), 'ph-2-maker-comment.md');
    });
  });
});

// ---------------------------------------------------------------------------
// Negative test: bad Show HN comment catches violations
// ---------------------------------------------------------------------------

function validateShowHnComment(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const paragraphs = content.trim().split(/\n\n+/).filter(p => p.trim().length > 0);
  if (paragraphs.length > 3) {
    errors.push(`Comment has ${paragraphs.length} paragraphs (max 3)`);
  }
  if (/^[-*•]\s/m.test(content) || /^\d+\.\s/m.test(content)) {
    errors.push('Comment contains bullet points or numbered list');
  }
  const lower = content.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lower.includes(phrase)) {
      errors.push(`Comment contains forbidden phrase: "${phrase}"`);
    }
  }
  return { valid: errors.length === 0, errors };
}

describe('negative test: bad Show HN comment', () => {
  it('show-hn-bad-comment.md fails paragraph count check', () => {
    const result = validateShowHnComment(readFixture('show-hn-bad-comment.md'));
    const paragraphError = result.errors.find(e => e.includes('paragraphs'));
    expect(paragraphError).toBeDefined();
  });

  it('show-hn-bad-comment.md fails bullet point check', () => {
    const result = validateShowHnComment(readFixture('show-hn-bad-comment.md'));
    const bulletError = result.errors.find(e => e.includes('bullet'));
    expect(bulletError).toBeDefined();
  });

  it('show-hn-bad-comment.md fails forbidden phrase check', () => {
    const result = validateShowHnComment(readFixture('show-hn-bad-comment.md'));
    const phraseError = result.errors.find(e => e.includes('forbidden phrase'));
    expect(phraseError).toBeDefined();
  });

  it('show-hn-1-comment.md passes all checks', () => {
    const result = validateShowHnComment(readFixture('show-hn-1-comment.md'));
    expect(result.valid).toBe(true);
  });
});
