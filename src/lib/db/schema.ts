
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const generalSettings = sqliteTable("general_settings", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    siteName: text("site_name").notNull().default("SekaiDrama"),
    logoUrl: text("logo_url"),
    faviconUrl: text("favicon_url"),
    slogan: text("slogan"),
    description: text("description"),
    footerText: text("footer_text"),
    copyrightText: text("copyright_text"),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .default(sql`(strftime('%s', 'now'))`)
        .$onUpdate(() => new Date()),
});


export const googleImaConfig = sqliteTable("google_ima_config", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    prerollVastUrl: text("preroll_vast_url"),
    midrollVastUrl: text("midroll_vast_url"),
    postrollVastUrl: text("postroll_vast_url"),
    bumperVastUrl: text("bumper_vast_url"),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const popups = sqliteTable("popups", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    type: text("type", { enum: ["event", "announcement", "info"] }).notNull(),
    content: text("content"),
    imageUrl: text("image_url"),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    startDate: integer("start_date", { mode: "timestamp" }),
    endDate: integer("end_date", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const admins = sqliteTable("admins", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    username: text("username").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});

export const adScripts = sqliteTable("ad_scripts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    code: text("code").notNull(),
    position: text("position", { enum: ["head", "footer", "below_player", "sidebar", "custom", "native_grid"] }).notNull(),
    isActive: integer("is_active", { mode: "boolean" }).default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});
