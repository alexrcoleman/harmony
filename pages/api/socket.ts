import { Server } from 'socket.io';
import Entity from '../../server/Entity';
import { Channel, User } from '../../shared/EntTypes';
import { ClientToServerEvents, ServerToClientEvents } from '../../shared/SocketTypes';

const SocketHandler = (req, res) => {
    if (res.socket.server.io) {
    } else {
        const io = new Server<ClientToServerEvents, ServerToClientEvents>(res.socket.server);
        io.on('connection', (socket) => {
            let socketUserID;
            const activeServer = 'test';
            socket.onAny((...args) => {
                console.log('Socket message:', args);
            });
            socket.on('login', (id, cb) => {
                const user = Entity.getUser(id);
                if (user != null) {
                    cb(false);
                } else {
                    socketUserID = id;
                    socket.join(activeServer);
                    console.log(socketUserID + " joined " + activeServer + " [" + socket.id + "]");

                    Entity.addUser(id, socket.id);
                    const server = Entity.getServer(activeServer);
                    if (!server) {
                        return;
                    }
                    server.users.push(id);
                    const users = server.users.map(id => Entity.getUser(id)).filter(Boolean) as User[];
                    const channels = server.channels.map(id => Entity.getChannel(id)).filter(Boolean) as Channel[];
                    cb(true, { users, channels, server });

                    const viewer = Entity.getUser(id);
                    if (viewer) {
                        socket.broadcast.emit('updateUser', viewer);
                    }
                    socket.broadcast.emit('updateServer', server);


                    for (let userID of server.users) {
                        if (userID === id) {
                            continue;
                        }
                        const socketId = Entity.getUser(userID)?.socketId ?? 'unknown_socket';
                        io.to(socketId).emit('addPeer', { 'peer_id': socket.id, 'should_create_offer': false });
                        io.to(socket.id).emit('addPeer', { 'peer_id': socketId, 'should_create_offer': true });
                    }
                }
            });
            socket.on('disconnect', () => {
                if (socketUserID) {
                    const server = Entity.getServer(activeServer);
                    if (!server) { return; }
                    server.users = server.users.filter((id) => id !== socketUserID);
                    Entity.removeUser(socketUserID);

                    socket.broadcast.emit('updateServer', server);
                    socket.broadcast.emit('removeUser', socketUserID);
                    socket.broadcast.emit('removePeer', socket.id);

                    console.log(socketUserID + " left " + activeServer);
                }
            });
            socket.on('move', (loc) => {
                const viewer = socketUserID;
                const user = Entity.getUser(viewer);
                if (!user) {
                    return;
                }
                const server = Entity.getServer(activeServer);
                let newChannel: string | null = null;
                for (const channelID of (server?.channels ?? [])) {
                    const channel = Entity.getChannel(channelID);
                    if (!channel) continue;
                    const cnt = [0, 0];
                    for (let i = 0; i < channel.border.length; i++) {
                        const p1 = channel.border[i], p2 = channel.border[(i + 1) % channel.border.length];
                        const vp = [loc.x - p1[0], loc.y - p1[1]];
                        const dot = vp[0] * (p2[0] - p1[0]) + vp[1] * (p2[1] - p1[1]);
                        cnt[dot < 0 ? 0 : 1]++;
                    }
                    if (cnt[0] === 0 || cnt[1] === 0) {
                        newChannel = channelID;
                    }
                }
                user.position = { x: loc.x, y: loc.y };
                user.channel = newChannel;
                io.to(activeServer).emit('updateUser', user);
            });
            socket.on('face', (loc) => {
                const viewer = socketUserID;
                const user = Entity.getUser(viewer);
                if (!user) {
                    return;
                }
                let dir = { x: loc.x - user.position.x, y: loc.y - user.position.y };
                if (dir.x == 0 && dir.y == 0) {
                    return;
                }
                const dot = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
                user.dir = { x: dir.x / dot, y: dir.y / dot };
                io.to(activeServer).emit('updateUser', user);
            });
            socket.on('relayICECandidate', function (config) {
                var peer_id = config.peer_id;
                var ice_candidate = config.ice_candidate;
                console.log("[" + socket.id + "] relaying ICE candidate to [" + peer_id + "] ", ice_candidate);
                io.to(peer_id).emit('iceCandidate', { 'peer_id': socket.id, 'ice_candidate': ice_candidate });
            });

            socket.on('relaySessionDescription', function (config) {
                var peer_id = config.peer_id;
                var session_description = config.session_description;
                console.log("[" + socket.id + "] relaying session description to [" + peer_id + "] ", session_description);

                io.to(peer_id).emit('sessionDescription', { 'peer_id': socket.id, 'session_description': session_description });
            });
            socket.on('set_muted', (muted) => {
                const viewer = socketUserID;
                const user = Entity.getUser(viewer);
                if (!user) {
                    return;
                }
                user.isMuted = muted;
                io.to(activeServer).emit('updateUser', user);
            });
        });
        res.socket.server.io = io;
    };
    res.end();
};

export default SocketHandler;