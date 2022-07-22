import express, { Request, Response } from 'express';
import createError from 'http-errors';
import Duration from '@icholy/duration';

import Prisma from '../modules/prisma';
import Twilio from '../modules/twilio';

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
  const router = express.Router();

  /**
   * Get all leased numbers.
   */
  router.get('/', async (_request: Request, response: Response) => {
    const numbers = await prisma.getAllNumbers();
    return response.status(200).send(numbers);
  });

  /**
   * Lease a number.
   */
  router.post('/', async (request: Request, response: Response) => {
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

    const now = new Date();
    const duration = new Duration(lease.duration);
    const expiresAt = new Date(now.getTime() + duration.milliseconds());

    await prisma.leaseE164(e164, lease.wallet, expiresAt);

    return response.status(200).send({ e164 });
  });

  /**
   * Process an SMS message sent to a leased number.
   */
  router.post('/sms', async (request: Request, response: Response) => {
    const now = new Date();

    console.log('Received SMS:', request.body);
    const sms = <SmsBody>request.body;

    if (!sms.To) {
      throw new createError.UnprocessableEntity(
        'SMS received without a destination'
      );
    }

    await prisma.storeMessage(sms.To, sms.From, now, sms.Body);

    return response.status(204).send();
  });

  /**
   * Get SMS messages for a leased number.
   */
  router.get('/sms/:e164', async (request: Request, response: Response) => {
    console.log('barf', request.params, request.query);
    return response.status(200).send();
  });

  return router;
};
