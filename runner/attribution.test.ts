// Tests for §7.4 — attribution footer logic
// All tests must be RED before any implementation is written.

import { describe, it, expect } from 'vitest';
import { applyAttribution, ATTRIBUTION_FOOTER, X_CHAR_LIMIT, X_FOOTER_HEADROOM } from './attribution.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe('attribution constants', () => {
  it('footer is the correct string', () => {
    expect(ATTRIBUTION_FOOTER).toBe('📮 postlane.dev');
  });

  it('X char limit is 280', () => {
    expect(X_CHAR_LIMIT).toBe(280);
  });

  it('X footer headroom is 16', () => {
    expect(X_FOOTER_HEADROOM).toBe(16);
  });
});

// ---------------------------------------------------------------------------
// §7.4.6 — test 1: attribution true, X post at 260 chars → footer appended
// ---------------------------------------------------------------------------

describe('applyAttribution — X platform, attribution enabled', () => {
  it('appends footer when body is within headroom (260 chars)', () => {
    const body = 'a'.repeat(260);
    const result = applyAttribution({ content: body, platform: 'x', attribution: true });

    expect(result.content).toBe(`${body}\n${ATTRIBUTION_FOOTER}`);
    expect(result.warned).toBe(false);
  });

  it('total character count after footer does not exceed 280', () => {
    const body = 'a'.repeat(260);
    const result = applyAttribution({ content: body, platform: 'x', attribution: true });

    expect([...result.content].length).toBeLessThanOrEqual(280);
  });

  it('appends footer when body is exactly at the headroom boundary (264 chars)', () => {
    // 264 body + 1 newline + 15 footer chars = 280 exactly
    const body = 'a'.repeat(264);
    const result = applyAttribution({ content: body, platform: 'x', attribution: true });

    expect(result.content).toContain(ATTRIBUTION_FOOTER);
    expect(result.warned).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// §7.4.6 — test 2: attribution true, X body too long → truncate and append footer
//
// Footer as codepoints: [...'\n📮 postlane.dev'].length = 15
// Max body codepoints (including '…') = 280 - 15 = 265
// So: truncate to 264 body chars, append '…' → 265 codepoint body line
// Total = 265 + 15 = 280 codepoints exactly
// ---------------------------------------------------------------------------

describe('applyAttribution — X platform, body too long for footer (truncation)', () => {
  it('truncates body and appends footer when body is 265 chars, total = 280', () => {
    const body = 'a'.repeat(265);
    const result = applyAttribution({ content: body, platform: 'x', attribution: true });

    expect(result.warned).toBe(false);
    expect(result.content).toContain(ATTRIBUTION_FOOTER);
    expect([...result.content].length).toBe(280);
    // body line: 264 'a' chars + '…' = 265 codepoints
    const lines = result.content.split('\n');
    const firstLine = lines[0] ?? '';
    expect([...firstLine].length).toBe(265);
    expect(firstLine).toMatch(/^a{264}…$/);
  });

  it('truncates and appends footer when body is 300 chars, total = 280', () => {
    const body = 'a'.repeat(300);
    const result = applyAttribution({ content: body, platform: 'x', attribution: true });

    expect(result.warned).toBe(false);
    expect(result.content).toContain(ATTRIBUTION_FOOTER);
    expect([...result.content].length).toBe(280);
  });

  it('attribution disabled: body returned unchanged regardless of length (300 chars)', () => {
    const body = 'a'.repeat(300);
    const result = applyAttribution({ content: body, platform: 'x', attribution: false });

    expect(result.content).toBe(body);
    expect(result.warned).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// §7.4.6 — test 3: attribution false → no footer
// ---------------------------------------------------------------------------

describe('applyAttribution — attribution disabled', () => {
  it('does not append footer when attribution is false (X platform)', () => {
    const body = 'a'.repeat(100);
    const result = applyAttribution({ content: body, platform: 'x', attribution: false });

    expect(result.content).toBe(body);
    expect(result.content).not.toContain(ATTRIBUTION_FOOTER);
    expect(result.warned).toBe(false);
  });

  it('does not append footer when attribution is false (Bluesky platform)', () => {
    const body = 'a'.repeat(100);
    const result = applyAttribution({ content: body, platform: 'bluesky', attribution: false });

    expect(result.content).toBe(body);
    expect(result.warned).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Bluesky and Mastodon — no headroom constraint, footer always fits
// ---------------------------------------------------------------------------

describe('applyAttribution — Bluesky (300 char limit)', () => {
  it('appends footer to a 280-char Bluesky post without warning', () => {
    const body = 'a'.repeat(280);
    const result = applyAttribution({ content: body, platform: 'bluesky', attribution: true });

    expect(result.content).toContain(ATTRIBUTION_FOOTER);
    expect(result.warned).toBe(false);
  });

  it('warns and does not append when Bluesky post would exceed 300 chars with footer', () => {
    // Footer = '\n📮 postlane.dev' = 16 chars. 285 + 16 = 301 > 300.
    const body = 'a'.repeat(285);
    const result = applyAttribution({ content: body, platform: 'bluesky', attribution: true });

    expect(result.warned).toBe(true);
    expect(result.content).not.toContain(ATTRIBUTION_FOOTER);
  });
});

describe('applyAttribution — Mastodon (500 char limit)', () => {
  it('appends footer to a 480-char Mastodon post without warning', () => {
    const body = 'a'.repeat(480);
    const result = applyAttribution({ content: body, platform: 'mastodon', attribution: true });

    expect(result.content).toContain(ATTRIBUTION_FOOTER);
    expect(result.warned).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Client profile suppression (§7.4.3)
// ---------------------------------------------------------------------------

describe('applyAttribution — client profile suppression', () => {
  it('does not append footer when isClientProfile is true, regardless of attribution setting', () => {
    const body = 'a'.repeat(100);
    const result = applyAttribution({
      content: body,
      platform: 'x',
      attribution: true,
      isClientProfile: true,
    });

    expect(result.content).toBe(body);
    expect(result.warned).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Unknown platform fallback
// ---------------------------------------------------------------------------

describe('applyAttribution — unknown platform fallback', () => {
  it('uses 500-char limit for platforms not in the known list', () => {
    const content = 'a'.repeat(460);
    const result = applyAttribution({ content, platform: 'threads', attribution: true });
    // footer is 16 chars; 460 + 1 (newline) + 15 = 476 < 500 → footer applied
    expect(result.content).toContain('📮 postlane.dev');
    expect(result.warned).toBe(false);
  });
});
