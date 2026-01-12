"use client";

import { useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { RichTextDoc } from "@/types/catalog";
import Link from "@tiptap/extension-link";
import { TableKit } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import {
  createCodeBlockExtension,
  createLowlightInstance,
} from "./CodeBlock";
import { ExtendedImage } from "./extensions/ExtendedImage";
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
  const lowlight = useMemo(() => createLowlightInstance(), []);
  const codeBlock = useMemo(
    () => createCodeBlockExtension(lowlight),
    [lowlight],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      TableKit,
      TableRow,
      TableHeader,
      TableCell,
      codeBlock,
      Link.configure({
        autolink: true,
        openOnClick: true,
        linkOnPaste: true,
      }),
      ExtendedImage.configure({
        allowBase64: false,
      }),
    ],
    content: content as any,
    immediatelyRender: false,
    editable: false,
  });

  return (
    <div className={`${className ?? ""}`}>
      <EditorContent editor={editor} className="tiptap-viewer" />
    </div>
  );
}
