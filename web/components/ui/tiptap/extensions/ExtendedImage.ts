import Image from "@tiptap/extension-image";
import { mergeAttributes } from "@tiptap/core";

type ImageAlign = "left" | "center" | "right";
type ImageWidth = "100%" | "75%" | "50%";

export const ExtendedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%" as ImageWidth,
        parseHTML: (element) =>
          (element.getAttribute("data-width") as ImageWidth) ?? "100%",
        renderHTML: (attributes) => ({
          "data-width": attributes.width,
        }),
      },
      align: {
        default: "center" as ImageAlign,
        parseHTML: (element) =>
          (element.getAttribute("data-align") as ImageAlign) ?? "center",
        renderHTML: (attributes) => ({
          "data-align": attributes.align,
        }),
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const align = (HTMLAttributes["data-align"] as ImageAlign) ?? "center";
    const width = (HTMLAttributes["data-width"] as ImageWidth) ?? "100%";

    return [
      "div",
      {
        class: `tiptap-image align-${align}`,
      },
      [
        "img",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          style: `width: ${width};`,
          "data-tiptap-image": "true",
        }),
      ],
    ];
  },

  parseHTML() {
    return [
      {
        tag: "img[data-tiptap-image]",
      },
      {
        tag: "img[src]",
      },
    ];
  },
});
