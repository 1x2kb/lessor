import { Router } from '@awaitjs/express';
import createError from 'http-errors';
import Duration from '@icholy/duration';

import Prisma from '../modules/prisma';
import Twilio from '../modules/twilio';

import messages from './messages';

interface LeaseBody {
  wallet: string;
  duration: string;
}

interface SmsBody {
  From: string;
  To: string;
  Body: string;
}

export default (prisma: Prisma, twilio: Twilio) => {
  const router = Router();

  /**
   * Get all leased numbers.
   */
  router.getAsync('/', async (_request, response) => {
    const numbers = await prisma.getAllNumbers();
    response.status(200).send(numbers);
  });

  /**
   * Lease a number.
   */
  router.postAsync('/', async (request, response) => {
    const lease = <LeaseBody>request.body;
    if (!lease.wallet || !lease.duration) {
      throw new createError.UnprocessableEntity(
        'Request to lease must provide a wallet and a duration'
      );
    }

    let e164 = await prisma.getAvailableE164();
    if (e164) {
      console.log('Using available number:', e164);
    } else {
      // request.baseURL is just the current mounted path (poorly named)
      const smsUrl = new URL(
        `${request.baseUrl}/sms`,
        request.app.get('external-base-url')
      );
      e164 = await twilio.getAvailableNumber();
      const info = await twilio.reserve(e164, 'POST', smsUrl.toString());
      console.log('Reserved new number:', info);
    }

    const year = lease.duration.match(/^(\d+)y$/);
    if (year) {
      const days = Math.round(parseInt(year[1], 10) * 365.25);
      lease.duration = `${days}d`;
    }

    const now = new Date();
    const duration = new Duration(lease.duration);
    const expiresAt = new Date(now.getTime() + duration.milliseconds());

    await prisma.leaseE164(e164, lease.wallet, expiresAt);

    response.status(200).send({ e164 });
  });

  /**
   * Process an SMS message sent to a leased number.
   */
  router.postAsync('/sms', async (request, response) => {
    const now = new Date();

    console.log('Received SMS:', request.body);
    const sms = <SmsBody>request.body;

    if (!sms.To) {
      throw new createError.UnprocessableEntity(
        'SMS received without a destination'
      );
    }

    await prisma.storeMessage(sms.To, sms.From, now, sms.Body);

    response.status(204).send();
  });

  /**
   * Get details about a number.
   */
  router.getAsync('/:e164', async (request, response) => {
    const number = await prisma.getNumber(`+${request.params.e164}`);
    response.status(200).send(number);
  });

  /**
   * Release a leased number.
   */
  router.deleteAsync('/:e164', async (request, response, _next) => {
    await prisma.releaseNumber(`+${request.params.e164}`);
    response.status(204).send();
  });

  router.use('/:e164/messages', messages(prisma));

  return router;
};
