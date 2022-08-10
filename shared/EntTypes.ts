export type User = {
    id: string;
    name: string;
    socketId: string;
    position: { x: number, y: number; };
    dir: { x: number, y: number; };
    color: string;
    channel: string | null;
};
export type Channel = {
    id: string;
    name: string;
    border: [[number, number], [number, number], [number, number], [number, number]];
};
export type Server = {
    id: string;
    name: string;
    channels: string[];
    users: string[];
    roomDrawing: {};
};