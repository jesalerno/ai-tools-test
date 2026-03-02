import {Router} from 'express';

import type {CardController} from '../controllers/cardController';

export function createCardRouter(controller: CardController): Router {
  const router = Router();

  router.get('/methods', controller.listMethods);
  router.post('/generate', controller.generate);
  router.post('/surprise', controller.surprise);

  return router;
}
