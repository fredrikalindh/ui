import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DocsPreviewPane } from "@/components/docs-preview";
import { DiffDocsPreviewProvider } from "@/components/diff-docs-provider";
import { mdxComponents } from "@/components/mdx-components";
import { source } from "@/lib/source";
import { Fade } from "@/components/blur-fade/blur-fade";
import { Toc } from "@/components/toc";

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
  const isCentered = doc.centered ?? false;

  return (
    <DiffDocsPreviewProvider>
      <div
        data-slot="docs"
        className={
          isCentered
            ? "text-[1.05rem] sm:text-[15px] flex flex-col w-full min-w-0"
            : "text-[1.05rem] sm:text-[15px] xl:w-full flex flex-col lg:grid w-full min-w-0 lg:grid-cols-2"
        }
      >
        <div
          className={
            isCentered
              ? "flex flex-col gap-2 px-4 lg:px-12 py-32 pb-100 mx-auto w-full max-w-4xl relative"
              : "flex flex-col gap-2 px-4 lg:px-12 py-32 pb-100 relative"
          }
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </Link>
          <h1 className="scroll-m-20 text-6xl font-medium tracking-tight font-serif sm:text-7xl xl:text-8xl">
            {doc.title}
          </h1>

          {doc.description && (
            <p className="text-balance text-lg text-muted-foreground mt-4 mb-16">
              {doc.description}
            </p>
          )}

          <MDX components={mdxComponents} />

          {/* TOC positioned to the left of the content on wide screens */}
          {isCentered && doc.toc.length > 0 && (
            <aside className="fixed left-8 top-32 hidden 2xl:block w-64 z-20">
              <Toc toc={doc.toc} />
            </aside>
          )}
        </div>
        {!isCentered && <DocsPreviewPane />}
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
