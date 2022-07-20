import express, { Request, Response } from 'express';

import Twilio from '../modules/twilio';

const router = express.Router();

let twilio: Twilio;
export function setTwilio(twi: Twilio) {
  twilio = twi;
}

/**
 * Create a new leased number.
 */
router.post('/', async (request: Request, response: Response) => {
  // request.baseURL is just the current mounted path (poorly named)
  const smsUrl = new URL(
    `${request.baseUrl}/sms`,
    request.app.get('external-base-url')
  );
  const number = await twilio.getAvailableNumber();
  const info = await twilio.reserve(number, 'POST', smsUrl.toString());
  console.log('reserved:', info);
  return response.status(200).send({
    number: info.phoneNumber,
    capabilities: info.capabilities,
  });
});

/**
 * Process an SMS message sent to a leased number.
 */
router.post('/sms', (request: Request, response: Response) => {
  // https://www.twilio.com/docs/usage/webhooks/sms-webhooks
  console.log('barf received SMS:', request.body);
  return response.status(204).send();
});

export default router;
