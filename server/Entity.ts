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
        }
    },
    servers: {
        test: {
            id: 'test',
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
        state.users[id] = { id, socketId, channel: null, color: `rgb(${rand()}, ${rand()}, ${rand()})`, dir: { x: 0, y: 1 }, isTalking: false, position: { x: 50, y: 50 } };
    }
    static removeUser(id: string): void {
        delete state.users[id];
    }
}
function rand() {
    return Math.floor(Math.random() * 256);
}
// const dummyData = {
//     activeServer: 'server1',
//     viewer: 'alexrcoleman',
//     channels: 
// users: {
//     alexrcoleman: { id: "alexrcoleman", position: { x: 630, y: 70; }, dir: { x: 1, y: 0; }, color: 'red', isTalking: false, channel: 'channel2'; },
//     tvh: { id: "tvh", position: { x: 650, y: 90; }, dir: { x: 0, y: 1; }, color: 'pink', isTalking: true, channel: 'channel2'; },
//     Amon: { id: 'Amon', position: { x: 130, y: 80; }, dir: { x: 0.242536, y: 0.970143; }, color: 'purple', isTalking: true, channel: 'channel1'; },
//     jport: { id: 'jport', position: { x: 170, y: 85; }, dir: { x: -0.242536, y: 0.970143; }, color: 'blue', isTalking: true, channel: 'channel1'; },
// }
// };