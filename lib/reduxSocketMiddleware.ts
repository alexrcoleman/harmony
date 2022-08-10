import { Dispatch } from '@reduxjs/toolkit';
import { Middleware } from 'redux';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '../shared/SocketTypes';
import { HarmonyAction, HarmonyState, serverStore } from './ReduxState';

export type HarmonySocket = Socket<ServerToClientEvents, ClientToServerEvents>;
export type SocketMiddleware = Middleware<TMiddlewareActions, HarmonyState, Dispatch<HarmonyAction>>;
type TMiddlewareActions = { type: 'connect'; };
const reduxSocketMiddleware: SocketMiddleware = store => {
    let socket: HarmonySocket;

    const faceDebouncer = debouncer();

    return next => async (action: HarmonyAction) => {
        const isConnectionEstablished = socket && store.getState().isConnected;

        if (action.type === 'connect') {
            await fetch('/api/socket');
            socket = io();

            socket.on('connect', () => {
                store.dispatch({ type: 'connected' });
            });

            socket.on('updateUser', (user) => {
                store.dispatch({ type: 'user', user });
            });
            socket.on('updateServer', (server) => {
                store.dispatch({ type: 'server', server });
            });

            socket.on('removeUser', (id) => {
                store.dispatch({ type: 'removeUser', id });
            });
        }


        if (isConnectionEstablished) {
            if (action.type === 'login') {
                if (!globalLocalMedia) {
                    await setupWebRTC(socket);
                }
                socket.emit("login", action.id, (success, data) => {
                    if (success && data) {
                        store.dispatch({ type: 'joined', id: action.id, data });
                    } else {
                        alert("Failed to join");
                    }
                });
            }
            if (action.type === 'move') {
                socket.emit('move', { x: action.x, y: action.y });
            }
            if (action.type === 'face') {
                faceDebouncer(() => socket.emit('face', { x: action.x, y: action.y }));
            }
            if (action.type === 'logout') {
                socket.emit('logout');
            }
        }

        // if (chatActions.submitMessage.match(action) && isConnectionEstablished) {
        //     socket.emit(ChatEvent.SendMessage, action.payload.content);
        // }

        next(action);
    };
};

const ICE_SERVERS = [
    { urls: "stun:stun.l.google.com:19302" }
];
const peerStreams: Record<string, MediaStream> = {};
const peers = {};
let globalLocalMedia: MediaStream | null = null;
const audioSettings: { context: AudioContext | null, gainNode: GainNode | null; } = { context: null, gainNode: null };
async function setupWebRTC(socket: HarmonySocket) {
    let context = new AudioContext();
    const baseStream = await navigator.mediaDevices.getUserMedia({ "audio": true });
    // Apply some filtering and gain
    const node = context.createMediaStreamSource(baseStream);
    let filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 167;
    filter.Q.value = .05;
    let filter2 = context.createBiquadFilter();
    filter2.type = "peaking";
    filter2.frequency.value = 167;
    filter2.Q.value = 1;
    filter2.gain.value = 3;
    let filter3 = context.createDynamicsCompressor();

    const gainNode = context.createGain();
    gainNode.gain.value = 1;
    audioSettings.gainNode = gainNode;
    audioSettings.context = context;

    const analyserNode = context.createAnalyser();
    analyserNode.maxDecibels = 0;
    const pcmData = new Float32Array(analyserNode.fftSize);
    const fn = () => {
        analyserNode.getFloatTimeDomainData(pcmData);
        const peak = pcmData.reduce((max, v) => Math.max(max, v));
        serverStore.dispatch({ type: "update_audio", user: '_viewer', volume: peak });
    };
    const interval = setInterval(fn, 100);

    const dest = context.createMediaStreamDestination();
    node.connect(filter).connect(filter2).connect(filter3).connect(gainNode).connect(analyserNode).connect(dest);
    let local_media_stream = globalLocalMedia = dest.stream;

    socket.on('addPeer', function (config) {
        console.log('Signaling server said to add peer:', config);
        var peer_id = config.peer_id;
        if (peer_id in peers) {
            /* This could happen if the user joins multiple channels where the other peer is also in. */
            console.log("Already connected to peer ", peer_id);
            return;
        }
        let peer_connection = new RTCPeerConnection(
            { "iceServers": ICE_SERVERS },
        );
        peers[peer_id] = peer_connection;

        peer_connection.onicecandidate = function (event) {
            if (event.candidate) {
                socket.emit('relayICECandidate', {
                    'peer_id': peer_id,
                    'ice_candidate': {
                        'sdpMLineIndex': event.candidate.sdpMLineIndex,
                        'candidate': event.candidate.candidate
                    }
                });
            }
        };
        peer_connection.ontrack = function (event) {
            console.log("ontrack", event);
            serverStore.dispatch({ type: 'audio_connect', peer_id: peer_id });
            peerStreams[peer_id] = event.streams[0];

            let audio = document.createElement('audio');
            audio.srcObject = peerStreams[peer_id];
            audio.autoplay = false;
            audio.controls = false;
            document.body.appendChild(audio);
        };

        local_media_stream.getTracks().forEach(function (track) {
            peer_connection.addTrack(track, local_media_stream);
        });

        if (config.should_create_offer) {
            console.log("Creating RTC offer to ", peer_id);
            peer_connection.createOffer(
                function (local_description) {
                    console.log("Local offer description is: ", local_description);
                    peer_connection.setLocalDescription(local_description,
                        function () {
                            socket.emit('relaySessionDescription',
                                { 'peer_id': peer_id, 'session_description': local_description });
                            console.log("Offer setLocalDescription succeeded");
                        },
                        function () { alert("Offer setLocalDescription failed!"); }
                    );
                },
                function (error) {
                    console.log("Error sending offer: ", error);
                });
        }

    });


    socket.on('sessionDescription', function (config) {
        console.log('Remote description received: ', config);
        var peer_id = config.peer_id;
        var peer = peers[peer_id];
        var remote_description = config.session_description;
        console.log(config.session_description);

        var desc = new RTCSessionDescription(remote_description);
        var stuff = peer.setRemoteDescription(desc,
            function () {
                console.log("setRemoteDescription succeeded");
                if (remote_description.type == "offer") {
                    console.log("Creating answer");
                    peer.createAnswer(
                        function (local_description) {
                            console.log("Answer description is: ", local_description);
                            peer.setLocalDescription(local_description,
                                function () {
                                    socket.emit('relaySessionDescription',
                                        { 'peer_id': peer_id, 'session_description': local_description });
                                    console.log("Answer setLocalDescription succeeded");
                                },
                                function () { alert("Answer setLocalDescription failed!"); }
                            );
                        },
                        function (error) {
                            console.log("Error creating answer: ", error);
                            console.log(peer);
                        });
                }
            },
            function (error) {
                console.log("setRemoteDescription error: ", error);
            }
        );
        console.log("Description Object: ", desc);

    });

    /**
     * The offerer will send a number of ICE Candidate blobs to the answerer so they 
     * can begin trying to find the best path to one another on the net.
     */
    socket.on('iceCandidate', function (config) {
        var peer = peers[config.peer_id];
        var ice_candidate = config.ice_candidate;
        peer.addIceCandidate(new RTCIceCandidate(ice_candidate as any));
    });


    /**
     * When a user leaves a channel (or is disconnected from the
     * signaling server) everyone will recieve a 'removePeer' message
     * telling them to trash the media channels they have open for those
     * that peer. If it was this client that left a channel, they'll also
     * receive the removePeers. If this client was disconnected, they
     * wont receive removePeers, but rather the
     * signaling_socket.on('disconnect') code will kick in and tear down
     * all the peer sessions.
     */
    socket.on('removePeer', function (peer_id) {
        console.log('Signaling server said to remove peer:', peer_id);
        var peer_id = peer_id;
        if (peer_id in peers) {
            peers[peer_id].close();
        }

        delete peers[peer_id];
        delete peerStreams[peer_id];
    });
}
export function getAudioSettings() {
    return audioSettings;
};
export function getLocalStream() {
    return globalLocalMedia;
}
export function getAudioStream(peerId: string) {
    return peerStreams[peerId];
}

function debouncer() {
    let timeout: NodeJS.Timeout | null = null;
    return (fn) => {
        if (timeout != null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(fn, 250);
    };
}

export default reduxSocketMiddleware;