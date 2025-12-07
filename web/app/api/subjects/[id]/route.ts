import { NextResponse } from "next/server";
import { deleteDoc, doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin", "student"] });
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    return await respondSubjectDetail(id);
  } catch (error) {
    console.error("Failed to get subject", error);
    return NextResponse.json(
      { error: "Failed to get subject" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    return await respondSubjectDetail(id);
  } catch (error) {
    console.error("Failed to get subject", error);
    return NextResponse.json(
      { error: "Failed to get subject" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const body = auth.body as any;
    const docRef = doc(db, "subjects", id);
    await updateDoc(docRef, {
      name: body.name,
      description: body.description,
      publishStatus: body.publishStatus,
      order: body.order,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ id: id });
  } catch (error) {
    console.error("Failed to update subject", error);
    return NextResponse.json(
      { error: "Failed to update subject" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const docRef = doc(db, "subjects", id);
    await deleteDoc(docRef);
    return NextResponse.json({ id: id });
  } catch (error) {
    console.error("Failed to delete subject", error);
    return NextResponse.json(
      { error: "Failed to delete subject" },
      { status: 500 },
    );
  }
}

async function respondSubjectDetail(id: string) {
  const docRef = doc(db, "subjects", id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ id: snapshot.id, ...snapshot.data() });
}
