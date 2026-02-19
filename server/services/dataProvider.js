import { getDb } from "../utils/db.js";
import * as localDb from "../utils/localDb.js";
import { ObjectId } from "mongodb";

// DataProvider fetches from BOTH MongoDB and local db.json
export const provider = {
    async find(collection, filter = {}) {
        const results = [];
        
        // Try MongoDB first
        const db = getDb();
        if (db) {
            try {
                const mongoResults = await db.collection(collection).find(filter).toArray();
                results.push(...mongoResults);
            } catch (e) {
                console.warn(`MongoDB find error for ${collection}:`, e.message);
            }
        }
        
        // Also fetch from local db.json
        try {
            const localResults = await localDb.find(collection, filter);
            // Merge results and remove duplicates (by _id or id)
            const existingIds = new Set(results.map(r => (r._id || r.id)?.toString()));
            for (const item of localResults) {
                const itemId = (item._id || item.id)?.toString();
                if (!existingIds.has(itemId)) {
                    results.push(item);
                }
            }
        } catch (e) {
            console.warn(`Local db find error for ${collection}:`, e.message);
        }
        
        return results;
    },

    async findOne(collection, filter = {}) {
        // Try MongoDB first
        const db = getDb();
        if (db) {
            try {
                // support _id string
                let mongoFilter = { ...filter };
                if (mongoFilter._id && typeof mongoFilter._id === "string") {
                    try { mongoFilter._id = new ObjectId(mongoFilter._id); } catch (e) {}
                }
                const result = await db.collection(collection).findOne(mongoFilter);
                if (result) return result;
            } catch (e) {
                console.warn(`MongoDB findOne error for ${collection}:`, e.message);
            }
        }
        
        // Fall back to local db.json
        try {
            return await localDb.findOne(collection, filter);
        } catch (e) {
            console.warn(`Local db findOne error for ${collection}:`, e.message);
            return null;
        }
    },

    async insertOne(collection, doc) {
        let mongoResult = null;
        let localResult = null;
        
        // Insert to MongoDB
        const db = getDb();
        if (db) {
            try {
                mongoResult = await db.collection(collection).insertOne(doc);
            } catch (e) {
                console.warn(`MongoDB insertOne error for ${collection}:`, e.message);
            }
        }
        
        // Also insert to local db.json (as backup/fallback)
        try {
            localResult = await localDb.insertOne(collection, doc);
        } catch (e) {
            console.warn(`Local db insertOne error for ${collection}:`, e.message);
        }
        
        // Return MongoDB result if available, otherwise local result
        return mongoResult || localResult || { insertedId: doc._id || doc.id };
    },

    async updateOne(collection, filter = {}, updates = {}) {
        let mongoResult = null;
        let localResult = null;
        
        // Update in MongoDB
        const db = getDb();
        if (db) {
            try {
                let mongoFilter = { ...filter };
                if (mongoFilter._id && typeof mongoFilter._id === "string") {
                    try { mongoFilter._id = new ObjectId(mongoFilter._id); } catch (e) {}
                }
                mongoResult = await db.collection(collection).updateOne(mongoFilter, { $set: updates });
            } catch (e) {
                console.warn(`MongoDB updateOne error for ${collection}:`, e.message);
            }
        }
        
        // Also update in local db.json
        try {
            localResult = await localDb.updateOne(collection, filter, updates);
        } catch (e) {
            console.warn(`Local db updateOne error for ${collection}:`, e.message);
        }
        
        // Return MongoDB result if available, otherwise local result
        return mongoResult || localResult || { matchedCount: 0, modifiedCount: 0 };
    },

    async deleteOne(collection, filter = {}) {
        let mongoResult = null;
        let localResult = null;
        
        // Delete from MongoDB
        const db = getDb();
        if (db) {
            try {
                let mongoFilter = { ...filter };
                if (mongoFilter._id && typeof mongoFilter._id === "string") {
                    try { mongoFilter._id = new ObjectId(mongoFilter._id); } catch (e) {}
                }
                mongoResult = await db.collection(collection).deleteOne(mongoFilter);
            } catch (e) {
                console.warn(`MongoDB deleteOne error for ${collection}:`, e.message);
            }
        }
        
        // Also delete from local db.json
        try {
            localResult = await localDb.deleteOne(collection, filter);
        } catch (e) {
            console.warn(`Local db deleteOne error for ${collection}:`, e.message);
        }
        
        // Return MongoDB result if available, otherwise local result
        return mongoResult || localResult || { deletedCount: 0 };
    }
};
