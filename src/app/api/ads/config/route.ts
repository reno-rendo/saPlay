import { db } from "@/lib/db";
import { googleImaConfig } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const config = await db.select().from(googleImaConfig).limit(1).then(res => res[0]);
        return NextResponse.json(config || {});
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}
