
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { generalSettings, googleImaConfig, popups } from "@/lib/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, MonitorPlay, MessageSquare } from "lucide-react";
import { sql } from "drizzle-orm";

export default async function AdminDashboard() {
    const session = await getSession();
    if (!session) redirect("/admin/login");

    // Fetch stats (safely handle if tables don't exist yet/empty)
    let imaStatus = false;
    let popupCount = 0;

    try {
        const config = await db.select().from(googleImaConfig).limit(1).then(res => res[0]);
        imaStatus = config?.isActive ?? false;
        popupCount = (await db.select({ count: sql<number>`count(*)` }).from(popups))[0].count;
    } catch (e) {
        console.warn("Tables not ready yet");
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Google Ads System</CardTitle>
                        <MonitorPlay className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${imaStatus ? "text-green-500" : "text-gray-500"}`}>
                            {imaStatus ? "Active" : "Inactive"}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Popup Aktif</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{popupCount}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status System</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">Operational</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
