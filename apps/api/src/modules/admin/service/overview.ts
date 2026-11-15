import { pool } from '../../../db/pool';
import { getPlatformStats, listAuditEntries } from '../repository';
import type { AuditQuery } from '../schemas';
import type { AuditEntryDto, PlatformStats } from '../types';
import { toAuditEntryDto } from './mappers';

export const getStats = (): Promise<PlatformStats> => getPlatformStats(pool);

export const listAuditLog = async ({
  limit
}: AuditQuery): Promise<AuditEntryDto[]> =>
  (await listAuditEntries(pool, limit)).map(toAuditEntryDto);
