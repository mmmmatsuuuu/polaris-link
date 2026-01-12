type ResizeOptions = {
  maxWidth?: number;
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像の読み込みに失敗しました"));
    };
    img.src = url;
  });
}

function getTargetSize(width: number, height: number, maxWidth: number) {
  if (width <= maxWidth) {
    return { width, height, resized: false };
  }
  const ratio = maxWidth / width;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
    resized: true,
  };
}

function getOutputType(inputType: string) {
  if (inputType.startsWith("image/")) {
    return inputType;
  }
  return "image/png";
}

export async function resizeToMaxWidth(
  file: File,
  maxWidth = 1000,
  options: ResizeOptions = {},
): Promise<File> {
  const targetMaxWidth = options.maxWidth ?? maxWidth;
  const img = await loadImageFromFile(file);
  const { width, height, resized } = getTargetSize(
    img.width,
    img.height,
    targetMaxWidth,
  );

  if (!resized) {
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("画像の描画に失敗しました");
  }

  ctx.drawImage(img, 0, 0, width, height);

  const outputType = getOutputType(file.type);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType);
  });

  if (!blob) {
    throw new Error("画像の変換に失敗しました");
  }

  const ext = outputType.split("/")[1] ?? "png";
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  const outputName = `${baseName}.${ext}`;

  return new File([blob], outputName, { type: outputType });
}
