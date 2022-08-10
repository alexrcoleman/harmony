import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { shallowEqual, useSelector } from 'react-redux';
import produce from "immer";
import type { EqualityFn } from 'react-redux';
import { Channel, Server, User } from '../shared/EntTypes';
import reduxSocketMiddleware, { SocketMiddleware } from './reduxSocketMiddleware';

export type HarmonyState = {
    isConnected: boolean;
    isJoined: boolean;
    activeServer: string;
    viewer: string | null;
    users: Record<string, User>;
    channels: Record<string, Channel>;
    servers: Record<string, Server>;
    audioIds: Record<string, string>;
    settings: { isSpatialAudioEnabled: boolean; };
    clientAudioData: Record<string, { isTalking: boolean; volume: number; }>;
};
export type HarmonyAction =
    | {
        type: 'move';
        x: number;
        y: number;
    }
    | {
        type: 'face';
        x: number;
        y: number;
    }
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
    | { type: 'logout'; };
export const serverStore = configureStore<HarmonyState, HarmonyAction, [SocketMiddleware]>({
    reducer: (state, action) => {
        if (!state) {
            throw new Error("No state");
        }
        // console.log('Action: ', action);
        if (action.type === 'update_audio') {
            return produce(state, state => {
                state.clientAudioData[action.user] = { isTalking: action.volume > 0.1, volume: action.volume };
                return state;
            });
        }
        if (action.type === 'move') {
            return produce(state, state => {
                const viewer = state.viewer;
                let newChannel = null;
                for (const channelID of state.servers[state.activeServer].channels) {
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
                state.users[viewer].channel = newChannel;
                state.users[viewer].position = { x: action.x, y: action.y };
                return state;
            });

        }
        if (action.type === 'face') {
            return produce(state, state => {
                const viewer = state.viewer;
                const user = state.users[viewer];
                let dir = { x: action.x - user.position.x, y: action.y - user.position.y };
                if (dir.x == 0 && dir.y == 0) {
                    return state;
                }
                const dot = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
                state.users[viewer].dir = { x: dir.x / dot, y: dir.y / dot };
                return state;
            });
        }
        if (action.type === 'connected') {
            return { ...state, isConnected: true };
        }
        if (action.type === 'joined') {
            return produce(state, state => {
                state.isJoined = true;
                state.viewer = action.id;
                action.data.users.forEach((user) => {
                    state.users[user.id] = user;
                });
                action.data.channels.forEach((c) => {
                    state.channels[c.id] = c;
                });
                state.servers[action.data.server.id] = action.data.server;
                state.activeServer = action.data.server.id;
            });
        }
        if (action.type === 'removeUser') {
            return produce(state, state => {
                delete state.users[action.id];
                return state;
            });
        }
        if (action.type === 'user') {
            return produce(state, state => {
                state.users[action.user.id] = action.user;
                return state;
            });
        }
        if (action.type === 'server') {
            return produce(state, state => {
                state.servers[action.server.id] = action.server;
                return state;
            });
        }
        if (action.type === 'audio_connect') {
            return produce(state, state => {
                state.audioIds[action.peer_id] = String(Math.random());
                return state;
            });
        }
        if (action.type === 'set_spatial_audio') {
            return produce(state, state => {
                state.settings.isSpatialAudioEnabled = action.enabled;
                return state;
            });
        }
        return state;
    },
    preloadedState: {
        isJoined: false,
        isConnected: false,
        activeServer: '',
        viewer: '',
        servers: {},
        channels: {},
        users: {},
        audioIds: {},
        settings: {
            isSpatialAudioEnabled: true
        },
        clientAudioData: {},
    },
    middleware: [reduxSocketMiddleware],
});


export const useHarmonySelector = useSelector as <Selected = unknown>(selector: (state: HarmonyState) => Selected, equalityFn?: EqualityFn<Selected> | undefined) => Selected;