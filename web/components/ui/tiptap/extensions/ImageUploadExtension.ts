import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import { Fragment, Slice } from "prosemirror-model";

type UploadResult = { url: string; path: string };
type ImageUploadErrorHandler = (error: Error, context: { file: File; id: string }) => void;

type PasteSnapshot = {
  doc: Record<string, unknown>;
  selection: { from: number; to: number };
};

type ImageUploadExtensionOptions = {
  maxWidth?: number;
  resizeImage?: (file: File, maxWidth: number) => Promise<File>;
  uploadImage: (file: File) => Promise<UploadResult>;
  onError?: ImageUploadErrorHandler;
};

function getImageFilesFromItems(items: DataTransferItemList | null | undefined): File[] {
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

function getImageFilesFromFileList(files: FileList | null | undefined): File[] {
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
      maxWidth: 1000,
      resizeImage: undefined,
      uploadImage: async () => {
        throw new Error("uploadImage is not configured");
      },
      onError: undefined,
    };
  },

  addProseMirrorPlugins() {
    const extension = this;
    const handleFileUpload = async (view: any, file: File, id: string) => {
      try {
        const maxWidth = extension.options.maxWidth ?? 1000;
        const resized = extension.options.resizeImage
          ? await extension.options.resizeImage(file, maxWidth)
          : file;

        const result = await extension.options.uploadImage(resized);
        const { state, dispatch } = view;
        const pos = findUploadingNodePos(state.doc, id);
        if (pos === null) return;

        const imageType = state.schema.nodes.image;
        if (!imageType) return;
        const imageNode = imageType.create({ src: result.url });
        dispatch(state.tr.replaceWith(pos, pos + 1, imageNode));
        extension.storage.snapshots.delete(id);
      } catch (error) {
        const normalized = error instanceof Error ? error : new Error("Upload failed");
        extension.storage.lastError = normalized;

        const snapshot = extension.storage.snapshots.get(id);
        if (snapshot) {
          extension.storage.snapshots.clear();
          extension.editor.commands.setContent(snapshot.doc, {
            emitUpdate: false,
          });
          const docSize = extension.editor.state.doc.content.size;
          const from = Math.min(Math.max(1, snapshot.selection.from), docSize);
          const to = Math.min(Math.max(1, snapshot.selection.to), docSize);
          extension.editor.commands.setTextSelection({ from, to });
        } else {
          const { state, dispatch } = view;
          const pos = findUploadingNodePos(state.doc, id);
          if (pos !== null) {
            dispatch(state.tr.delete(pos, pos + 1));
          }
        }

        if (extension.options.onError) {
          extension.options.onError(normalized, { file, id });
        } else if (typeof window !== "undefined") {
          window.alert(normalized.message);
        }
      }
    };
    return [
      new Plugin({
        props: {
          handlePaste: (view, event) => {
            const imageFiles = getImageFilesFromItems(event.clipboardData?.items);
            if (imageFiles.length === 0) return false;

            const { state } = view;
            const uploadingType = state.schema.nodes.uploadingImage;
            if (!uploadingType) return false;

            const snapshot: PasteSnapshot = {
              doc: state.doc.toJSON(),
              selection: { from: state.selection.from, to: state.selection.to },
            };

            const ids = imageFiles.map(() => generateId());
            const nodes = ids.map((id) => uploadingType.create({ id }));
            const fragment = Fragment.fromArray(nodes);
            const tr = state.tr.replaceSelection(new Slice(fragment, 0, 0));
            view.dispatch(tr);

            ids.forEach((id) => {
              this.storage.snapshots.set(id, snapshot);
            });

            imageFiles.forEach((file, index) => {
              void handleFileUpload(view, file, ids[index]);
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

            const snapshot: PasteSnapshot = {
              doc: state.doc.toJSON(),
              selection: { from: state.selection.from, to: state.selection.to },
            };

            const ids = imageFiles.map(() => generateId());
            const nodes = ids.map((id) => uploadingType.create({ id }));
            const fragment = Fragment.fromArray(nodes);
            const tr = state.tr.insert(insertPos, fragment);
            view.dispatch(tr);

            ids.forEach((id) => {
              this.storage.snapshots.set(id, snapshot);
            });

            imageFiles.forEach((file, index) => {
              void handleFileUpload(view, file, ids[index]);
            });

            return true;
          },
        },
      }),
    ];
  },


  addStorage() {
    return {
      lastError: null as Error | null,
      snapshots: new Map<string, PasteSnapshot>(),
    };
  },
});
