import type { Request, Response } from 'express';
import { requireUser } from '../../middleware/authenticate';
import type {
  AuditQuery,
  ChangeRoleBody,
  ListEventsQuery,
  ListUsersQuery,
  ReasonBody
} from './schemas';
import * as adminService from './service';

type IdParams = { id: string };

export const stats = async (_req: Request, res: Response) => {
  res.json({ data: await adminService.getStats() });
};

export const listUsers = async (_req: Request, res: Response) => {
  res.json({
    data: await adminService.listUsersForAdmin(
      res.locals.query as ListUsersQuery
    )
  });
};

export const approve = async (req: Request<IdParams>, res: Response) => {
  res.json({
    data: await adminService.approveOrganizer(requireUser(req), req.params.id)
  });
};

export const suspend = async (req: Request<IdParams>, res: Response) => {
  const { reason } = req.body as ReasonBody;
  res.json({
    data: await adminService.suspendUser(
      requireUser(req),
      req.params.id,
      reason
    )
  });
};

export const reactivate = async (req: Request<IdParams>, res: Response) => {
  res.json({
    data: await adminService.reactivateUser(requireUser(req), req.params.id)
  });
};

export const changeRole = async (req: Request<IdParams>, res: Response) => {
  const { role } = req.body as ChangeRoleBody;
  res.json({
    data: await adminService.changeUserRole(
      requireUser(req),
      req.params.id,
      role
    )
  });
};

export const listEvents = async (_req: Request, res: Response) => {
  res.json({
    data: await adminService.listEventsForAdmin(
      res.locals.query as ListEventsQuery
    )
  });
};

export const cancelEvent = async (req: Request<IdParams>, res: Response) => {
  const { reason } = req.body as ReasonBody;
  res.json({
    data: await adminService.cancelEventAsAdmin(
      requireUser(req),
      req.params.id,
      reason
    )
  });
};

export const auditLog = async (_req: Request, res: Response) => {
  res.json({
    data: await adminService.listAuditLog(res.locals.query as AuditQuery)
  });
};
