import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { authorizeRequest } from "@/app/api/_utils/authorizeRequest";
import { db } from "@/lib/firebase/server";

export async function GET(request: Request) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin", "student"] });
  if ("error" in auth) return auth.error;

  try {
    const snapshot = await getDocs(collection(db, "subjects"));
    const subjects = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error("Failed to list subjects", error);
    return NextResponse.json(
      { error: "Failed to list subjects" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await authorizeRequest(request, { role: ["teacher", "admin"] });
  if ("error" in auth) return auth.error;

  try {
    const body = auth.body as any;
    const existing = await getDocs(collection(db, "subjects"));
    const nextOrder = existing.size + 1;
    const docRef = await addDoc(collection(db, "subjects"), {
      name: body.name ?? "",
      description: body.description ?? "",
      publishStatus: body.publishStatus ?? "private",
      order: nextOrder,
      createdBy: body.createdBy ?? "admin",
      updatedAt: serverTimestamp(),
    });

    if (body.publishStatus === "public") {
      revalidatePath("/lessons");
    }

    return NextResponse.json({ id: docRef.id });
  } catch (error) {
    console.error("Failed to create subject", error);
    return NextResponse.json(
      { error: "Failed to create subject" },
      { status: 500 },
    );
  }
}
