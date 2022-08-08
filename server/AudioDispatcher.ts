import fs from 'fs';
import Throttle from 'throttle';
import stream from 'stream';

const streams = {
    jport: 'voice1',
    Amon: 'voice2',
    tvh: 'voice3',
};
export default abstract class AudioDispatcher {
    static broadcasts: Record<string, AudioBroadcast> = {};
    static isStarted = false;
    static subscribe(user: string) {
        if (this.broadcasts[user] == null) {
            this.broadcasts[user] = new AudioBroadcast(user);
        }
        return this.broadcasts[user].subscribe();
    }
    static unsubscribe(user: string, stream: stream.PassThrough) {
        const broadcast = this.broadcasts[user];
        broadcast.unsubscribe(stream);
    }
}

class AudioBroadcast {
    consumers: stream.PassThrough[] = [];
    constructor(private user: string) {
        const file = streams[user];
        if (!file) {
            return;
        }
        const readable = fs.createReadStream(`./public/${file}.mp3`);
        const throttle = new Throttle(160000 / 8);

        readable.pipe(throttle).on('data', (chunk) => {
            // console.log(user + ": Writing to " + this.consumers.length + " consumers");
            for (const writable of this.consumers) {
                writable.write(chunk);
            }
        });
    }
    subscribe() {
        const responseSink = new stream.PassThrough();
        this.consumers.push(responseSink);
        return responseSink;
    }
    unsubscribe(stream: stream.PassThrough) {
        const idx = this.consumers.indexOf(stream);
        if (idx >= 0) {
            this.consumers.splice(idx, 1);
        }
    }
}