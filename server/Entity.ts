import { Channel, Server, User } from "../shared/EntTypes";

type BackendState = {
    users: Record<string, User>;
    channels: Record<string, Channel>;
    servers: Record<string, Server>;
};
const state: BackendState = {
    users: {
    },
    channels: {
        'channel1': {
            id: 'channel1',
            name: 'general',
            border: [[90, 20], [390, 20], [390, 320], [90, 320]],
        },
        'channel2': {
            id: 'channel2',
            name: 'dota 2',
            border: [[90 + 300, 20], [390 + 300, 20], [390 + 300, 320], [90 + 300, 320]],
        },
        'channel3': {
            id: 'channel3',
            name: 'sidebar',
            border: [[1000, 80], [1050, 80], [1050, 200], [1000, 200]],
        },
        'channel4': {
            id: 'channel4',
            name: 'valorant',
            border: [[90 + 300, 20 + 300], [390 + 300, 20 + 300], [390 + 300, 320 + 300], [90 + 300, 320 + 300]],
        }
    },
    servers: {
        test: {
            id: 'test',
            name: 'CHAD/ROMANIA',
            channels: ['channel1', 'channel2', 'channel3'],
            roomDrawing: {},
            users: [],
        },
    },
};
export default abstract class Entity {
    static getState(): BackendState {
        return state;
    }
    static getUser(id: string): User | null {
        return state.users[id] ?? null;
    }
    static getServer(id: string): Server | null {
        return state.servers[id] ?? null;
    }
    static getChannel(id: string): Channel | null {
        return state.channels[id] ?? null;
    }
    static addUser(id: string, socketId: string): void {
        state.users[id] = { id, name: id, socketId, channel: null, color: `rgb(${rand()}, ${rand()}, ${rand()})`, dir: { x: 0, y: 1 }, position: { x: 50, y: 50 } };
    }
    static removeUser(id: string): void {
        delete state.users[id];
    }
}
function rand() {
    return Math.floor(Math.random() * 256);
}