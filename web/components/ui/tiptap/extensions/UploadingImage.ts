import { Node, mergeAttributes } from "@tiptap/core";

export const UploadingImage = Node.create({
  name: "uploadingImage",

  group: "inline",
  inline: true,
  atom: true,
  selectable: false,
  draggable: false,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-id"),
        renderHTML: (attributes) => {
          if (!attributes.id) {
            return {};
          }
          return { "data-id": attributes.id };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-uploading-image]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-uploading-image": "true",
        class: "tiptap-uploading-image",
      }),
      "Uploading...",
    ];
  },
});
