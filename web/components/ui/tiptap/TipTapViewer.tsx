"use client";

import { useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { RichTextDoc } from "@/types/catalog";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import "./tiptap.css";

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
  const lowlight = useMemo(() => createLowlight(common), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
      }),
      Image.configure({
        allowBase64: false,
      }),
    ],
    content,
    immediatelyRender: false,
    editable: false,
  });

  return (
    <div className={`tiptap-container ${className ?? ""}`}>
      <EditorContent editor={editor} className="tiptap-viewer" />
    </div>
  );
}
