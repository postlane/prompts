export const ATTRIBUTION_FOOTER = '📮 postlane.dev';
export const X_CHAR_LIMIT = 280;
export const X_FOOTER_HEADROOM = 16;

const PLATFORM_LIMITS: Record<string, number> = {
  x: 280,
  bluesky: 300,
  mastodon: 500,
  linkedin: 3000,
  substack_notes: 300,
};

export interface ApplyAttributionOptions {
  content: string;
  platform: string;
  attribution: boolean;
  isClientProfile?: boolean;
}

export interface AttributionResult {
  content: string;
  warned: boolean;
}

export function applyAttribution(options: ApplyAttributionOptions): AttributionResult {
  const { content, platform, attribution, isClientProfile = false } = options;

  if (!attribution || isClientProfile) {
    return { content, warned: false };
  }

  const limit = PLATFORM_LIMITS[platform] ?? 500;
  const footer = `\n${ATTRIBUTION_FOOTER}`;
  const withFooter = `${content}${footer}`;

  if ([...withFooter].length >= limit) {
    // For X only: truncate body to always fit the footer, appending '…' if truncated.
    // Max body codepoints (including '…') = limit - footerCPs
    if (platform === 'x') {
      const footerCPs = [...footer].length;
      const maxBodyCPs = limit - footerCPs;
      const bodyChars = [...content];
      if (bodyChars.length >= maxBodyCPs) {
        const truncated = bodyChars.slice(0, maxBodyCPs - 1).join('') + '…';
        return { content: `${truncated}${footer}`, warned: false };
      }
    }
    return { content, warned: true };
  }

  return { content: withFooter, warned: false };
}
