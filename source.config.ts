import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import rehypePrettyCode from "rehype-pretty-code";
import * as z from "zod/v4";

import { transformers } from "@/lib/highlight-code";

export default defineConfig({
  mdxOptions: {
    rehypePlugins: (plugins) => {
      plugins.shift();
      plugins.push([
        rehypePrettyCode,
        {
          theme: {
            dark: "one-dark-pro",
            light: "one-light",
          },
          transformers,
        },
      ]);

      return plugins;
    },
  },
});

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: frontmatterSchema.extend({
      ogImage: z.string().optional(),
      centered: z.boolean().optional(),
      published: z.boolean().default(true),
      tags: z.array(z.string()).default([]),
      image: z.string().optional(),
      date: z.string().optional(),
      theme: z.enum(["light", "dark"]).optional(),
      buttonLabel: z.string().optional(),
    }),
  },
});
