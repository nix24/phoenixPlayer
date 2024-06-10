export const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
};

export const formatTime = (time: number) => {
    //takes in seconds and returns a formatted time string in the format "hh:mm:ss"
    const [h, m, s] = [
        Math.floor(time / 3600),
        Math.floor((time % 3600) / 60),
        Math.floor(time % 60)
    ];
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

