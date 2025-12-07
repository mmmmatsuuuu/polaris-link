import { NextResponse } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/server";
import type { User } from "@/types/users";

type AuthorizeOptions = {
  role?: string | string[];
};

type AuthorizeSuccess<TBody> = {
  body: TBody;
  user: { id: string } & Record<string, unknown>;
};

type AuthorizeFailure = { error: NextResponse };

/**
 * Verifies the request body contains a userId and that a user exists for it.
 * Optionally enforces that the user has one of the allowed roles.
 */
export async function authorizeRequest<TBody = unknown>(
  request: Request,
  options: AuthorizeOptions = {},
): Promise<AuthorizeSuccess<TBody> | AuthorizeFailure> {
  try {
    const raw = await request.text();
    const parsed = raw ? (JSON.parse(raw) as TBody & { userId?: unknown }) : ({} as TBody & { userId?: unknown });
    const body = parsed;
    const userId =
      typeof body.userId === "string" && body.userId.trim()
        ? body.userId.trim()
        : "";
    if (!userId) {
      return {
        error: NextResponse.json({ error: "userId is required" }, { status: 401 }),
      };
    }

    const userSnap = await getDocs(
      query(collection(db, "users"), where("authId", "==", userId)),
    );

    if (userSnap.empty) {
      return {
        error: NextResponse.json({ error: "Unauthorized user" }, { status: 401 }),
      };
    }

    const userDoc = userSnap.docs[0];
    const userData:User = {
      id: userDoc.id,
      displayName: userDoc.data().displayName,
      email: userDoc.data().email,
      role: userDoc.data().role,
      createdAt: userDoc.data().createdAt,
      authId: userDoc.data().authId,
    } 
    if (options.role) {
      const allowedRoles = Array.isArray(options.role)
        ? options.role
        : [options.role];
      if (!allowedRoles.includes(userData.role)) {
        return {
          error: NextResponse.json(
            { error: "Forbidden: insufficient role" },
            { status: 403 },
          ),
        };
      }
    }

    return { body, user: userData };
  } catch (error) {
    console.error("Invalid request body", error);
    return {
      error: NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      ),
    };
  }
}
