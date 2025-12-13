"use client";

import { useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import type { RichTextDoc } from "@/types/catalog";

type TipTapEditorProps = {
  value: RichTextDoc;
  onChange: (next: RichTextDoc) => void;
  placeholder?: string;
  className?: string;
};

const emptyDoc: RichTextDoc = { type: "doc", content: [{ type: "paragraph" }] };

/**
 * シンプルなTipTapエディタ。Doc JSONを受け取り、更新時にDoc JSONを返す。
 */
export function TipTapEditor({ value, onChange, placeholder, className }: TipTapEditorProps) {
  const initialContent = useMemo(() => value ?? emptyDoc, [value]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder ?? "ここに入力",
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON() as RichTextDoc;
      onChange(json);
    },
  });

  return <EditorContent editor={editor} className={className} />;
}
