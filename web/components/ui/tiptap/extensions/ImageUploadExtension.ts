import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import { Fragment, Slice } from "prosemirror-model";

type UploadResult = { url: string; path: string };
type ImageUploadErrorHandler = (error: Error, context: { file: File; id: string }) => void;

type ImageUploadExtensionOptions = {
  docId: string;
  maxWidth?: number;
  resizeImage?: (file: File, maxWidth: number) => Promise<File>;
  uploadImage: (file: File, docId: string) => Promise<UploadResult>;
  onError?: ImageUploadErrorHandler;
};

function getImageFilesFromItems(items: DataTransferItemList | null): File[] {
  if (!items) return [];
  const files: File[] = [];
  for (const item of Array.from(items)) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }
  return files;
}

function getImageFilesFromFileList(files: FileList | null): File[] {
  if (!files) return [];
  return Array.from(files).filter((file) => file.type.startsWith("image/"));
}

function generateId() {
  if (typeof globalThis !== "undefined" && "crypto" in globalThis) {
    const cryptoObj = globalThis.crypto as Crypto;
    if (cryptoObj?.randomUUID) {
      return cryptoObj.randomUUID();
    }
  }
  return `img_${Math.random().toString(36).slice(2, 10)}`;
}

function findUploadingNodePos(doc: any, id: string): number | null {
  let found: number | null = null;
  doc.descendants((node: any, pos: number) => {
    if (node.type?.name === "uploadingImage" && node.attrs?.id === id) {
      found = pos;
      return false;
    }
    return true;
  });
  return found;
}

export const ImageUploadExtension = Extension.create<ImageUploadExtensionOptions>({
  name: "imageUpload",

  addOptions() {
    return {
      docId: "",
      maxWidth: 1000,
      resizeImage: undefined,
      uploadImage: async () => {
        throw new Error("uploadImage is not configured");
      },
      onError: undefined,
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const imageFiles = getImageFilesFromItems(event.clipboardData?.items);
            if (imageFiles.length === 0) return false;

            const { state } = view;
            const uploadingType = state.schema.nodes.uploadingImage;
            if (!uploadingType) return false;

            const ids = imageFiles.map(() => generateId());
            const nodes = ids.map((id) => uploadingType.create({ id }));
            const fragment = Fragment.fromArray(nodes);
            const tr = state.tr.replaceSelection(new Slice(fragment, 0, 0));
            view.dispatch(tr);

            imageFiles.forEach((file, index) => {
              void this.handleFileUpload(view, file, ids[index]);
            });

            return true;
          },
          handleDrop: (view, event) => {
            const imageFiles = getImageFilesFromFileList(event.dataTransfer?.files);
            if (imageFiles.length === 0) return false;

            const { state } = view;
            const uploadingType = state.schema.nodes.uploadingImage;
            if (!uploadingType) return false;

            const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
            const insertPos = coords?.pos ?? state.selection.from;

            const ids = imageFiles.map(() => generateId());
            const nodes = ids.map((id) => uploadingType.create({ id }));
            const fragment = Fragment.fromArray(nodes);
            const tr = state.tr.insert(insertPos, fragment);
            view.dispatch(tr);

            imageFiles.forEach((file, index) => {
              void this.handleFileUpload(view, file, ids[index]);
            });

            return true;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      replaceUploadingWithImage:
        (id: string, url: string) =>
        ({ state, dispatch }) => {
          const pos = findUploadingNodePos(state.doc, id);
          if (pos === null) return false;
          const imageType = state.schema.nodes.image;
          if (!imageType) return false;
          const imageNode = imageType.create({ src: url });
          if (dispatch) {
            dispatch(state.tr.replaceWith(pos, pos + 1, imageNode));
          }
          return true;
        },
      removeUploading:
        (id: string) =>
        ({ state, dispatch }) => {
          const pos = findUploadingNodePos(state.doc, id);
          if (pos === null) return false;
          if (dispatch) {
            dispatch(state.tr.delete(pos, pos + 1));
          }
          return true;
        },
    };
  },

  addStorage() {
    return {
      lastError: null as Error | null,
    };
  },

  async handleFileUpload(view: any, file: File, id: string) {
    try {
      const maxWidth = this.options.maxWidth ?? 1000;
      const resized = this.options.resizeImage
        ? await this.options.resizeImage(file, maxWidth)
        : file;

      const result = await this.options.uploadImage(resized, this.options.docId);
      const { state, dispatch } = view;
      const pos = findUploadingNodePos(state.doc, id);
      if (pos === null) return;

      const imageType = state.schema.nodes.image;
      if (!imageType) return;
      const imageNode = imageType.create({ src: result.url });
      dispatch(state.tr.replaceWith(pos, pos + 1, imageNode));
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error("Upload failed");
      this.storage.lastError = normalized;

      const { state, dispatch } = view;
      const pos = findUploadingNodePos(state.doc, id);
      if (pos !== null) {
        dispatch(state.tr.delete(pos, pos + 1));
      }

      if (this.options.onError) {
        this.options.onError(normalized, { file, id });
      } else if (typeof window !== "undefined") {
        window.alert(normalized.message);
      }
    }
  },
});
