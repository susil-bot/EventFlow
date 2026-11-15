import type { Request, Response } from 'express';
import { requireUser } from '../../middleware/authenticate';
import type {
  CreateEventInput,
  DiscoverEventsQuery,
  EventFacetsQuery,
  UpdateEventInput
} from './schemas';
import * as eventsService from './service';

type IdParams = { id: string };

export const listPublic = async (req: Request, res: Response) => {
  res.json({
    data: await eventsService.listPublicEvents(
      res.locals.query as DiscoverEventsQuery,
      req.user
    )
  });
};

export const facets = async (_req: Request, res: Response) => {
  res.json({
    data: await eventsService.getEventFacets(
      res.locals.query as EventFacetsQuery
    )
  });
};

export const getOne = async (req: Request<IdParams>, res: Response) => {
  res.json({
    data: await eventsService.getEventForViewer(req.params.id, req.user)
  });
};

export const create = async (req: Request, res: Response) => {
  const event = await eventsService.createEvent(
    requireUser(req),
    req.body as CreateEventInput
  );
  res.status(201).json({ data: event });
};

export const update = async (req: Request<IdParams>, res: Response) => {
  res.json({
    data: await eventsService.updateEvent(
      requireUser(req),
      req.params.id,
      req.body as UpdateEventInput
    )
  });
};

export const publish = async (req: Request<IdParams>, res: Response) => {
  res.json({
    data: await eventsService.publishEvent(requireUser(req), req.params.id)
  });
};

export const unpublish = async (req: Request<IdParams>, res: Response) => {
  res.json({
    data: await eventsService.unpublishEvent(requireUser(req), req.params.id)
  });
};

export const cancel = async (req: Request<IdParams>, res: Response) => {
  res.json({
    data: await eventsService.cancelEvent(requireUser(req), req.params.id)
  });
};

export const listMine = async (req: Request, res: Response) => {
  res.json({ data: await eventsService.listOrganizerEvents(requireUser(req)) });
};

export const listAttendees = async (req: Request<IdParams>, res: Response) => {
  res.json({
    data: await eventsService.listEventAttendees(
      requireUser(req),
      req.params.id
    )
  });
};
