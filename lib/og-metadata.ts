import { unstable_cache } from "next/cache";

export type OGMetadata = {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  url: string;
};

// Check if URL is a Twitter/X tweet
function isTweetUrl(url: string): boolean {
  return /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/.test(url);
}

// Convert tweet URL to fxtwitter URL for better OG metadata
function getTweetProxyUrl(url: string): string {
  return url
    .replace("twitter.com", "fxtwitter.com")
    .replace("x.com", "fxtwitter.com");
}

// Internal fetch function - not cached at fetch level
async function fetchOGMetadataInternal(
  url: string
): Promise<OGMetadata | null> {
  try {
    // Use fxtwitter.com proxy for tweets to get proper OG metadata
    const fetchUrl = isTweetUrl(url) ? getTweetProxyUrl(url) : url;

    const response = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LinkPreview/1.0)",
      },
      // Don't cache the full response - we only need the head section
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    // Only read enough to get the <head> section (OG tags are in the head)
    // This avoids downloading multi-MB pages just for metadata
    const reader = response.body?.getReader();
    if (!reader) {
      return null;
    }

    const decoder = new TextDecoder();
    let html = "";
    const maxBytes = 100_000; // 100KB should be plenty for <head>

    while (html.length < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      // Stop early if we've passed </head>
      if (html.includes("</head>")) break;
    }
    reader.cancel();

    // Parse OG tags
    const getMetaContent = (property: string): string | undefined => {
      const regex = new RegExp(
        `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
        "i"
      );
      const match = html.match(regex);
      return match?.[1] || match?.[2];
    };

    const getTitle = (): string | undefined => {
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      return getMetaContent("og:title") || titleMatch?.[1];
    };

    // Get favicon or profile picture
    const getFavicon = (): string | undefined => {
      const urlObj = new URL(url);
      const origin = urlObj.origin;

      // Try apple-touch-icon first (used by fxtwitter for profile pictures)
      const appleTouchMatch =
        html.match(
          /<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']*)["']/i
        ) ||
        html.match(
          /<link[^>]*href=["']([^"']*)["'][^>]*rel=["']apple-touch-icon["']/i
        );

      if (appleTouchMatch?.[1]) {
        const iconUrl = appleTouchMatch[1];
        if (iconUrl.startsWith("http")) {
          return iconUrl;
        }
      }

      // Try to find link rel="icon" or rel="shortcut icon"
      const iconMatch =
        html.match(
          /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i
        ) ||
        html.match(
          /<link[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:shortcut )?icon["']/i
        );

      if (iconMatch?.[1]) {
        const iconUrl = iconMatch[1];
        if (iconUrl.startsWith("http")) {
          return iconUrl;
        }
        if (iconUrl.startsWith("//")) {
          return `https:${iconUrl}`;
        }
        if (iconUrl.startsWith("/")) {
          return `${origin}${iconUrl}`;
        }
        return `${origin}/${iconUrl}`;
      }

      // Fallback to /favicon.ico
      return `${origin}/favicon.ico`;
    };

    const image = getMetaContent("og:image") || getMetaContent("twitter:image");

    return {
      title: getTitle(),
      description:
        getMetaContent("og:description") || getMetaContent("description"),
      image: image?.startsWith("http")
        ? image
        : image
        ? new URL(image, url).href
        : undefined,
      siteName: getMetaContent("og:site_name"),
      favicon: getFavicon(),
      url,
    };
  } catch (error) {
    console.error("Failed to fetch OG metadata:", error);
    return null;
  }
}

// Cache just the extracted metadata (tiny) for 24 hours, not the full HTML response
export const fetchOGMetadata = unstable_cache(
  fetchOGMetadataInternal,
  ["og-metadata"],
  { revalidate: 86400 } // 24 hours
);
