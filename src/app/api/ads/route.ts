
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adScripts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const activeAds = await db.select().from(adScripts).where(eq(adScripts.isActive, true));
        return NextResponse.json(activeAds);
    } catch (error) {
        console.error("Failed to fetch ads:", error);
        // Return empty array instead of error to prevent player break
        return NextResponse.json([]);
    }
}
