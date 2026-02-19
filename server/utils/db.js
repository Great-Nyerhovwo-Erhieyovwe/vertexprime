import { MongoClient } from "mongodb";

// MongoDB helper: connect and expose `db` instance..
let client = null;
let db = null;

export async function connectMongo(uri, dbName) {
    if (!uri) return null;
    try {
        client = new MongoClient(uri);
        await client.connect();
        db = client.db(dbName);
        console.log("✅ Connected to MongoDB");
        return db;
    } catch (err) {
        console.error("MongoDB connection error:", err.message || err);
        client = null;
        db = null;
        return null;
    }
}

export function getDb() {
    return db;
}

export async function closeMongo() {
    if (client) await client.close();
    client = null;
    db = null;
}
