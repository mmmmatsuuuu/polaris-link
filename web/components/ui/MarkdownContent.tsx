import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";

type MarkdownContentProps = {
  /** Markdown文字列 */
  content: string;
  /** 追加のクラス名 */
  className?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "children">;

const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    a: [
      ...(defaultSchema.attributes?.a ?? []),
      "href",
      "title",
      "rel",
      "target",
    ],
    img: [
      ...(defaultSchema.attributes?.img ?? []),
      "src",
      "alt",
      "title",
      "width",
      "height",
      "loading",
    ],
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
  },
};

/**
 * Markdown文字列を安全に描画する共通コンポーネント。
 */
export function MarkdownContent({ content, className, ...rest }: MarkdownContentProps) {
  return (
    <div className={className} {...rest}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, schema]]}
        components={{
          a: (props) => (
            <a {...props} target="_blank" rel={props.rel ?? "noreferrer noopener"} />
          ),
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} loading={props.loading ?? "lazy"} alt="問題の画像"/>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
