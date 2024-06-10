import type { Song } from "./types"
import { v4 as uuidv4 } from 'uuid';

//create an array of 10 copies of the dummy data
export const dummyDataArray = Array.from({ length: 10 }, () => ({
    id: uuidv4(),
    title: `Song ${Math.floor(Math.random() * 1000)}`,
    artist: "Artist 1",
    album: "Album 1",
    year: 2022,
    track: 1,
    duration: Math.floor(Math.random() * 600),
    size: Math.floor(Math.random() * 1000000),
    coverArt: "",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
})) as Song[];

