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
  const withFooter = `${content}\n${ATTRIBUTION_FOOTER}`;

  if ([...withFooter].length >= limit) {
    return { content, warned: true };
  }

  return { content: withFooter, warned: false };
}
