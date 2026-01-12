import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase/client";

type UploadResult = {
  url: string;
  path: string;
};

function getExtension(type: string, name: string) {
  if (type.startsWith("image/")) {
    return type.split("/")[1] ?? "png";
  }
  const match = name.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : "png";
}

export async function uploadImageToStorage(
  file: File,
  docId: string,
): Promise<UploadResult> {
  const ext = getExtension(file.type, file.name);
  const id =
    typeof globalThis !== "undefined" && "crypto" in globalThis
      ? globalThis.crypto.randomUUID?.() ?? `img_${Date.now()}`
      : `img_${Date.now()}`;
  const path = `documents/${docId}/images/${id}.${ext}`;
  const storageRef = ref(storage, path);

  const metadata = file.type ? { contentType: file.type } : undefined;
  await uploadBytes(storageRef, file, metadata);

  const url = await getDownloadURL(storageRef);
  return { url, path };
}
