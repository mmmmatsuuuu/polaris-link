"use client";

import { useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { RichTextDoc } from "@/types/catalog";

type TipTapViewerProps = {
  value: RichTextDoc;
  className?: string;
};

const emptyDoc: RichTextDoc = { type: "doc", content: [{ type: "paragraph" }] };

/**
 * シンプルなTipTapビューア。Doc JSONを読み取り専用で表示する。
 */
export function TipTapViewer({ value, className }: TipTapViewerProps) {
  const content = useMemo(() => value ?? emptyDoc, [value]);

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable: false,
  });

  return <EditorContent editor={editor} className={className} />;
}
