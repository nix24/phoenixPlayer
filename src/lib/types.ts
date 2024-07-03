export interface Song {
    id: string;
    coverArt: string;
    title: string;
    artist: string;
    album: string;
    year: number;
    track: number;
    duration: number;
    size: number;
    audioUrl: ArrayBuffer;
}

export interface PlayList {
    id: string;
    name: string;
    songs: string[]; //arr of ids
}