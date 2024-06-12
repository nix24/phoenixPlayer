// src/lib/db.ts
import Dexie from 'dexie';
import type { Song } from '$lib/types';
import { browser } from '$app/environment';

export class MyDatabase extends Dexie {
    songs!: Dexie.Table<Song, string>;

    constructor() {
        super('MyDatabase');
        this.version(1).stores({
            songs: 'id, title, artist, album, year, track, duration, size, audioUrl',
        });
    }
}

let dbInstance: MyDatabase | undefined;

export const initDb = async () => {
    if (!dbInstance && browser) {
        dbInstance = new MyDatabase();
        await dbInstance.open();
    }
    return dbInstance;
}
async function retryOperation<T>(
    operation: () => Promise<T>,
    retries = 3,
    delay = 1000
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (retries === 0) {
            throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retryOperation(operation, retries - 1, delay);
    }
}

// Usage example
export const db = await initDb();
