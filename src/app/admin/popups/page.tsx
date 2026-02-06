
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { popups } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { select, eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";
import { Trash2, Plus, Calendar, Megaphone } from "lucide-react";
import { saveFile } from "@/lib/file-upload";

export default async function PopupsPage() {
    const session = await getSession();
    if (!session) redirect("/admin/login");

    let popupList = [];
    try {
        popupList = await db.select().from(popups).orderBy(desc(popups.createdAt));
    } catch (e) { /* ignore */ }

    async function createPopup(formData: FormData) {
        "use server";
        const title = formData.get("title") as string;
        const type = formData.get("type") as "event" | "announcement" | "info";
        const content = formData.get("content") as string;

        let imageUrl = "";
        const imageFile = formData.get("imageFile") as File;
        const savedImage = await saveFile(imageFile, "popups");
        if (savedImage) imageUrl = savedImage;

        // Simple handling: activate immediately
        await db.insert(popups).values({
            title, type, content, imageUrl, isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
        });
        revalidatePath("/admin/popups");
    }

    async function deletePopup(formData: FormData) {
        "use server";
        const id = parseInt(formData.get("id") as string);
        await db.delete(popups).where(eq(popups.id, id));
        revalidatePath("/admin/popups");
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Manajemen Popups</h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Create Form */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Buat Popup Baru</CardTitle>
                        <CardDescription>Berita, Event, atau Pengumuman</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={createPopup} className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Judul</Label>
                                <Input name="title" required placeholder="Contoh: Maintenance Server" />
                            </div>

                            <div className="grid gap-2">
                                <Label>Tipe</Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer border p-2 rounded-md hover:bg-muted">
                                        <input type="radio" name="type" value="event" required />
                                        <span className="text-sm">Event</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer border p-2 rounded-md hover:bg-muted">
                                        <input type="radio" name="type" value="announcement" required />
                                        <span className="text-sm">Pengumuman</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer border p-2 rounded-md hover:bg-muted">
                                        <input type="radio" name="type" value="info" required />
                                        <span className="text-sm">Info</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Konten / Pesan (Opsional)</Label>
                                <Textarea name="content" placeholder="Tulis pesan popup di sini (boleh kosong jika ada gambar)..." />
                            </div>

                            <div className="grid gap-2">
                                <Label>Gambar Popup (Opsional)</Label>
                                <Input name="imageFile" type="file" accept="image/*" />
                            </div>

                            <Button type="submit" className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Terbitkan Popup
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Popup Aktif & Riwayat</h2>
                    {popupList.map((popup) => (
                        <Card key={popup.id}>
                            <CardContent className="p-4 flex gap-4">
                                {popup.imageUrl && (
                                    <img src={popup.imageUrl} alt="" className="w-20 h-20 object-cover rounded-md bg-muted" />
                                )}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-bold">{popup.title}</h3>
                                        <Badge variant={popup.isActive ? "default" : "secondary"}>
                                            {popup.type}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{popup.content}</p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        {popup.createdAt?.toLocaleDateString()}
                                    </div>
                                </div>
                                <form action={deletePopup}>
                                    <input type="hidden" name="id" value={popup.id} />
                                    <Button size="icon" variant="destructive" className="h-8 w-8">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    ))}
                    {popupList.length === 0 && (
                        <div className="text-center p-8 border-2 border-dashed rounded-xl text-muted-foreground">
                            Belum ada popup
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
