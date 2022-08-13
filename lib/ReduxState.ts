import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import produce from "immer";
import type { EqualityFn } from 'react-redux';
import { Channel, Server, User } from '../shared/EntTypes';
import reduxSocketMiddleware, { SocketMiddleware } from './reduxSocketMiddleware';

export type HarmonyState = {
    isConnected: boolean;
    isJoined: boolean;
    users: { viewer: string | null; entities: Record<string, User>; };
    channels: Record<string, Channel>;
    servers: { activeServer: string, entities: Record<string, Server>; };
    audioIds: Record<string, string>;
    settings: { isSpatialAudioEnabled: boolean; gainAdjustments: Record<string, number>; isMuted: boolean; localInputGain: number; };
    clientAudioData: Record<string, { isTalking: boolean; volume: number; }>;
};
export type HarmonyAction =
    | { type: 'move'; x: number; y: number; }
    | { type: 'face'; x: number; y: number; }
    | { type: 'connect'; }
    | { type: 'connected'; }
    | { type: 'joined'; id: string; data: { users: User[], server: Server, channels: Channel[]; }; }
    | { type: 'user'; user: User; }
    | { type: 'server'; server: Server; }
    | { type: 'removeUser'; id: string; }
    | { type: 'login'; id: string; }
    | { type: 'audio_connect'; peer_id: string; }
    | { type: 'set_spatial_audio', enabled: boolean; }
    | { type: 'update_audio', volume: number; user: string; }
    | { type: 'settings/setMuted'; isMuted: boolean; }
    | { type: 'settings/updateGainAdjustment'; user: string; volume: number; }
    | { type: 'settings/updateLocalInputGain', volume: number; }
    | { type: 'rtc/subscribeToPeerStream', handler: (stream: MediaStream) => void, peerId: string; }
    | { type: 'logout'; };

const childReducer = combineReducers<HarmonyState, HarmonyAction>({
    isConnected: (state = false, action: HarmonyAction) => {
        if (action.type === 'connected') {
            return true;
        }
        return state;
    },
    users: (state = { viewer: null, entities: {} }, action) => {
        if (action.type === 'removeUser') {
            return produce(state, state => {
                delete state.entities[action.id];
                return state;
            });
        }
        if (action.type === 'user') {
            return produce(state, state => {
                state.entities[action.user.id] = action.user;
                return state;
            });
        }
        if (action.type === 'joined') {
            return produce(state, state => {
                state.viewer = action.id;
                action.data.users.forEach((user) => {
                    state.entities[user.id] = user;
                });
            });
        }

        if (action.type === 'face') {
            return produce(state, state => {
                const viewer = state.viewer;
                if (!viewer) {
                    return state;
                }
                const user = state.entities[viewer];
                let dir = { x: action.x - user.position.x, y: action.y - user.position.y };
                if (dir.x == 0 && dir.y == 0) {
                    return state;
                }
                const dot = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
                state.entities[viewer].dir = { x: dir.x / dot, y: dir.y / dot };
                return state;
            });
        }
        return state;
    },
    audioIds: (state = {}, action) => {
        if (action.type === 'audio_connect') {
            return produce(state, state => {
                state[action.peer_id] = String(Math.random());
                return state;
            });
        }
        return state;
    },
    channels: (state = {}, action) => {
        if (action.type === 'joined') {
            return produce(state, state => {
                action.data.channels.forEach((c) => {
                    state[c.id] = c;
                });
            });
        }
        return state;
    },
    clientAudioData: (state = {}, action) => {
        if (action.type === 'update_audio') {
            return produce(state, state => {
                state[action.user] = { isTalking: action.volume > 0.1, volume: action.volume };
                return state;
            });
        }
        return state;
    },
    isJoined: (state = false, action) => {
        if (action.type === 'joined') {
            return true;
        }
        return state;
    },
    servers: (state = {
        activeServer: '',
        entities: {}
    }, action) => {
        if (action.type === 'joined') {
            return produce(state, state => {
                state.activeServer = action.data.server.id;
                state.entities[action.data.server.id] = action.data.server;
                return state;
            });
        }
        if (action.type === 'server') {
            return produce(state, state => {
                state.entities[action.server.id] = action.server;
                return state;
            });
        }
        return state;
    },
    settings: (state = {
        isSpatialAudioEnabled: true,
        gainAdjustments: {},
        isMuted: false,
        localInputGain: 1,
    }, action) => {
        if (action.type === 'settings/setMuted') {
            return produce(state, state => {
                state.isMuted = action.isMuted;
                return state;
            });
        }
        if (action.type === 'settings/updateLocalInputGain') {
            return produce(state, state => {
                state.localInputGain = action.volume / 100;
                return state;
            });
        }
        if (action.type === 'settings/updateGainAdjustment') {
            return produce(state, state => {
                state.gainAdjustments[action.user] = action.volume / 100;
                return state;
            });
        }
        if (action.type === 'set_spatial_audio') {
            return produce(state, state => {
                state.isSpatialAudioEnabled = action.enabled;
                return state;
            });
        }
        return state;
    },
});
export const serverStore = configureStore<HarmonyState, HarmonyAction, [SocketMiddleware]>({
    reducer: (state, action) => {
        state = childReducer(state, action);
        // Root actions:
        if (action.type === 'move') {
            return produce(state, state => {
                const viewer = state.users.viewer;
                if (!viewer) {
                    return state;
                }
                let newChannel: string | null = null;
                const servers = state.servers;
                for (const channelID of servers.entities[servers.activeServer].channels) {
                    const channel = state.channels[channelID];
                    const cnt = [0, 0];
                    for (let i = 0; i < channel.border.length; i++) {
                        const p1 = channel.border[i], p2 = channel.border[(i + 1) % channel.border.length];
                        const vp = [action.x - p1[0], action.y - p1[1]];
                        const dot = vp[0] * (p2[0] - p1[0]) + vp[1] * (p2[1] - p1[1]);
                        cnt[dot < 0 ? 0 : 1]++;
                    }
                    if (cnt[0] === 0 || cnt[1] === 0) {
                        newChannel = channelID;
                    }
                }
                state.users.entities[viewer].channel = newChannel;
                state.users.entities[viewer].position = { x: action.x, y: action.y };
                return state;
            });
        }
        return state;
    }
    ,
    preloadedState: {},
    middleware: [reduxSocketMiddleware],
});

export function serverSelector(state: HarmonyState): Server | undefined {
    return state.servers.entities[state.servers.activeServer];
}
export function userSelector(state: HarmonyState, userID: string): User | undefined {
    return state.users.entities[userID];
}
export function viewerSelector(state: HarmonyState): User | undefined {
    return userSelector(state, state.users.viewer ?? '');
}

export const useHarmonySelector = useSelector as <Selected = unknown>(selector: (state: HarmonyState) => Selected, equalityFn?: EqualityFn<Selected> | undefined) => Selected;