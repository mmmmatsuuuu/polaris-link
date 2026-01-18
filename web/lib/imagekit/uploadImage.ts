import { upload } from "@imagekit/next";

type UploadResult = {
  url: string;
  path: string;
};

const authEndpoint = "/api/upload-auth";

function getExtension(type: string, name: string) {
  if (type.startsWith("image/")) {
    return type.split("/")[1] ?? "png";
  }
  const match = name.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1] : "png";
}

function createUploadFileName(file: File) {
  const ext = getExtension(file.type, file.name);
  if (typeof globalThis !== "undefined" && "crypto" in globalThis) {
    const cryptoObj = globalThis.crypto as Crypto;
    const id = cryptoObj.randomUUID?.() ?? `img_${Date.now()}`;
    return `${id}.${ext}`;
  }
  return `img_${Date.now()}.${ext}`;
}

async function getUploadAuthParams() {
  const response = await fetch(authEndpoint, { method: "GET" });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(`ImageKit auth failed: ${message}`);
  }
  const data = (await response.json()) as {
    signature: string;
    expire: number;
    token: string;
    publicKey: string;
  };
  if (!data?.signature || !data?.expire || !data?.token || !data?.publicKey) {
    throw new Error("ImageKit auth response is invalid");
  }
  return data;
}

export async function uploadImageToImageKit(file: File): Promise<UploadResult> {
  const fileName = createUploadFileName(file);
  const folderPath = "polaris_link";
  const { signature, expire, token, publicKey } = await getUploadAuthParams();
  const response = await upload({
    signature,
    expire,
    token,
    publicKey,
    file,
    fileName,
    folder: folderPath,
  });
  const url = response?.url;
  if (!url) {
    throw new Error("ImageKit upload failed");
  }
  return {
    url,
    path: response?.filePath ?? response?.name ?? fileName,
  };
}
