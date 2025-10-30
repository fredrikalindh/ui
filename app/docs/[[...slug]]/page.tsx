import { notFound } from "next/navigation";

import { DocsPreviewPane } from "@/components/docs-preview";
import { DiffDocsPreviewProvider } from "@/components/diff-docs-provider";
import { mdxComponents } from "@/components/mdx-components";
import { source } from "@/lib/source";
import { Fade } from "@/components/blur-fade/blur-fade";

export const revalidate = false;
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) {
    notFound();
  }

  const doc = page.data;

  if (!doc.title || !doc.description) {
    notFound();
  }

  return {
    title: doc.title,
    description: doc.description,
    openGraph: {
      title: doc.title,
      description: doc.description,
      type: "article",
      url: `${process.env.NEXT_PUBLIC_APP_URL}${page.url}`,
      images: [
        {
          url: doc.ogImage
            ? doc.ogImage
            : `/og?title=${encodeURIComponent(
                doc.title
              )}&description=${encodeURIComponent(doc.description)}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.description,
      images: [
        {
          url: doc.ogImage
            ? doc.ogImage
            : `/og?title=${encodeURIComponent(
                doc.title
              )}&description=${encodeURIComponent(doc.description)}`,
        },
      ],
      creator: "@fredrikalindh",
    },
  };
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) {
    notFound();
  }

  const doc = page.data;

  const MDX = doc.body;

  return (
    <DiffDocsPreviewProvider>
      <div
        data-slot="docs"
        className="text-[1.05rem] sm:text-[15px] xl:w-full flex flex-col lg:grid w-full min-w-0 lg:grid-cols-2"
      >
        <div className="flex flex-col gap-2 px-4 lg:px-12 py-32 pb-100">
          <h1 className="scroll-m-20 text-6xl font-medium tracking-tight font-serif sm:text-7xl xl:text-8xl">
            {doc.title}
          </h1>

          {doc.description && (
            <p className="text-balance text-lg text-muted-foreground mt-4 mb-16">
              {doc.description}
            </p>
          )}

          <MDX components={mdxComponents} />
        </div>
        <DocsPreviewPane />
        <Fade
          side="top"
          background="var(--color-background)"
          blur="4px"
          stop="50%"
          className="!fixed inset-x-0 top-0 h-32 z-10"
        />
        <Fade
          side="bottom"
          background="var(--color-background)"
          blur="4px"
          stop="25%"
          debug
          className="!fixed inset-x-0 bottom-0 h-1/6 z-10"
        />
      </div>
    </DiffDocsPreviewProvider>
  );
}
