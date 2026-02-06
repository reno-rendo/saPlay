
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function saveFile(file: File, folder: string = "uploads"): Promise<string | null> {
    if (!file || file.size === 0 || file.name === "undefined") return null;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = file.name.split('.').pop();
    const filename = `${randomUUID()}.${ext}`;

    // Ensure directory exists
    const uploadDir = join(process.cwd(), "public", folder);
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {
        // Ignore if exists
    }

    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return `/${folder}/${filename}`;
}
