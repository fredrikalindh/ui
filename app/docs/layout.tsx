// import { source } from "@/lib/source";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-wrapper flex flex-1 flex-col px-2 [--top-spacing:4rem]">
      {/* <DocsSidebar tree={source.pageTree} /> */}
      <div className="h-full w-full">{children}</div>
    </div>
  );
}
