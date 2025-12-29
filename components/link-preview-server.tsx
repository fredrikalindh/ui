import { fetchOGMetadata } from "@/lib/og-metadata";
import { LinkPreview } from "./link-preview";

type LinkPreviewServerProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export async function LinkPreviewServer({
  href,
  children,
  className,
}: LinkPreviewServerProps) {
  // Only fetch metadata for external links
  const isExternal = href.startsWith("http");

  if (!isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  const metadata = await fetchOGMetadata(href);

  return (
    <LinkPreview href={href} className={className} metadata={metadata}>
      {children}
    </LinkPreview>
  );
}
