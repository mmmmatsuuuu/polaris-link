"use client";

import { useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import type { RichTextDoc } from "@/types/catalog";
import { Button, Separator } from "@radix-ui/themes";
import { TableKit } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import {
  createCodeBlockExtension,
  createLowlightInstance,
} from "./CodeBlock";
import "./tiptap.css";

type TipTapEditorProps = {
  value: RichTextDoc;
  onChange: (next: RichTextDoc) => void;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
};

const emptyDoc: RichTextDoc = { type: "doc", content: [{ type: "paragraph" }] };

/**
 * シンプルなTipTapエディタ。Doc JSONを受け取り、更新時にDoc JSONを返す。
 */
export function TipTapEditor({
  value,
  onChange,
  placeholder,
  className,
  showToolbar = true,
}: TipTapEditorProps) {
  const initialContent = useMemo(() => value ?? emptyDoc, [value]);
  const lowlight = useMemo(() => createLowlightInstance(), []);
  const codeBlock = useMemo(
    () => createCodeBlockExtension(lowlight),
    [lowlight],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replace with lowlight extension
      }),
      TableKit,
      TableRow,
      TableHeader,
      TableCell,
      codeBlock,
      Link.configure({
        autolink: true,
        openOnClick: true,
        protocols: ["http", "https", "mailto"],
      }),
      Image.configure({
        allowBase64: false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "ここに入力",
      }),
    ],
    content: initialContent as any,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON() as RichTextDoc;
      onChange(json);
    },
  });

  const renderButton = (
    label: string,
    isActive: boolean,
    onClick: () => void,
  ) => (
    <Button
      size="1"
      variant={isActive ? "solid" : "soft"}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    >
      {label}
    </Button>
  );

  if (!editor) {
    return (
      <div className={`tiptap-container ${className ?? ""}`}>
        <div className="tiptap-editor">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className={`tiptap-container ${className ?? ""}`}>
      {showToolbar && (
        <div className="tiptap-toolbar">
          <div className="flex gap-1">
            {renderButton("H1", editor.isActive("heading", { level: 1 }), () =>
              editor.chain().focus().toggleHeading({ level: 1 }).run(),
            )}
            {renderButton("H2", editor.isActive("heading", { level: 2 }), () =>
              editor.chain().focus().toggleHeading({ level: 2 }).run(),
            )}
            {renderButton("H3", editor.isActive("heading", { level: 3 }), () =>
              editor.chain().focus().toggleHeading({ level: 3 }).run(),
            )}
          </div>
          <Separator orientation="vertical" size="1" />
          <div className="flex gap-1">
            {renderButton("B", editor.isActive("bold"), () =>
              editor.chain().focus().toggleBold().run(),
            )}
            {renderButton("I", editor.isActive("italic"), () =>
              editor.chain().focus().toggleItalic().run(),
            )}
            {renderButton("Code", editor.isActive("codeBlock"), () =>
              editor.chain().focus().toggleCodeBlock().run(),
            )}
            {renderButton("Quote", editor.isActive("blockquote"), () =>
              editor.chain().focus().toggleBlockquote().run(),
            )}
            {renderButton("Link", editor.isActive("link"), () => {
              const url = window.prompt("リンク先URLを入力してください", "https://");
              if (!url) return;
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            })}
            {renderButton("Unlink", false, () =>
              editor.chain().focus().unsetLink().run(),
            )}
          </div>
          <Separator orientation="vertical" size="1" />
          <div className="flex gap-1">
            {renderButton("• List", editor.isActive("bulletList"), () =>
              editor.chain().focus().toggleBulletList().run(),
            )}
            {renderButton("1. List", editor.isActive("orderedList"), () =>
              editor.chain().focus().toggleOrderedList().run(),
            )}
          </div>
          <Separator orientation="vertical" size="1" />
          <div className="flex gap-1">
            {renderButton("Table", editor.isActive("table"), () =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run(),
            )}
            {renderButton("Row+", false, () =>
              editor.chain().focus().addRowAfter().run(),
            )}
            {renderButton("Col+", false, () =>
              editor.chain().focus().addColumnAfter().run(),
            )}
            {renderButton("Del Table", false, () =>
              editor.chain().focus().deleteTable().run(),
            )}
          </div>
          <Separator orientation="vertical" size="1" />
          <div className="flex gap-1">
            {renderButton("Undo", false, () => editor.chain().focus().undo().run())}
            {renderButton("Redo", false, () => editor.chain().focus().redo().run())}
            {renderButton("Image", false, () => {
              const src = window.prompt("画像のURLを入力してください");
              if (!src) return;
              editor.chain().focus().setImage({ src }).run();
            })}
          </div>
        </div>
      )}

      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
}
