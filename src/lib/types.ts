export interface Song {
    id?: string;
    coverArt: string;
    title: string;
    artist: string;
    album: string;
    year: number;
    track: number;
    duration: number;
    size: number;
    audioUrl: ArrayBuffer;
    prevId: string | null;
    nextId: string | null;
}

export interface PlayList {
    id: string;
    name: string;
    songs: string[]; //arr of ids
}

export interface GlobalQueue {
    id?: number;
    firstSongId: string | null;
    lastSongId: string | null;
    currentSongId: string | null;
    totalSongs: number;
}