import { Router } from 'express';
import * as controller from './controller';

/** Public city list under `/api/cities` (powers the city picker). */
export const citiesRouter = Router();

citiesRouter.get('/', controller.list);
