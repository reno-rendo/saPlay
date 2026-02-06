
import { db } from "@/lib/db";
import { popups } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

async function checkPopups() {
    try {
        console.log("Checking database for popups...");
        const allPopups = await db.select().from(popups).orderBy(desc(popups.createdAt));

        console.log(`Found ${allPopups.length} popups total.`);

        const now = new Date();
        console.log("Current Server Time:", now.toISOString());

        allPopups.forEach(p => {
            console.log("\n--------------------------------");
            console.log(`ID: ${p.id} | Title: ${p.title}`);
            console.log(`Active: ${p.isActive}`);
            console.log(`Start Date: ${p.startDate?.toISOString()}`);
            console.log(`End Date:   ${p.endDate?.toISOString()}`);

            const isTimeValid = (!p.startDate || now >= p.startDate) && (!p.endDate || now <= p.endDate);
            console.log(`Time Valid: ${isTimeValid}`);
            console.log(`Should Show: ${p.isActive && isTimeValid}`);
        });

    } catch (error) {
        console.error("Error clicking DB:", error);
    }
}

checkPopups();
