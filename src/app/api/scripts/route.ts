
import { db } from "@/lib/db";
import { adScripts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");

    try {
        let query = db.select().from(adScripts).where(eq(adScripts.isActive, true));

        if (position) {
            query = db.select().from(adScripts).where(
                and(
                    eq(adScripts.isActive, true),
                    eq(adScripts.position, position as typeof adScripts.position.enumValues[number])
                )
            );
        }

        const activeScripts = await query;
        return NextResponse.json(activeScripts);
    } catch (error) {
        console.error("Failed to fetch scripts:", error);
        return NextResponse.json([]);
    }
}
