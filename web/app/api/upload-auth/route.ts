import { getUploadAuthParams } from "@imagekit/next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const privateKey = process.env.NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY ?? "";
  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? "";

  if (!privateKey || !publicKey) {
    return Response.json(
      { error: "ImageKit keys are not configured" },
      { status: 500 },
    );
  }

  const { token, expire, signature } = getUploadAuthParams({
    privateKey,
    publicKey,
  });

  return Response.json({ token, expire, signature, publicKey });
}
