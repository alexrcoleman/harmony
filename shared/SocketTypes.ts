import { Channel, Server, User } from "./EntTypes";

export type ServerToClientEvents = {
    updateUser: (user: User) => void;
    removeUser: (id: string) => void;
    updateServer: (server: Server) => void;
    addPeer: (data: { peer_id: string, should_create_offer: boolean; }) => void;
    sessionDescription: (data: { peer_id: string, session_description: RTCSessionDescriptionInit; }) => void;
    iceCandidate: (data: { peer_id: string, ice_candidate: unknown; }) => void;
    removePeer: (id: string) => void;

};
export type ClientToServerEvents = {
    login: (id: string, cb: (success: boolean, data?: { users: User[], server: Server, channels: Channel[]; }) => void) => void;
    logout: () => void;
    move: (loc: { x: number, y: number; }) => void;
    face: (loc: { x: number, y: number; }) => void;
    relaySessionDescription: (data: { peer_id: string, session_description: RTCSessionDescriptionInit; }) => void;
    relayICECandidate: (data: { peer_id: string, ice_candidate: unknown; }) => void;
    set_muted: (muted: boolean) => void;
}; 