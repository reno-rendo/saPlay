
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SECRET_KEY = process.env.ADMIN_SECRET_KEY || "your-secret-key-at-least-32-chars-long";
const key = new TextEncoder().encode(SECRET_KEY);

export async function signSession(payload: { userId: number; username: string }) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key);
}

export async function verifySession(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;
    if (!session) return null;
    return await verifySession(session);
}

export async function loginAdmin(userId: number, username: string) {
    const token = await signSession({ userId, username });
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

export async function logoutAdmin() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
}
