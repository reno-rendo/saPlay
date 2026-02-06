
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { adScripts } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { revalidatePath } from "next/cache";
import { Trash2, Plus, Code, Eye, EyeOff } from "lucide-react";
import { eq, desc } from "drizzle-orm";

export default async function ScriptsPage() {
    const session = await getSession();
    if (!session) redirect("/admin/login");

    let scriptList: typeof adScripts.$inferSelect[] = [];
    try {
        scriptList = await db.select().from(adScripts).orderBy(desc(adScripts.createdAt));
    } catch (e) {
        // Table might not exist yet
    }

    async function createScript(formData: FormData) {
        "use server";
        const title = formData.get("title") as string;
        const code = formData.get("code") as string;
        const position = formData.get("position") as string;

        await db.insert(adScripts).values({
            title,
            code,
            position,
            isActive: true
        });
        revalidatePath("/admin/scripts");
    }

    async function deleteScript(formData: FormData) {
        "use server";
        const id = parseInt(formData.get("id") as string);
        await db.delete(adScripts).where(eq(adScripts.id, id));
        revalidatePath("/admin/scripts");
    }

    async function toggleStatus(formData: FormData) {
        "use server";
        const id = parseInt(formData.get("id") as string);
        const currentStatus = formData.get("isActive") === "true";
        await db.update(adScripts).set({ isActive: !currentStatus }).where(eq(adScripts.id, id));
        revalidatePath("/admin/scripts");
    }

    // Group scripts by position
    const scriptsByPosition = scriptList.reduce((acc, script) => {
        if (!acc[script.position]) acc[script.position] = [];
        acc[script.position].push(script);
        return acc;
    }, {} as Record<string, typeof scriptList>);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Script & Google Ads Manager</h1>
                <p className="text-muted-foreground">
                    Kelola kode iklan pihak ketiga (seperti AdSense) atau script custom lainnya. Script akan di-inject otomatis ke posisi yang dipilih.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Create Form - Sidebar Style */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-8 shadow-md border-primary/20">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Plus className="w-5 h-5 text-primary" />
                                Tambah Script
                            </CardTitle>
                            <CardDescription>Paste kode iklan atau script di sini.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form action={createScript} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label>Nama Label</Label>
                                    <Input name="title" required placeholder="Ex: Google Ads Head" className="bg-background" />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Posisi Penempatan</Label>
                                    <Select name="position" required defaultValue="head">
                                        <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="head">Global &lt;head&gt; (Auto Ads)</SelectItem>
                                            <SelectItem value="below_header">Below Header (Top Banner)</SelectItem>
                                            <SelectItem value="below_player">Below Player (Video Page)</SelectItem>
                                            <SelectItem value="footer">Above Footer (Bottom Banner)</SelectItem>
                                            <SelectItem value="custom">Custom Position</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-muted-foreground">
                                        Pilih <strong>Global Head</strong> untuk script verifikasi atau Auto Ads.
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Kode Script / HTML</Label>
                                    <Textarea
                                        name="code"
                                        required
                                        placeholder="<script>...</script>"
                                        className="font-mono text-xs h-60 bg-zinc-950 text-green-400 border-zinc-800 resize-none p-4"
                                    />
                                </div>

                                <Button type="submit" className="w-full font-semibold shadow-sm">
                                    Simpan & Aktifkan
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* List - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {Object.entries(scriptsByPosition).length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl border-gray-200 dark:border-zinc-800 text-center space-y-4 bg-gray-50/50 dark:bg-zinc-900/50">
                            <div className="p-4 bg-white dark:bg-zinc-800 rounded-full shadow-sm">
                                <Code className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-semibold text-lg">Belum ada script</h3>
                                <p className="text-sm text-muted-foreground max-w-sm">
                                    Mulai dengan menambahkan script Google Ads atau banner HTML di form sebelah kiri.
                                </p>
                            </div>
                        </div>
                    ) : (
                        Object.entries(scriptsByPosition).map(([pos, scripts]) => (
                            <div key={pos} className="space-y-3">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary/50" />
                                    Posisi: {pos.replace('_', ' ')}
                                </h3>
                                <div className="grid gap-4">
                                    {scripts.map((script) => (
                                        <Card key={script.id} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary overflow-hidden">
                                            <CardContent className="p-0 flex">
                                                <div className="p-4 flex-1 min-w-0 space-y-2">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-bold text-gray-900 dark:text-gray-100">{script.title}</h4>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${script.isActive
                                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                                    }`}>
                                                                    {script.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground mt-1 font-mono bg-muted/50 inline-block px-1.5 py-0.5 rounded">
                                                                {script.code.length} chars
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <form action={toggleStatus}>
                                                                <input type="hidden" name="id" value={script.id} />
                                                                <input type="hidden" name="isActive" value={String(script.isActive)} />
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-primary">
                                                                    {script.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                                </Button>
                                                            </form>
                                                            <form action={deleteScript}>
                                                                <input type="hidden" name="id" value={script.id} />
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </form>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <pre className="text-[10px] font-mono text-muted-foreground bg-gray-50 dark:bg-zinc-950 p-3 rounded-md overflow-hidden h-16 w-full select-all">
                                                            {script.code}
                                                        </pre>
                                                        <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-zinc-950 to-transparent pointer-events-none" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
