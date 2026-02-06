
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { generalSettings } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { revalidatePath } from "next/cache";
import { saveFile } from "@/lib/file-upload";

export default async function SettingsPage() {
    const session = await getSession();
    if (!session) redirect("/admin/login");

    // Fetch current settings (create if not exists)
    // We use findFirst. If empty, we might want to insert a default or handle it in the form.
    let settings = await db.query.generalSettings.findFirst();

    if (!settings) {
        // Attempt to insert default immediately or just render with empty values
        // Inserting default is safer for update logic
        try {
            await db.insert(generalSettings).values({
                siteName: "SekaiDrama"
            });
            settings = await db.query.generalSettings.findFirst();
        } catch (e) {
            // Table might not exist yet
        }
    }

    async function updateSettings(formData: FormData) {
        "use server";

        const siteName = formData.get("siteName") as string;
        const slogan = formData.get("slogan") as string;
        const description = formData.get("description") as string;

        let logoUrl = formData.get("logoUrl") as string; // Keep existing if string passed
        let faviconUrl = formData.get("faviconUrl") as string;

        // Handle File Uploads
        const logoFile = formData.get("logoFile") as File;
        const faviconFile = formData.get("faviconFile") as File;

        const savedLogo = await saveFile(logoFile, "settings");
        if (savedLogo) logoUrl = savedLogo;

        const savedFavicon = await saveFile(faviconFile, "settings");
        if (savedFavicon) faviconUrl = savedFavicon;

        await db.update(generalSettings)
            .set({
                siteName,
                slogan,
                description,
                logoUrl,
                faviconUrl
            })
            // Since we only have one row, we can just update all or where ID=1
            // Ideally we grab the ID from hidden input but here we assume singleton at ID 1 or just update all
            .where(settings?.id ? undefined : undefined); // Drizzle might need a where clause, or update all.

        // Actually safer:
        const current = await db.query.generalSettings.findFirst();
        if (current) {
            await db.update(generalSettings).set({
                siteName, slogan, description, logoUrl, faviconUrl,
                footerText: formData.get("footerText") as string,
                copyrightText: formData.get("copyrightText") as string,
            }).where(sql`id = ${current.id}`);
        } else {
            await db.insert(generalSettings).values({
                siteName, slogan, description, logoUrl, faviconUrl,
                footerText: formData.get("footerText") as string,
                copyrightText: formData.get("copyrightText") as string,
            });
        }

        revalidatePath("/");
        revalidatePath("/admin/settings");
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Pengaturan Umum</h1>
                <p className="text-muted-foreground">
                    Konfigurasi informasi dasar website, metadata SEO, dan branding.
                </p>
            </div>

            <Card className="shadow-md border-primary/10">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-transparent dark:from-zinc-900/50 pb-6 border-b border-gray-100 dark:border-zinc-800">
                    <CardTitle>Metadata Website</CardTitle>
                    <CardDescription>Informasi ini akan muncul di Google dan tab browser.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <form action={updateSettings} className="space-y-8">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="siteName" className="text-base font-semibold">Nama Website</Label>
                                <Input id="siteName" name="siteName" defaultValue={settings?.siteName || ""} placeholder="SekaiDrama" className="h-12 text-lg" />
                                <p className="text-xs text-muted-foreground">Nama brand yang muncul di header.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slogan" className="text-base font-semibold">Slogan</Label>
                                <Input id="slogan" name="slogan" defaultValue={settings?.slogan || ""} placeholder="Nonton Drama Gratis" className="h-12" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-base font-semibold">Deskripsi SEO</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={settings?.description || ""}
                                placeholder="Deskripsi website untuk mesin pencari..."
                                className="resize-none min-h-[100px]"
                            />
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 pt-4 border-t border-gray-100 dark:border-zinc-800">
                            <div className="space-y-3">
                                <Label htmlFor="logoFile" className="font-semibold">Logo Website</Label>
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-4 items-center">
                                        {settings?.logoUrl && (
                                            <div className="w-16 h-16 shrink-0 bg-gray-100 dark:bg-zinc-800 rounded-md p-2 border flex items-center justify-center">
                                                <img src={settings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                            </div>
                                        )}
                                        <Input id="logoFile" name="logoFile" type="file" accept="image/*" />
                                    </div>
                                    <Input type="hidden" name="logoUrl" value={settings?.logoUrl || ""} />
                                    <p className="text-xs text-muted-foreground">Upload gambar baru untuk mengganti.</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="faviconFile" className="font-semibold">Favicon Website</Label>
                                <div className="flex flex-col gap-4">
                                    <div className="flex gap-4 items-center">
                                        {settings?.faviconUrl && (
                                            <div className="w-16 h-16 shrink-0 bg-gray-100 dark:bg-zinc-800 rounded-md p-2 border flex items-center justify-center">
                                                <img src={settings.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain" />
                                            </div>
                                        )}
                                        <Input id="faviconFile" name="faviconFile" type="file" accept="image/*" />
                                    </div>
                                    <Input type="hidden" name="faviconUrl" value={settings?.faviconUrl || ""} />
                                    <p className="text-xs text-muted-foreground">Upload gambar baru untuk mengganti.</p>
                                </div>
                            </div>
                        </div>

                        <Card className="shadow-md border-primary/10">
                            <CardHeader className="bg-gradient-to-r from-gray-50 to-transparent dark:from-zinc-900/50 pb-6 border-b border-gray-100 dark:border-zinc-800">
                                <CardTitle>Pengaturan Footer</CardTitle>
                                <CardDescription>Sesuaikan tampilan bagian bawah website.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-8 space-y-6">
                                {/* Footer Text removed as requested */}
                                <div className="space-y-2">
                                    <Label htmlFor="copyrightText" className="text-base font-semibold">Teks Copyright</Label>
                                    <Input id="copyrightText" name="copyrightText" defaultValue={settings?.copyrightText || "© 2026 MADE WITH ❤️ BY YUSRIL"} />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="pt-6 flex justify-end gap-4">
                            <Button type="submit" className="px-8 font-bold">Simpan Perubahan</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

// Helper to avoid import error in client/server split if needed
import { sql } from "drizzle-orm";
