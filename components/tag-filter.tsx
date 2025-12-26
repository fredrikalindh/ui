"use client";

import { useQueryState, parseAsString } from "nuqs";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

const ALL_TAGS = ["All", "Engineering", "Writing"] as const;

export function TagFilter() {
  const [activeTag, setActiveTag] = useQueryState(
    "tag",
    parseAsString.withDefault("")
  );

  return (
    <Tabs defaultValue={activeTag}>
      <TabsList className="flex gap-2 mb-10">
        {ALL_TAGS.map((tag) => (
          <TabsTrigger
            key={tag}
            value={tag}
            onClick={() =>
              setActiveTag(tag === "All" || activeTag === tag ? "" : tag)
            }
          >
            {tag}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export function useTagFilter() {
  const [activeTag] = useQueryState("tag", parseAsString.withDefault(""));
  return activeTag;
}
