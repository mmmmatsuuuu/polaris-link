"use client";

import { useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import { DropdownMenu } from "@radix-ui/themes";

type ImageActionMenuProps = {
  editor: Editor;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  anchorPosition: { left: number; top: number } | null;
};

const widthOptions = [
  { label: "100%", value: "100%" },
  { label: "75%", value: "75%" },
  { label: "50%", value: "50%" },
] as const;

const alignOptions = [
  { label: "左寄せ", value: "left" },
  { label: "中央", value: "center" },
  { label: "右寄せ", value: "right" },
] as const;

export function ImageActionMenu({
  editor,
  isOpen,
  onOpenChange,
  anchorPosition,
}: ImageActionMenuProps) {
  const [activeWidth, setActiveWidth] = useState<string | null>(null);
  const [activeAlign, setActiveAlign] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const attrs = editor.getAttributes("image");
    if (attrs?.width) {
      setActiveWidth(attrs.width);
    }
    if (attrs?.align) {
      setActiveAlign(attrs.align);
    }
  }, [editor, isOpen]);

  const applyWidth = (width: string) => {
    setActiveWidth(width);
    editor.chain().focus().updateAttributes("image", { width }).run();
  };

  const applyAlign = (align: string) => {
    setActiveAlign(align);
    editor.chain().focus().updateAttributes("image", { align }).run();
  };

  const triggerStyle = useMemo(() => {
    if (!anchorPosition) return undefined;
    return {
      left: `${anchorPosition.left}px`,
      top: `${anchorPosition.top}px`,
    };
  }, [anchorPosition]);

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger
        className="tiptap-image-menu-trigger"
        style={triggerStyle}
        aria-hidden="true"
      >
        <span className="tiptap-image-menu-trigger-label">menu</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="start"
        sideOffset={6}
        className="tiptap-image-menu"
      >
        <DropdownMenu.Item
          className="tiptap-image-menu-item danger"
          onSelect={() => editor.chain().focus().deleteSelection().run()}
        >
          削除
        </DropdownMenu.Item>
        <DropdownMenu.Separator className="tiptap-image-menu-separator" />
        <DropdownMenu.Label className="tiptap-image-menu-label">
          幅
        </DropdownMenu.Label>
        {widthOptions.map((option) => (
          <DropdownMenu.Item
            key={option.value}
            className={`tiptap-image-menu-item ${
              activeWidth === option.value ? "is-active" : ""
            }`}
            onSelect={() => applyWidth(option.value)}
          >
            {option.label}
          </DropdownMenu.Item>
        ))}
        <DropdownMenu.Separator className="tiptap-image-menu-separator" />
        <DropdownMenu.Label className="tiptap-image-menu-label">
          配置
        </DropdownMenu.Label>
        {alignOptions.map((option) => (
          <DropdownMenu.Item
            key={option.value}
            className={`tiptap-image-menu-item ${
              activeAlign === option.value ? "is-active" : ""
            }`}
            onSelect={() => applyAlign(option.value)}
          >
            {option.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
