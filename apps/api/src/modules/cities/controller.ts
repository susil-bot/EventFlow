import type { Request, Response } from 'express';
import * as citiesService from './service';

export const list = async (_req: Request, res: Response) => {
  // Cheap to compute, but counts change; let browsers reuse it briefly.
  res.set('Cache-Control', 'public, max-age=60');
  res.json({ data: await citiesService.listCities() });
};
