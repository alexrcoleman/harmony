import { NextApiRequest, NextApiResponse } from "next";
import AudioDispatcher from "../../server/AudioDispatcher";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const user = String(req.query.user);
  const stream = AudioDispatcher.subscribe(user);
  stream.pipe(res);
  req.on('close', () => {
    AudioDispatcher.unsubscribe(user, stream);
  });
};
