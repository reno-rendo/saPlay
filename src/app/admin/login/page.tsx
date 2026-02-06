
import { loginAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
// import bcrypt from "bcryptjs"; // Import dynamically to avoid build issues if not installed yet

export default function AdminLoginPage() {
    async function handleLogin(formData: FormData) {
        "use server";

        // START: Seed first admin if none exists (Auto-setup for user convenience)
        // In a real app, this should be a separate script, but here we do it lazily
        // We can't easily use bcrypt here without it being installed. 
        // Assuming installation is done by the time this runs.
        const bcrypt = await import("bcryptjs");

        const userCount = await db.select().from(admins).all();
        if (userCount.length === 0) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await db.insert(admins).values({
                username: "admin",
                passwordHash: hashedPassword
            });
            console.log("Seeded default admin user: admin / admin123");
        }
        // END: Seed

        const username = formData.get("username") as string;
        const password = formData.get("password") as string;

        const user = await db.query.admins.findFirst({
            where: eq(admins.username, username)
        });

        if (!user) {
            return redirect("/admin/login?error=Invalid credentials");
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return redirect("/admin/login?error=Invalid credentials");
        }

        await loginAdmin(user.id, user.username);
        redirect("/admin");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-zinc-950 p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-zinc-800">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-primary mb-2">Admin Login</h1>
                    <p className="text-gray-500 text-sm">Masuk untuk mengelola website</p>
                </div>

                <form action={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Username</label>
                        <input
                            name="username"
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-all"
                    >
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    );
}
