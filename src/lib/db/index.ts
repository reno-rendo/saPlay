
import { createClient, Client } from "@libsql/client";
import { drizzle, LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

let _client: Client | null = null;
let _db: LibSQLDatabase<typeof schema> | null = null;

function getClient(): Client {
    if (!_client) {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        if (!url) {
            throw new Error("TURSO_DATABASE_URL environment variable is not set");
        }

        _client = createClient({
            url,
            authToken,
        });
    }
    return _client;
}

export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
    get(_, prop) {
        if (!_db) {
            _db = drizzle(getClient(), { schema });
        }
        return (_db as any)[prop];
    }
});
