import { Router } from '@awaitjs/express';

import Prisma from '../modules/prisma';

interface messageParams {
  e164: string;
  msgid: string;
}

interface updateBody {
  isRead: boolean;
}

export default (prisma: Prisma) => {
  const router = Router({ mergeParams: true });

  /**
   * Get messages for a leased number.
   */
  router.getAsync('/', async (request, response) => {
    const { e164 } = <messageParams>request.params;
    const messages = await prisma.retrieveMessages(
      `+${e164}`,
      'unread' in request.query
    );
    response.status(200).send(messages);
  });

  /**
   * Update message of a leased number
   */
  router.putAsync('/:msgid', async (request, response) => {
    const params = <messageParams>request.params;
    const { isRead } = <updateBody>request.body;
    await prisma.updateMessage(`+${params.e164}`, parseInt(params.msgid, 10), isRead);
    response.status(204).send();
  });

  return router;
};
