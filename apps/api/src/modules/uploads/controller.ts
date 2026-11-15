import type { Request, Response } from 'express';
import { requireUser } from '../../middleware/authenticate';
import * as uploadsService from './service';

export const uploadImage = async (req: Request, res: Response) => {
  const body: unknown = req.body;
  const upload = await uploadsService.saveImage(
    requireUser(req),
    Buffer.isBuffer(body) ? body : undefined
  );
  res.status(201).json({ data: upload });
};
