import type { Request, Response } from 'express';
import { requireUser } from '../../middleware/authenticate';
import type { RegisterInput } from './schemas';
import * as registrationsService from './service';

type IdParams = { id: string };

export const register = async (req: Request<IdParams>, res: Response) => {
  const registration = await registrationsService.register(
    requireUser(req),
    req.params.id,
    (req.body as RegisterInput).slotId
  );
  res.status(201).json({ data: registration });
};

export const cancel = async (req: Request<IdParams>, res: Response) => {
  res.json({
    data: await registrationsService.cancelRegistration(
      requireUser(req),
      req.params.id
    )
  });
};

export const listMine = async (req: Request, res: Response) => {
  res.json({
    data: await registrationsService.listMyUpcomingRegistrations(
      requireUser(req)
    )
  });
};
