
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { popups } from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const now = new Date();
        // Fetch active popups that are within range
        const activePopups = await db.select().from(popups)
            .where(
                and(
                    eq(popups.isActive, true),
                    // sql check for date or just filter in JS if sqlite date handling is tricky
                    // Drizzle queries logic:
                )
            )
            .orderBy(desc(popups.createdAt));

        // Simple date filtering in JS to avoid SQLite complexity with timestamps
        const validPopups = activePopups.filter(p => {
            if (!p.startDate || !p.endDate) return true;
            return now >= p.startDate && now <= p.endDate;
        });

        return NextResponse.json(validPopups);
    } catch (error) {
        console.error("Failed to fetch popups:", error);
        return NextResponse.json([]);
    }
}
