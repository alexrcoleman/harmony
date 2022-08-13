import { HarmonySocket } from "./reduxSocketMiddleware";
import { serverStore } from "./ReduxState";


export type RTCPoolData = { context: AudioContext, gainNode: GainNode; peerStreams: Record<string, MediaStream>; localStream: MediaStream; };
export async function setupWebRTC(socket: HarmonySocket): Promise<RTCPoolData> {
    const peerStreams: Record<string, MediaStream> = {};
    const peers: Record<string, RTCPeerConnection> = {};
    const context = new AudioContext();
    const baseStream = await navigator.mediaDevices.getUserMedia({ "audio": true, });
    baseStream.getAudioTracks()[0].applyConstraints({ noiseSuppression: true });

    let node: AudioNode = context.createMediaStreamSource(baseStream);
    node = applyFilters(node);

    const gainNode = context.createGain();
    gainNode.gain.value = 1;
    node = node.connect(gainNode);

    const analyserNode = context.createAnalyser();
    analyserNode.maxDecibels = 0;
    node = node.connect(analyserNode);

    const dest = context.createMediaStreamDestination();
    node = node.connect(dest);

    const localStream = dest.stream;
    const audioSettings = { context, peerStreams, gainNode, localStream };
    const pcmData = new Float32Array(analyserNode.fftSize);
    const fn = () => {
        analyserNode.getFloatTimeDomainData(pcmData);
        const peak = pcmData.reduce((max, v) => Math.max(max, v));
        serverStore.dispatch({ type: "update_audio", user: '_viewer', volume: dest.stream.getAudioTracks()[0].enabled ? peak : 0 });
    };
    const interval = setInterval(fn, 100);

    socket.on('addPeer', async function (config) {
        const peer_id = config.peer_id;
        if (peer_id in peers) {
            return;
        }
        const peer_connection = new RTCPeerConnection(
            {
                "iceServers": [
                    { urls: "stun:stun.l.google.com:19302" }
                ]
            },
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
            serverStore.dispatch({ type: 'audio_connect', peer_id: peer_id });
            peerStreams[peer_id] = event.streams[0];

            let audio = document.createElement('audio');
            audio.srcObject = peerStreams[peer_id];
            audio.autoplay = false;
            audio.controls = false;
            document.body.appendChild(audio);
        };

        localStream.getTracks().forEach(function (track) {
            peer_connection.addTrack(track, localStream);
        });

        if (config.should_create_offer) {
            const local_description = await peer_connection.createOffer();
            await peer_connection.setLocalDescription(local_description);
            socket.emit('relaySessionDescription', { 'peer_id': peer_id, 'session_description': local_description });
        }

    });


    socket.on('sessionDescription', async function (config) {
        const peer_id = config.peer_id;
        const peer = peers[peer_id];
        const remote_description = config.session_description;

        const desc = new RTCSessionDescription(remote_description);
        await peer.setRemoteDescription(desc);
        console.log("setRemoteDescription succeeded");
        if (remote_description.type == "offer") {
            const local_description = await peer.createAnswer();
            await peer.setLocalDescription(local_description);
            socket.emit('relaySessionDescription', { 'peer_id': peer_id, 'session_description': local_description });
        }
    });

    socket.on('iceCandidate', function (config) {
        const peer = peers[config.peer_id];
        peer.addIceCandidate(new RTCIceCandidate(config.ice_candidate));
    });

    socket.on('removePeer', function (peer_id) {
        if (peer_id in peers) {
            peers[peer_id].close();
        }

        delete peers[peer_id];
        delete peerStreams[peer_id];
    });
    return audioSettings;
}

function applyFilters(node: AudioNode) {
    const bandFilter = node.context.createBiquadFilter();
    bandFilter.type = "bandpass";
    bandFilter.frequency.value = 167;
    bandFilter.Q.value = .05;

    const peakingFilter = node.context.createBiquadFilter();
    peakingFilter.type = "peaking";
    peakingFilter.frequency.value = 167;
    peakingFilter.Q.value = 1;
    peakingFilter.gain.value = 3;

    const dynamicCompressor = node.context.createDynamicsCompressor();

    return node.connect(bandFilter).connect(peakingFilter).connect(dynamicCompressor);
}