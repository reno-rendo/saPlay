


import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { googleImaConfig } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import { Settings, Save, AlertCircle } from "lucide-react";
import { sql } from "drizzle-orm";

export default async function AdsPage() {
    const session = await getSession();
    if (!session) redirect("/admin/login");

    let config = await db.select().from(googleImaConfig).limit(1).then(res => res[0]);

    // If no config exists, create default
    if (!config) {
        try {
            await db.insert(googleImaConfig).values({
                isActive: true
            });
            config = await db.select().from(googleImaConfig).limit(1).then(res => res[0]);
        } catch (e) {
            // Table might not exist yet if migration failed
        }
    }

    async function updateConfig(formData: FormData) {
        "use server";
        const prerollVastUrl = formData.get("prerollVastUrl") as string;
        const midrollVastUrl = formData.get("midrollVastUrl") as string;
        const postrollVastUrl = formData.get("postrollVastUrl") as string;
        const bumperVastUrl = formData.get("bumperVastUrl") as string;
        const isActive = formData.get("isActive") === "on";

        if (config) {
            await db.update(googleImaConfig).set({
                prerollVastUrl,
                midrollVastUrl,
                postrollVastUrl,
                bumperVastUrl,
                isActive,
                updatedAt: new Date()
            }).where(sql`id = ${config.id}`);
        }

        revalidatePath("/admin/ads");
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Google IMA Configuration</h1>
                <p className="text-muted-foreground">
                    Konfigurasi VAST Tags untuk iklan video menggunakan Google Interactive Media Ads (IMA) SDK.
                </p>
            </div>

            <Card className="shadow-md border-primary/10">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 pb-6 border-b border-gray-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <Settings className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">Video Ads Settings</span>
                    </div>
                    <CardTitle>VAST Tag URLs</CardTitle>
                    <CardDescription>Masukkan URL VAST dari Google Ad Manager atau AdSense for Video.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form action={updateConfig} className="space-y-8">

                        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                defaultChecked={config?.isActive ?? true}
                                className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                            />
                            <Label htmlFor="isActive" className="font-bold cursor-pointer">Aktifkan Sistem Iklan Video (Global)</Label>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Pre-roll VAST Tag
                                </Label>
                                <Input
                                    name="prerollVastUrl"
                                    defaultValue={config?.prerollVastUrl || ""}
                                    placeholder="https://pubads.g.doubleclick.net/..."
                                    className="font-mono text-xs"
                                />
                                <p className="text-xs text-muted-foreground">Iklan yang muncul <strong>sebelum</strong> video utama dimulai.</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                    Mid-roll VAST Tag
                                </Label>
                                <Input
                                    name="midrollVastUrl"
                                    defaultValue={config?.midrollVastUrl || ""}
                                    placeholder="https://pubads.g.doubleclick.net/..."
                                    className="font-mono text-xs"
                                />
                                <p className="text-xs text-muted-foreground">Iklan yang muncul <strong>di tengah</strong> durasi video (biasanya diatur oleh VMAP).</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    Post-roll VAST Tag
                                </Label>
                                <Input
                                    name="postrollVastUrl"
                                    defaultValue={config?.postrollVastUrl || ""}
                                    placeholder="https://pubads.g.doubleclick.net/..."
                                    className="font-mono text-xs"
                                />
                                <p className="text-xs text-muted-foreground">Iklan yang muncul <strong>setelah</strong> video utama selesai.</p>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Bumper Ads VAST Tag (6s)
                                </Label>
                                <Input
                                    name="bumperVastUrl"
                                    defaultValue={config?.bumperVastUrl || ""}
                                    placeholder="https://pubads.g.doubleclick.net/..."
                                    className="font-mono text-xs"
                                />
                                <p className="text-xs text-muted-foreground">Iklan pendek 6 detik yang tidak bisa di-skip.</p>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end border-t border-gray-100 dark:border-zinc-800">
                            <Button type="submit" className="px-8 font-bold gap-2">
                                <Save className="w-4 h-4" />
                                Simpan Konfigurasi
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 p-4 rounded-lg flex gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                    <p className="font-bold">Catatan Penting:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1 opacity-90">
                        <li>Pastikan domain ini (<code>sekai-drama.netlify.app</code>) sudah disetujui di Google AdSense/Ad Manager.</li>
                        <li>Format VAST yang didukung: VAST 2.0, 3.0, 4.0, dan VMAP.</li>
                        <li>Untuk iklan Native di Grid Drama, gunakan menu <strong>Script & Google Ads</strong>.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
