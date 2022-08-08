export type User = {
    id: string;
    socketId: string;
    position: { x: number, y: number; };
    dir: { x: number, y: number; };
    color: string;
    isTalking: boolean;
    channel: string | null;
};
export type Channel = {
    id: string;
    name: string;
    border: [[number, number], [number, number], [number, number], [number, number]];
};
export type Server = {
    id: string;
    channels: string[];
    users: string[];
    roomDrawing: {};
};