// src/lib/db.ts
import Dexie from 'dexie';
import type { GlobalQueue, PlayList, Song } from '$lib/types';
import { browser } from '$app/environment';

export class MyDatabase extends Dexie {
    songs!: Dexie.Table<Song, string>;
    playlists!: Dexie.Table<PlayList, string>;
    globalQueue!: Dexie.Table<GlobalQueue, number>;

    constructor() {
        super('MusicDatabase');
        this.version(2).stores({
            songs: '++id, title, artist, album, year, track, duration, size, audioUrl, prevId, nextId',
            playlists: '++id, name, *songs',
            globalQueue: '++id, firstSongId, lastSongId, currentSongId, totalSongs'
        });
    }

    //adding method to filter songs by artist or title or album
    async filterSongs(query: string): Promise<Song[]> {
        const queryLowerCase = query.toLowerCase();

        return this.songs.filter(song =>
            song.title.toLowerCase().includes(queryLowerCase) ||
            song.artist.toLowerCase().includes(queryLowerCase) ||
            song.album.toLowerCase().includes(queryLowerCase)
        ).toArray();
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

// Usage example
export const db = await initDb();
